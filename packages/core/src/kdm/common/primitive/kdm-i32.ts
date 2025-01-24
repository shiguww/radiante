import { RadianteKDMInt } from "#kdm/common/primitive/kdm-int";

class RadianteKDMI32 extends RadianteKDMInt {
  public constructor(number?: number) {
    super("i32", number);
  }
}

export { RadianteKDMI32, RadianteKDMI32 as KDMI32 };
