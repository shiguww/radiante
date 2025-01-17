import { RadianteKDMNumber } from "#kdm/common/primitive/kdm-number";

class RadianteKDMI32 extends RadianteKDMNumber {
  public constructor(number?: number) {
    super("i32", number);
  }
}

export { RadianteKDMI32, RadianteKDMI32 as KDMI32 };
