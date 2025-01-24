import type { ZodType } from "zod";
import { RadianteKDMF32 } from "#kdm/common/primitive/kdm-f32";
import { RadianteKDMI32 } from "#kdm/common/primitive/kdm-i32";
import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";
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

import {
  CTRMemory,
  CTRMemoryOOBError,
  CTRBinarySerializable,
  CTREventEmitterDefaultEventMap
} from "libctr";

import {
  RadianteKDMError,
  RadianteKDMFormatError,
  RadianteKDMEmptyArrayError,
  RadianteKDMUnknownTypeError,
  RadianteKDMUnknownTableError,
  RadianteKDMUnknownTypeIDError,
  RadianteKDMUnknownEntityError,
  RadianteKDMInvalidHeaderError,
  RadianteKDMInvalidParameterTypeError,
  RadianteKDMInvalidStructDefinitionError,
  RadianteKDMInvalidCountError,
  RadianteKDMInvalidConstantError
} from "#kdm/kdm-error";

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

interface RadianteKDMPartialHeader {
  magic: number[];
  section0?: number;
  section1?: number;
  section2?: number;
  section3?: number;
  section4?: number;
  section5?: number;
  section6?: number;
  section7?: number;
  sections?: number[];
}

abstract class RadianteKDM<T = unknown> extends CTRBinarySerializable<
  T,
  CTREventEmitterDefaultEventMap,
  undefined,
  undefined,
  RadianteKDMFormatError,
  RadianteKDMFormatError,
  RadianteKDMInvalidStateError
