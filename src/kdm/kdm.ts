import { CTRMemory, CTRBinarySerializable } from "libctr";
import { RadianteKDMF32 } from "#kdm/common/primitive/kdm-f32";
import { RadianteKDMI32 } from "#kdm/common/primitive/kdm-i32";
import { RadianteKDMString } from "#kdm/common/primitive/kdm-string";
import type { RadianteKDMStructConstructor } from "#kdm/common/kdm-struct";
import type { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";
import { RadianteKDMI32Parameter } from "#kdm/common/parameter/kdm-i32-parameter";
import { RadianteKDMF32Parameter } from "#kdm/common/parameter/kdm-f32-parameter";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";
import { RadianteKDMStructArrayPointer } from "#kdm/common/primitive/kdm-struct-array-pointer";

import type {
  RadianteKDMEntity,
  RadianteKDMEntityConstructor
} from "#kdm/common/kdm-entity";

const RADIANTE_KDM_MAGIC = [
  0x4b, 0x44, 0x4d, 0x52, 0x00, 0x01, 0x01, 0x00
] as const;

type RadianteKDMParameter = RadianteKDMF32Parameter | RadianteKDMI32Parameter;

interface RadianteKDMBuildContext {
  instance: RadianteKDM;
  pointers: Map<RadianteKDMPointer, number>;
  types: Map<RadianteKDMEntityConstructor, number>;
  entities: Map<
    RadianteKDMEntity | RadianteKDMEntity[] | RadianteKDMEntityConstructor,
    number
  >;
}

interface RadianteKDMParseContext {
  instance: RadianteKDM;
  strings: Map<number, string>;
  arrays: Map<number, RadianteKDMEntity[]>;
  pointers: Map<number, RadianteKDMPointer>;
}

type RadianteKDMSectionOffsets = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

interface RadianteKDMHeader {
  section0: number;
  section1: number;
  section2: number;
  section3: number;
  section4: number;
  section5: number;
  section6: number;
  section7: number;
  magic: typeof RADIANTE_KDM_MAGIC;
  sections: RadianteKDMSectionOffsets;
}

abstract class RadianteKDM<S = unknown> extends CTRBinarySerializable<S> {
  private static readonly SECTION_COUNT = 8;
  private static readonly HEADER_SIZE = 0x28;
  private static readonly MAGIC = new CTRMemory(RADIANTE_KDM_MAGIC);

  public constant: number;
  public readonly strings: Map<string, number>;
  public readonly parameters: RadianteKDMParameter[];
  public readonly arrays: Map<RadianteKDMEntity[], number>;
  public readonly structs: Map<number, RadianteKDMStructConstructor>;
  public readonly primitives: Map<number, RadianteKDMEntityConstructor>;
  public readonly tables: Map<RadianteKDMStringPointer, RadianteKDMEntity[]>;

  public readonly entities: Map<
    number,
    RadianteKDMEntity | RadianteKDMEntity[] | RadianteKDMEntityConstructor
  >;

  protected constructor(
    structs: [number, RadianteKDMStructConstructor][],
    tables: [RadianteKDMStringPointer, RadianteKDMEntity[]][],
    parameters: RadianteKDMParameter[]
  ) {
    super();

    this.constant = 0;
    this.arrays = new Map();
    this.strings = new Map();
    this.entities = new Map();

    this.parameters = parameters;
    this.tables = new Map(tables);
    this.structs = new Map(structs);

    this.primitives = new Map<number, RadianteKDMEntityConstructor>([
      [0x00, RadianteKDMF32],
      [0x01, RadianteKDMI32],
      [0x03, RadianteKDMStringPointer],
      [0x0f, RadianteKDMStructArrayPointer]
    ]);

    for (const array of this.tables.values()) {
      this.arrays.set(array, 0);
    }
  }

  public get types(): Map<number, RadianteKDMEntityConstructor> {
    return new Map([...this.structs, ...this.primitives]);
  }

  protected override _build(buffer: CTRMemory): void {
    buffer.encoding = "utf8";
    buffer.endianness = "LE";
    buffer.terminator = "\0";

    const magic = RADIANTE_KDM_MAGIC;

    const sections = this._calculateSectionOffsets();
    const section0 = sections[0];
    const section1 = sections[1];
    const section2 = sections[2];
    const section3 = sections[3];
    const section4 = sections[4];
    const section5 = sections[5];
    const section6 = sections[6];
    const section7 = sections[7];

    this._buildHeader(buffer, {
      magic,
      section0,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      section7,
      sections
    });

    const pointers = new Map<RadianteKDMPointer, number>();

    const types = new Map<RadianteKDMEntityConstructor, number>();
    this.types.forEach((type, id) => types.set(type, id));

    const entities = new Map<
      RadianteKDMEntity | RadianteKDMEntity[] | RadianteKDMEntityConstructor,
      number
    >();

    this.entities.forEach((entity, id) => entities.set(entity, id));

    const ctx = {
      types,
      entities,
      pointers,
      instance: this
    } satisfies RadianteKDMBuildContext;

    this._buildSection0(buffer, ctx);
    this._buildSection1(buffer);
    this._buildSection2(buffer);
    this._buildSection3(buffer, ctx);
    this._buildSection4(buffer, ctx);
    this._buildSection5(buffer, ctx);
    this._buildSection6(buffer, ctx);
    this._buildSection7(buffer);

    pointers.forEach((_, p) => p.resolve(buffer, ctx));
  }

  protected override _parse(buffer: CTRMemory): void {
    buffer.encoding = "utf8";
    buffer.endianness = "LE";
    buffer.terminator = "\0";

    const header = this._parseHeader(buffer);

    const strings = new Map<number, string>();
    const arrays = new Map<number, RadianteKDMEntity[]>();
    const pointers = new Map<number, RadianteKDMPointer>();

    const ctx = {
      arrays,
      strings,
      pointers,
      instance: this
    } satisfies RadianteKDMParseContext;

    this._parseSection0(buffer, ctx);
    this._parseSection1(buffer);
    this._parseSection2(buffer);
    this._parseSection3(buffer, ctx);
    this._parseSection4(buffer, ctx);
    this._parseSection5(buffer, ctx);
    this._parseSection6(buffer, ctx);
    this._parseSection7(buffer);

    pointers.forEach((p) => p.dereference(ctx));
  }

  protected override _sizeof(): number {
    const section7 = this._calculateSectionOffsets()[7];
    return section7 + CTRMemory.U32_SIZE;
  }

  private _isTable(arr: RadianteKDMEntity[]): boolean {
    for (const table of this.tables.values()) {
      if (arr === table) {
        return true;
      }
    }

    return false;
  }

  private _buildArray(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext,
    array: RadianteKDMEntity[]
  ): void {
    if (array[0] === undefined) {
      throw "kdm.err_empty_array";
    }

    const id = ctx.entities.get(array);

    if (id === undefined) {
      throw "kdm.err_unknown_entity";
    }

    const typeid = ctx.types.get(
      <RadianteKDMEntityConstructor>array[0].constructor
    );

    if (typeid === undefined) {
      throw "kdm.err_unknown_type";
    }

    const size = array.map((e) => e.sizeof).reduce((p, c) => p + c) / 4;

    buffer.u16(id);
    buffer.u16(size);
    buffer.u16(typeid);
    buffer.u16(size);

    const offset = buffer.offset;

    for (const entry of array) {
      entry.build(buffer, ctx);
    }

    ctx.instance.arrays.set(array, offset);
  }

  private _parseArray(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext,
    array: RadianteKDMEntity[]
  ): void {
    const id = buffer.u16();
    const size = buffer.u16();
    const type = buffer.u16();
    buffer.skip(CTRMemory.U16_SIZE);

    const constructor = ctx.instance.types.get(type);

    if (constructor === undefined) {
      throw "kdm.err_invalid_type";
    }

    const entity = new constructor();
    const count = (size * 4) / entity.sizeof;

    if (count <= 0) {
      throw "kdm.err_empty_array";
    }

    const offset = buffer.offset;

    for (let i = 0; i < count; i += 1) {
      const entity = new constructor().parse(buffer, ctx);
      array.push(entity);
    }

    ctx.arrays.set(offset, array);

    ctx.instance.entities.set(id, array);
    ctx.instance.arrays.set(array, offset);
  }

  private _buildHeader(buffer: CTRMemory, header: RadianteKDMHeader): void {
    buffer.raw(header.magic);

    for (const section of header.sections) {
      buffer.u32(section / 4);
    }
  }

  private _parseHeader(buffer: CTRMemory): RadianteKDMHeader {
    const magic = buffer.raw({ count: RadianteKDM.MAGIC.length }).array;

    if (!RadianteKDM.MAGIC.equals(magic)) {
      throw "kdm.err_not_a_kdm_file";
    }

    const sections: number[] = [];

    while (sections[0] === undefined || buffer.offset < sections[0]) {
      sections.push(buffer.u32() * 4);
    }

    if (
      buffer.offset !== RadianteKDM.HEADER_SIZE ||
      sections.length !== RadianteKDM.SECTION_COUNT
    ) {
      throw "kdm.err_invalid_header";
    }

    const section0 = sections[0]!;
    const section1 = sections[1]!;
    const section2 = sections[2]!;
    const section3 = sections[3]!;
    const section4 = sections[4]!;
    const section5 = sections[5]!;
    const section6 = sections[6]!;
    const section7 = sections[7]!;

    return {
      section0,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      section7,
      magic: <RadianteKDMHeader["magic"]>(<unknown>magic),
      sections: <RadianteKDMHeader["sections"]>(<unknown>sections)
    };
  }

  private _buildSection0(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    buffer.u32(ctx.instance.strings.size);

    ctx.instance.strings.forEach((_, string) => {
      new RadianteKDMString(string).build(buffer, ctx);
    });
  }

  private _parseSection0(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      new RadianteKDMString().parse(buffer, ctx);
    }
  }

  private _buildSection1(buffer: CTRMemory): void {
    buffer.u32(0x00000000);
  }

  private _parseSection1(buffer: CTRMemory): void {
    const count = buffer.u32();

    if (count !== 0x00000000) {
      throw "kdm.err_malformed_file";
    }
  }

  private _buildSection2(buffer: CTRMemory): void {
    buffer.u32(0x00000000);
  }

  private _parseSection2(buffer: CTRMemory): void {
    const count = buffer.u32();

    if (count !== 0x00000000) {
      throw "kdm.err_malformed_file";
    }
  }

  private _buildSection3(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    buffer.u32(ctx.instance.parameters.length);

    for (let i = 0; i < ctx.instance.parameters.length; i += 1) {
      const parameter = ctx.instance.parameters[i]!;
      const last = i + 1 === ctx.instance.parameters.length;

      const id = ctx.entities.get(parameter);

      if (id === undefined) {
        throw "kdm.err_unknown_entity";
      }

      let type: undefined | RadianteKDMEntityConstructor;

      if (parameter instanceof RadianteKDMF32Parameter) {
        type = RadianteKDMF32;
      }

      if (parameter instanceof RadianteKDMI32Parameter) {
        type = RadianteKDMI32;
      }

      if (type === undefined) {
        throw "kdm.err_invalid_parameter_type";
      }

      const typeid = ctx.types.get(type);

      if (typeid === undefined) {
        throw "kdm.err_unknown_type";
      }

      buffer.u16(id);
      buffer.u16(typeid);

      parameter.unknown0.set(
        !last
          ? this._calculateUnknown0FromConstant(
              CTRMemory.U16_SIZE * 2 + parameter.sizeof,
              parameter.name.sizeof + buffer.offset,
              this.constant
            )
          : 0
      );

      parameter.build(buffer, ctx);
    }
  }

  private _parseSection3(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    const count = buffer.u32();

    if (count > ctx.instance.parameters.length) {
      throw "kdm.err_too_many_parameters";
    }

    if (count < ctx.instance.parameters.length) {
      throw "kdm.err_not_enough_parameters";
    }

    for (let i = 0; i < ctx.instance.parameters.length; i += 1) {
      const parameter = ctx.instance.parameters[i]!;
      const last = i + 1 === ctx.instance.parameters.length;

      const id = buffer.u16();
      const type = ctx.instance.types.get(buffer.u16());

      if (parameter.value.constructor !== type) {
        throw "kdm.err_invalid_parameter_type";
      }

      parameter.parse(buffer, ctx);

      if (this.constant === 0) {
        this.constant = this._calculateConstantFromUnknown0(
          parameter.sizeof + CTRMemory.U16_SIZE * 2,
          parameter.unknown0.offset || 0,
          parameter.unknown0.number
        );
      }

      if (last && parameter.unknown0.number !== 0) {
        throw "kdm.err_invalid_constant";
      }

      if (
        !last &&
        parameter.unknown0.number !==
          this._calculateConstantFromUnknown0(
            parameter.sizeof + CTRMemory.U16_SIZE * 2,
            parameter.unknown0.offset || 0,
            parameter.unknown0.number
          )
      ) {
        console.log("hello");
        throw "kdm.err_invalid_constant";
      }

      ctx.instance.entities.set(id, parameter);
    }
  }

  private _buildSection4(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    buffer.u32(ctx.instance.structs.size);

    const structs = Array.from(ctx.instance.structs.entries());
    structs.sort(([idA], [idB]) => idA - idB);

    for (let i = 0; i < structs.length; i += 1) {
      const [id, constructor] = structs[i]!;
      const last = i + 1 === structs.length;

      const struct = new constructor();

      buffer.u16(id);
      buffer.u16(struct.fields.length);
      buffer.u32(0x00000000);

      buffer.u32(
        !last
          ? this._calculateUnknown0FromConstant(
              CTRMemory.U32_SIZE +
                CTRMemory.U16_SIZE * 2 +
                struct.fields.length * CTRMemory.U32_SIZE,
              buffer.offset,
              this.constant
            )
          : 0
      );

      for (const field of struct.fields) {
        const typeid = ctx.types.get(
          <RadianteKDMEntityConstructor>field.constructor
        );

        if (typeid === undefined) {
          throw "kdm.err_unknown_type";
        }

        buffer.u32(typeid);
      }
    }
  }

  private _parseSection4(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    const count = buffer.u32();

    const structs = Array.from(ctx.instance.structs.entries());
    structs.sort(([idA], [idB]) => idA - idB);

    if (count > structs.length) {
      throw "kdm.err_too_many_struct_definitions";
    }

    if (count < structs.length) {
      throw "kdm.err_not_enough_struct_definitions";
    }

    for (let i = 0; i < structs.length; i += 1) {
      const last = i + 1 === structs.length;
      const [id, constructor] = structs[i]!;

      if (buffer.u16() !== id) {
        throw "kdm.err_invalid_struct_definition";
      }

      const struct = new constructor();

      if (buffer.u16() !== struct.fields.length) {
        throw "kdm.err_invalid_struct_definition";
      }

      if (buffer.u32() !== 0x00000000) {
        throw "kdm.err_invalid_struct_definition";
      }

      const offset = buffer.offset;
      const unknown0 = buffer.u32();

      if (this.constant === 0) {
        this.constant = this._calculateConstantFromUnknown0(
          CTRMemory.U32_SIZE +
            CTRMemory.U32_SIZE * struct.fields.length +
            CTRMemory.U16_SIZE * 2,
          offset,
          unknown0
        );
      }

      if (last && unknown0 !== 0) {
        throw "kdm.err_invalid_constant";
      }

      if (
        !last &&
        unknown0 !==
          this._calculateConstantFromUnknown0(
            CTRMemory.U32_SIZE +
              CTRMemory.U32_SIZE * struct.fields.length +
              CTRMemory.U16_SIZE * 2,
            offset,
            unknown0
          )
      ) {
        throw "kdm.err_invalid_constant";
      }

      for (const field of struct.fields) {
        if (field.constructor !== ctx.instance.types.get(buffer.u32())) {
          throw "kdm.err_invalid_struct_definition";
        }
      }

      ctx.instance.entities.set(id, constructor);
    }
  }

  private _buildSection5(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    buffer.u32(ctx.instance.arrays.size - ctx.instance.tables.size);

    ctx.instance.arrays.forEach((_, array) => {
      if (!this._isTable(array)) {
        this._buildArray(buffer, ctx, array);
      }
    });
  }

  private _parseSection5(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      ctx.instance._parseArray(buffer, ctx, []);
    }
  }

  private _buildSection6(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    buffer.u32(ctx.instance.tables.size);
    ctx.instance.tables.forEach((_, name) => name.build(buffer, ctx));

    ctx.instance.tables.forEach((table) =>
      this._buildArray(buffer, ctx, table)
    );
  }

  private _parseSection6(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    const count = buffer.u32();

    if (count > ctx.instance.tables.size) {
      throw "kdm.err_too_many_tables";
    }

    if (count < ctx.instance.tables.size) {
      throw "kdm.err_not_enough_tables";
    }

    const names: string[] = [];

    for (let i = 0; i < count; i += 1) {
      const string = new RadianteKDMStringPointer().parse(buffer, ctx);
      string.dereference(ctx);

      names.push(string.string);
    }

    const tables = Array.from(ctx.instance.tables);

    names.forEach((name) => {
      const table = tables.find(([s]) => s.string === name);

      if (table === undefined) {
        throw "kdm.err_unknwon_table";
      }

      ctx.instance._parseArray(buffer, ctx, table[1]);
    });
  }

  private _buildSection7(buffer: CTRMemory): void {
    buffer.u32(0x00000000);
  }

  private _parseSection7(buffer: CTRMemory): void {
    const count = buffer.u32();

    if (count !== 0x00000000) {
      throw "kdm.err_malformed_file";
    }
  }

  private _calculateSectionOffsets(): RadianteKDMSectionOffsets {
    let offset = RadianteKDM.HEADER_SIZE;

    let section0 = 0;
    let section1 = 0;
    let section2 = 0;
    let section3 = 0;
    let section4 = 0;
    let section5 = 0;
    let section6 = 0;
    let section7 = 0;

    //#region
    section0 = offset;

    offset += CTRMemory.U32_SIZE;
    this.strings.forEach((_, s) => (offset += RadianteKDMString.bytelength(s)));
    //#endregion

    //#region
    section1 = offset;
    offset += CTRMemory.U32_SIZE;
    //#endregion

    //#region
    section2 = offset;
    offset += CTRMemory.U32_SIZE;
    //#endregion

    //#region
    section3 = offset;
    offset += CTRMemory.U32_SIZE;

    this.parameters.forEach(
      (p) => (offset += CTRMemory.U16_SIZE * 2 + p.sizeof)
    );
    //#endregion

    //#region
    section4 = offset;
    offset += CTRMemory.U32_SIZE;

    this.structs.forEach((constructor) => {
      const struct = new constructor();

      offset +=
        CTRMemory.U16_SIZE * 2 +
        CTRMemory.U32_SIZE * 2 +
        struct.fields.length * 4;
    });
    //#endregion

    //#region
    section5 = offset;
    offset += CTRMemory.U32_SIZE;

    this.arrays.forEach((_, arr) => {
      if (!this._isTable(arr)) {
        offset += CTRMemory.U16_SIZE * 4;
        arr.forEach((e) => (offset += e.sizeof));
      }
    });
    //#endregion

    //#region
    section6 = offset;
    offset += CTRMemory.U32_SIZE;

    this.tables.forEach((table, name) => {
      offset += name.sizeof + CTRMemory.U16_SIZE * 4;
      table.forEach((e) => (offset += e.sizeof));
    });
    //#endregion

    //#region
    section7 = offset;
    offset += CTRMemory.U32_SIZE;
    //#endregion

    return [
      section0,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      section7
    ];
  }

  private _calculateConstantFromUnknown0(
    size: number,
    offset: number,
    unknown0: number
  ): number {
    return unknown0 - offset - size;
  }

  private _calculateUnknown0FromConstant(
    size: number,
    offset: number,
    constant: number
  ): number {
    return constant + offset + size;
  }
}

export { RadianteKDM, RadianteKDM as KDM };

export type {
  RadianteKDMHeader,
  RadianteKDMHeader as KDMHeader,
  RadianteKDMBuildContext,
  RadianteKDMBuildContext as KDMBuildContext,
  RadianteKDMParseContext,
  RadianteKDMParseContext as KDMParseContext
};
