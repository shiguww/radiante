import type { ZodNumber } from "zod";
import type { CTRMemoryDataType } from "libctr";
import { RadianteKDMNumber } from "#kdm/common/primitive/kdm-number";

type RadianteKDMIntType = CTRMemoryDataType &
  `${"i" | "u"}${"8" | "16" | "32"}`;

class RadianteKDMInt extends RadianteKDMNumber {
  public override readonly type: RadianteKDMIntType;

  public constructor(type: RadianteKDMIntType, number?: number) {
    super(type, number);
    this.type = type;
  }

  public override get schema(): ZodNumber {
    return super.schema.int();
  }
}

export { RadianteKDMInt, RadianteKDMInt as KDMInt };
