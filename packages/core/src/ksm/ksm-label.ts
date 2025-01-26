import { assert } from "#utils";
import { CTRBinarySerializable, CTRMemory } from "libctr";

class RadianteKSMLabel extends CTRBinarySerializable {
  public id: number;
  public label: number;
  public name: null | string;

  public constructor() {
    super();

    this.id = 0;
    this.label = 0;
    this.name = null;
  }

  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory): void {
    const unknown = buffer.u32();

    this.id = buffer.u32();
    this.label = buffer.u32();

    this.name =
      unknown === CTRMemory.U32_MAX
        ? buffer.string({ count: buffer.u32(), encoding: "utf8" })
        : null;

    if (this.name === null) {
      assert(unknown === 0, "");
    }
  }
}

export { RadianteKSMLabel, RadianteKSMLabel as KSMLabel };
