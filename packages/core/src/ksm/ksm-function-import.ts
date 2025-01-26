import { assert } from "#utils";
import { CTRMemory } from "libctr";
import { RadianteKSMEntity } from "#ksm/ksm-entity";

class RadianteKSMFunctionImport extends RadianteKSMEntity {
  public id: number;
  public unknown0: number;
  public unknown1: number;
  public unknown2: number;
  public unknown3: number;
  public unknown4: number;
  public name: null | string;

  public constructor() {
    super();

    this.id = 0;
    this.name = null;
    this.unknown0 = 0;
    this.unknown1 = 0;
    this.unknown2 = 0;
    this.unknown3 = 0;
    this.unknown4 = 0;
  }

  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory): void {
    const unknown = buffer.u32();

    this.unknown0 = buffer.u32();
    this.unknown1 = buffer.u32();
    this.unknown2 = buffer.u32();

    this.id = buffer.u32();
    this.unknown3 = buffer.u32();
    this.unknown4 = buffer.u32();

    this.name =
      unknown === CTRMemory.U32_MAX
        ? buffer.string({ count: buffer.u32() * 4, encoding: "utf8" })
        : null;

    if (this.name === null) {
      assert(unknown === 0, "");
    }
  }
}

export {
  RadianteKSMFunctionImport,
  RadianteKSMFunctionImport as KSMFunctionImport
};