> {
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
  }

  public abstract get schema(): ZodType<T>;

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

    if (buffer.offset !== header.section0) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
    }

    this._parseSection0(buffer, ctx, header);
    this._parseSection1(buffer, header);
    this._parseSection2(buffer, header);
    this._parseSection3(buffer, ctx, header);
    this._parseSection4(buffer, ctx, header);
    this._parseSection5(buffer, ctx, header);
    this._parseSection6(buffer, ctx, header);
    this._parseSection7(buffer);

    pointers.forEach((p) => p.dereference(ctx));
  }

  protected override _sizeof(): number {
    const section7 = this._calculateSectionOffsets()[7];
    return section7 + CTRMemory.U32_SIZE;
  }

  protected override _builderr(
    err: unknown,
    buffer: CTRMemory
  ): RadianteKDMFormatError {
    return new RadianteKDMFormatError(
      RadianteKDMError.ERR_BUILD,
      buffer,
      this,
      undefined,
      err
    );
  }

  protected override _parseerr(
    err: unknown,
    buffer: CTRMemory
  ): RadianteKDMFormatError {
    return new RadianteKDMFormatError(
      RadianteKDMError.ERR_PARSE,
      buffer,
      this,
      undefined,
      err instanceof CTRMemoryOOBError
        ? new RadianteKDMError(
            RadianteKDMError.ERR_UNEXPECTED_END_OF_FILE,
            undefined,
            err
          )
        : err
    );
  }

  protected override _validate(
    input: unknown
  ): null | RadianteKDMInvalidStateError {
    const result = this.schema.safeParse(input);

    if (result.error !== undefined) {
      return new RadianteKDMInvalidStateError(result.error);
    }

    return null;
  }

  protected _addString(
    ...strings: (null | string | RadianteKDMStringPointer)[]
  ): void {
    for (const string of strings) {
      const s =
        string !== null && typeof string === "object" ? string.string : string;

      if (s !== null && !this.strings.has(s)) {
        this.strings.set(s, 0);
      }
    }
  }

  private _buildArray(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext,
    array: RadianteKDMEntity[]
  ): void {
    if (array[0] === undefined) {
      throw new RadianteKDMEmptyArrayError(array);
    }

    const id = ctx.entities.get(array);

    if (id === undefined) {
      throw new RadianteKDMUnknownEntityError(array);
    }

    const type = array[0]._type;
    const typeid = ctx.types.get(type);

    if (typeid === undefined) {
      throw new RadianteKDMUnknownTypeError(type);
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
    array: RadianteKDMEntity[],
    isTable?: boolean
  ): void {
    const id = buffer.u16();
    const size = buffer.u16();
    const typeid = buffer.u16();
    buffer.skip(CTRMemory.U16_SIZE);

    const type = ctx.instance.types.get(typeid);

    if (type === undefined) {
      throw new RadianteKDMUnknownTypeIDError(typeid);
    }

    const entity = new type();
    const count = (size * 4) / entity.sizeof;

    if (count <= 0) {
      throw new RadianteKDMEmptyArrayError(array);
    }

    const offset = buffer.offset;

    for (let i = 0; i < count; i += 1) {
      const entity = new type().parse(buffer, ctx);
      array.push(entity);
    }

    ctx.instance.entities.set(id, array);

    if (!isTable) {
      ctx.arrays.set(offset, array);
      ctx.instance.arrays.set(array, offset);
    }
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
      throw new RadianteKDMError(RadianteKDMError.ERR_NOT_A_KDM_FILE);
    }

    const sections: number[] = [];

    while (sections[0] === undefined || buffer.offset < sections[0]) {
      sections.push(buffer.u32() * 4);
    }

    const section0 = sections[0];
    const section1 = sections[1];
    const section2 = sections[2];
    const section3 = sections[3];
    const section4 = sections[4];
    const section5 = sections[5];
    const section6 = sections[6];
    const section7 = sections[7];

    const header = {
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
    };

    if (
      sections.length !== 8 ||
      buffer.offset !== RadianteKDM.HEADER_SIZE ||
      sections.length !== RadianteKDM.SECTION_COUNT
    ) {
      throw new RadianteKDMInvalidHeaderError(header);
    }

    return <RadianteKDMHeader>(<unknown>header);
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
    ctx: RadianteKDMParseContext,
    header: RadianteKDMHeader
  ): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      new RadianteKDMString().parse(buffer, ctx);
    }

    if (buffer.offset !== header.section1) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
    }
  }

  private _buildSection1(buffer: CTRMemory): void {
    buffer.u32(0x00000000);
  }

  private _parseSection1(buffer: CTRMemory, header: RadianteKDMHeader): void {
    const count = buffer.u32();

    if (count !== 0x00000000 || buffer.offset !== header.section2) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
    }
  }

  private _buildSection2(buffer: CTRMemory): void {
    buffer.u32(0x00000000);
  }

  private _parseSection2(buffer: CTRMemory, header: RadianteKDMHeader): void {
    const count = buffer.u32();

    if (count !== 0x00000000 || buffer.offset !== header.section3) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
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
        throw new RadianteKDMUnknownEntityError(parameter);
      }

      const type =
        parameter instanceof RadianteKDMF32Parameter
          ? RadianteKDMF32
          : RadianteKDMI32;

      const typeid = ctx.types.get(type);

      if (typeid === undefined) {
        throw new RadianteKDMUnknownTypeError(type);
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
    ctx: RadianteKDMParseContext,
    header: RadianteKDMHeader
  ): void {
    const count = buffer.u32();

    if (count !== ctx.instance.parameters.length) {
      throw new RadianteKDMInvalidCountError(
        RadianteKDMError.ERR_INVALID_PARAMETER_COUNT,
        count,
        ctx.instance.parameters.length
      );
    }

    for (let i = 0; i < ctx.instance.parameters.length; i += 1) {
      const parameter = ctx.instance.parameters[i]!;
      const last = i + 1 === ctx.instance.parameters.length;

      const id = buffer.u16();

      const typeid = buffer.u16();
      const type = ctx.instance.types.get(typeid);

      if (type === undefined) {
        throw new RadianteKDMUnknownTypeIDError(typeid);
      }

      if (parameter.value._type !== type) {
        throw new RadianteKDMInvalidParameterTypeError(type);
      }

      parameter.parse(buffer, ctx);

      const constant = this._calculateConstantFromUnknown0(
        parameter.sizeof + CTRMemory.U16_SIZE * 2,
        parameter.unknown0.offset || 0,
        parameter.unknown0.number
      );

      if (this.constant === 0) {
        this.constant = constant;
      }

      if (last && parameter.unknown0.number !== 0) {
        throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
      }

      if (!last && constant !== this.constant) {
        throw new RadianteKDMInvalidConstantError(constant, this.constant);
      }

      ctx.instance.entities.set(id, parameter);
    }

    if (buffer.offset !== header.section4) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
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
        const type = field._type;
        const typeid = ctx.types.get(type);

        if (typeid === undefined) {
          throw new RadianteKDMUnknownTypeError(type);
        }

        buffer.u32(typeid);
      }
    }
  }

  private _parseSection4(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext,
    header: RadianteKDMHeader
  ): void {
    const count = buffer.u32();

    const structs = Array.from(ctx.instance.structs.entries());
    structs.sort(([idA], [idB]) => idA - idB);

    if (count !== structs.length) {
      throw new RadianteKDMInvalidCountError(
        RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION_COUNT,
        count,
        structs.length
      );
    }

    for (let i = 0; i < structs.length; i += 1) {
      const last = i + 1 === structs.length;
      const [id, constructor] = structs[i]!;

      if (buffer.u16() !== id) {
        throw new RadianteKDMInvalidStructDefinitionError(id);
      }

      const struct = new constructor();

      if (buffer.u16() !== struct.fields.length) {
        throw new RadianteKDMInvalidStructDefinitionError(id);
      }

      if (buffer.u32() !== 0x00000000) {
        throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
      }

      const offset = buffer.offset;
      const unknown0 = buffer.u32();

      const constant = this._calculateConstantFromUnknown0(
        CTRMemory.U32_SIZE +
          CTRMemory.U32_SIZE * struct.fields.length +
          CTRMemory.U16_SIZE * 2,
        offset,
        unknown0
      );

      if (this.constant === 0) {
        this.constant = constant;
      }

      if (last && unknown0 !== 0) {
        throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
      }

      if (!last && constant !== this.constant) {
        throw new RadianteKDMInvalidConstantError(constant, this.constant);
      }

      for (const field of struct.fields) {
        if (field._type !== ctx.instance.types.get(buffer.u32())) {
          throw new RadianteKDMInvalidStructDefinitionError(id);
        }
      }

      ctx.instance.entities.set(id, constructor);
    }

    if (buffer.offset !== header.section5) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
    }
  }

  private _buildSection5(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    buffer.u32(ctx.instance.arrays.size);

    ctx.instance.arrays.forEach((_, array) =>
      this._buildArray(buffer, ctx, array)
    );
  }

  private _parseSection5(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext,
    header: RadianteKDMHeader
  ): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      ctx.instance._parseArray(buffer, ctx, []);
    }

    if (buffer.offset !== header.section6) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
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
    ctx: RadianteKDMParseContext,
    header: RadianteKDMHeader
  ): void {
    const count = buffer.u32();

    if (count !== ctx.instance.tables.size) {
      throw new RadianteKDMInvalidCountError(
        RadianteKDMError.ERR_INVALID_TABLE_COUNT,
        count,
        ctx.instance.tables.size
      );
    }

    const names: string[] = [];

    for (let i = 0; i < count; i += 1) {
      const string = new RadianteKDMStringPointer().parse(buffer, ctx);
      string.dereference(ctx);

      if (string.string === null) {
        throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
      }

      names.push(string.string);
    }

    const tables = Array.from(ctx.instance.tables);

    names.forEach((name) => {
      const table = tables.find(([s]) => s.string === name);

      if (table === undefined) {
        throw new RadianteKDMUnknownTableError(name);
      }

      ctx.instance._parseArray(buffer, ctx, table[1], true);
    });

    if (buffer.offset !== header.section7) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
    }
  }

  private _buildSection7(buffer: CTRMemory): void {
    buffer.u32(0x00000000);
  }

  private _parseSection7(buffer: CTRMemory): void {
    const count = buffer.u32();

    if (count !== 0x00000000 || !buffer.ended) {
      throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
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
      offset += CTRMemory.U16_SIZE * 4;
      arr.forEach((e) => (offset += e.sizeof));
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
  RadianteKDMParseContext as KDMParseContext,
  RadianteKDMPartialHeader,
  RadianteKDMPartialHeader as KDMPartialHeader
};
