import { RadianteKSMVariable } from "#ksm/ksm-variable";
import { CTRMemory, CTRBinarySerializable } from "libctr";
import { RadianteKSMFunctionImport } from "./ksm-function-import";
import { RadianteKSMFunctionDefinition } from "./ksm-function-definition";

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
  private static readonly SECTION_COUNT = 8;
  private static readonly MAGIC = new CTRMemory(RADIANTE_KSM_MAGIC);

  public readonly section0: number[];
  public readonly section3: number[];
  public readonly section7: number[];
  public readonly globals: RadianteKSMVariable[];
  public readonly statics: RadianteKSMVariable[];
  public readonly constants: RadianteKSMVariable[];
  public readonly imports: RadianteKSMFunctionImport[];
  public readonly definitions: RadianteKSMFunctionDefinition[];

  public constructor() {
    super();

    this.globals = [];
    this.imports = [];
    this.statics = [];
    this.section0 = [];
    this.section3 = [];
    this.section7 = [];
    this.constants = [];
    this.definitions = [];
  }

  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory): void {
    const header = this._parseHeader(buffer);

    this._parseSection0(buffer, header);
    this._parseSection1(buffer);
    this._parseSection2(buffer);
    this._parseSection3(buffer, header);
    this._parseSection4(buffer);
    this._parseSection5(buffer);
    this._parseSection6(buffer);
    this._parseSection7(buffer);
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

  private _parseSection1(buffer: CTRMemory): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      this.definitions.push(new RadianteKSMFunctionDefinition().parse(buffer));
    }
  }

  private _parseSection2(buffer: CTRMemory): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      this.statics.push(new RadianteKSMVariable().parse(buffer));
    }
  }

  private _parseSection3(buffer: CTRMemory, header: RadianteKSMHeader): void {
    while (buffer.offset < header.section4) {
      this.section3.push(buffer.u32());
    }
  }

  private _parseSection4(buffer: CTRMemory): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      this.constants.push(new RadianteKSMVariable().parse(buffer));
    }
  }

  private _parseSection5(buffer: CTRMemory): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      this.imports.push(new RadianteKSMFunctionImport().parse(buffer));
    }
  }

  private _parseSection6(buffer: CTRMemory): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      this.globals.push(new RadianteKSMVariable().parse(buffer));
    }
  }

  private _parseSection7(buffer: CTRMemory): void {
    while (!buffer.ended) {
      this.section7.push(buffer.u32());
    }
  }
}

export { RadianteKSM, RadianteKSM as KSM };
