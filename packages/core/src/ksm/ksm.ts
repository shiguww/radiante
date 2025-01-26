import { RadianteKSMContext } from "#ksm/ksm-context";
import { RadianteKSMVariable } from "#ksm/ksm-variable";
import { CTRMemory, CTRBinarySerializable } from "libctr";
import { RadianteKSMFunctionImport } from "#ksm/ksm-function-import";
import { RadianteKSMFunctionDefinition } from "#ksm/ksm-function-definition";
import { RadianteKSMFunctionInstruction } from "#ksm/instructions/ksm-function-instruction";
import { RadianteKSMUnknownFunctionInstruction } from "#ksm/instructions/ksm-unknown-function-instruction";
import { RadianteKSMGetArgsInstruction } from "#ksm/instructions/ksm-get-args-instruction";

const RADIANTE_KSM_MAGIC = [
  0x4b, 0x53, 0x4d, 0x52, 0x00, 0x03, 0x01, 0x00
] as const;

interface RadianteKSMHeader {
  section0: number;
  section1: number;
  section2: number;
  section3: number;
  section4: number;
  section5: number;
  section6: number;
  section7: number;
  magic: typeof RADIANTE_KSM_MAGIC;
  sections: [number, number, number, number, number, number, number, number];
}

class RadianteKSM extends CTRBinarySerializable {
  private static readonly OP_GET_ARGS = 0x05;

  private static readonly SECTION_COUNT = 8;
  private static readonly MAGIC = new CTRMemory(RADIANTE_KSM_MAGIC);

  public readonly section0: number[];
  public readonly section3: number[];
  public readonly section7: number[];
  public readonly globals: RadianteKSMVariable[];
  public readonly statics: RadianteKSMVariable[];
  public readonly constants: RadianteKSMVariable[];
  public readonly imports: RadianteKSMFunctionImport[];

  public readonly functions: Map<
    RadianteKSMFunctionDefinition,
    RadianteKSMFunctionInstruction[]
  >;

  public constructor() {
    super();

    this.globals = [];
    this.imports = [];
    this.statics = [];
    this.section0 = [];
    this.section3 = [];
    this.section7 = [];
    this.constants = [];
    this.functions = new Map();
  }

  public parseInstruction(
    buffer: CTRMemory,
    ctx: RadianteKSMContext
  ): RadianteKSMFunctionInstruction {
    ctx.opcode = buffer.u32() & 0xfffffeff;

    if (ctx.opcode === RadianteKSM.OP_GET_ARGS) {
      return new RadianteKSMGetArgsInstruction().parse(buffer, ctx);
    }

    return new RadianteKSMUnknownFunctionInstruction().parse(buffer, ctx);
  }

  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory): void {
    const ctx = new RadianteKSMContext(this);
    const header = this._parseHeader(buffer);

    this._parseSection0(buffer, header);
    this._parseSection1(buffer, ctx);
    this._parseSection2(buffer, ctx);
    this._parseSection3(buffer, header);
    this._parseSection4(buffer, ctx);
    this._parseSection5(buffer, ctx);
    this._parseSection6(buffer, ctx);
    this._parseSection7(buffer, ctx);
  }

  private _parseHeader(buffer: CTRMemory): RadianteKSMHeader {
    const magic = buffer.raw({ count: RadianteKSM.MAGIC.length }).array;

    if (!RadianteKSM.MAGIC.equals(magic)) {
      throw "ksm.err_not_a_ksm_file";
    }

    const sections: number[] = [];

    for (let i = 0; i < RadianteKSM.SECTION_COUNT; i += 1) {
      sections.push(buffer.u32() * 4);
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
      // @ts-expect-error
      magic,
      section0,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      section7,
      // @ts-expect-error
      sections
    };
  }

  private _parseSection0(buffer: CTRMemory, header: RadianteKSMHeader): void {
    while (buffer.offset < header.section1) {
      this.section0.push(buffer.u32());
    }
  }

  private _parseSection1(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const fn = new RadianteKSMFunctionDefinition().parse(buffer, ctx);

      ctx.symbols.set(fn.id, fn);
      this.functions.set(fn, []);
    }
  }

  private _parseSection2(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const variable = new RadianteKSMVariable().parse(buffer, ctx);

      ctx.symbols.set(variable.id, variable);
      this.statics.push(variable);
    }
  }

  private _parseSection3(buffer: CTRMemory, header: RadianteKSMHeader): void {
    while (buffer.offset < header.section4) {
      this.section3.push(buffer.u32());
    }
  }

  private _parseSection4(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const variable = new RadianteKSMVariable().parse(buffer, ctx);

      ctx.symbols.set(variable.id, variable);
      this.constants.push(variable);
    }
  }

  private _parseSection5(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const fn = new RadianteKSMFunctionImport().parse(buffer, ctx);

      ctx.symbols.set(fn.id, fn);
      this.imports.push(fn);
    }
  }

  private _parseSection6(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const variable = new RadianteKSMVariable().parse(buffer, ctx);

      ctx.symbols.set(variable.id, variable);
      this.globals.push(variable);
    }
  }

  private _parseSection7(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    const count = buffer.u32();
    const start = buffer.offset;

    for (const fn of this.functions.keys()) {
      buffer.seek(start + fn.codeStart * CTRMemory.U32_SIZE);

      const subarray = buffer.subarray(
        start + fn.codeStart * CTRMemory.U32_SIZE,
        start + fn.codeEnd * CTRMemory.U32_SIZE
      );

      const scope = ctx.scope(fn);
      const instructions: RadianteKSMFunctionInstruction[] = [];

      while (!subarray.ended) {
        instructions.push(this.parseInstruction(buffer, scope));
      }

      this.functions.set(fn, instructions);
    }
  }
}

export { RadianteKSM, RadianteKSM as KSM };
