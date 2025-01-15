import { CTRMemory } from "libctr";
import { KDMF32 } from "#kdm/common/primitive/kdm-f32";
import { KDMBaseParameter } from "#kdm/common/parameter/kdm-base-parameter";
import type { IRadianteKDMBaseParameter } from "#kdm/common/parameter/kdm-base-parameter";

interface IRadianteKDMF32Parameter
  extends IRadianteKDMBaseParameter<number, "F32Parameter"> {}

class RadianteKDMF32Parameter extends KDMBaseParameter<number, "F32Parameter"> {
  public override readonly value: KDMF32;

  public constructor(
    stateOrBuffer?: string | Buffer | CTRMemory | IRadianteKDMF32Parameter
  ) {
    super("F32Parameter");
    this.value = new KDMF32();

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

export { RadianteKDMF32Parameter, RadianteKDMF32Parameter as KDMF32Parameter };

export type {
  IRadianteKDMF32Parameter,
  IRadianteKDMF32Parameter as IKDMF32Parameter
};
