import { CTRMemory } from "libctr";
import { KDMI32 } from "#kdm/common/primitive/kdm-i32";
import { KDMBaseParameter } from "#kdm/common/parameter/kdm-base-parameter";
import type { IRadianteKDMBaseParameter } from "#kdm/common/parameter/kdm-base-parameter";

interface IRadianteKDMI32Parameter
  extends IRadianteKDMBaseParameter<number, "I32Parameter"> {}

class RadianteKDMI32Parameter extends KDMBaseParameter<number, "I32Parameter"> {
  public override readonly value: KDMI32;

  public constructor(
    stateOrBuffer?: string | Buffer | CTRMemory | IRadianteKDMI32Parameter
  ) {
    super("I32Parameter");
    this.value = new KDMI32();

    if (typeof stateOrBuffer === "string") {
      this.name.set(stateOrBuffer);
    } else if (
      Buffer.isBuffer(stateOrBuffer) ||
      stateOrBuffer instanceof CTRMemory
    ) {
      this.parse(stateOrBuffer);
    } else if (stateOrBuffer !== undefined) {
      this.set(stateOrBuffer);
    }
  }
}

export { RadianteKDMI32Parameter, RadianteKDMI32Parameter as KDMI32Parameter };

export type {
  IRadianteKDMI32Parameter,
  IRadianteKDMI32Parameter as IKDMI32Parameter
};
