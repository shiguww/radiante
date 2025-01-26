import { assert } from "#utils";
import { CTRMemory, CTRBinarySerializable } from "libctr";

type RadianteKSMVariableType = "f32" | "i32" | "string" | number;

class RadianteKSMVariableDefinition extends CTRBinarySerializable {
  private static readonly VARIABLE_TYPE_F32 = 0;
  private static readonly VARIABLE_TYPE_I32 = 1;
  private static readonly VARIABLE_TYPE_STRING = 3;

  public id: number;
  public flags: number;
  public value: unknown;
  public name: null | string;
  public type: RadianteKSMVariableType;

  public constructor() {
    super();

    this.id = 0;
    this.flags = 0;
    this.value = 0;
    this.name = null;
    this.type = "i32";
  }

  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory): void {
    const unknown = buffer.i32();
    this.id = buffer.i32();

    this.type = this._parseType(buffer);
    this.flags = buffer.u8();

    if (this.type === "f32") {
      this.value = buffer.f32();
    } else if (this.type === "i32") {
      this.value = buffer.i32();
    } else {
      this.value = buffer.u32();
    }

    this.name =
      unknown === CTRMemory.U32_MAX
        ? buffer.string({ count: buffer.u32(), encoding: "utf8" })
        : null;

    if (this.name === null) {
      assert(unknown === 0, "");
    }

    if (this.type === "string") {
      assert(this.value === 0, "");

      const length = buffer.u32() * 4;
      this.value = buffer.string({ count: length, encoding: "utf8" });
    }
  }

  private _parseType(buffer: CTRMemory): RadianteKSMVariableType {
    const type = buffer.u24();

    switch (type) {
      case RadianteKSMVariableDefinition.VARIABLE_TYPE_F32:
        return "f32";
      case RadianteKSMVariableDefinition.VARIABLE_TYPE_I32:
        return "i32";
      case RadianteKSMVariableDefinition.VARIABLE_TYPE_STRING:
        return "string";
      default:
        return type;
    }
  }
}

export {
  RadianteKSMVariableDefinition,
  RadianteKSMVariableDefinition as KSMVariableDefinition
};
