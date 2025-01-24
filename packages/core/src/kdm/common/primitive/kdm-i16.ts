import { RadianteKDMInt } from "#kdm/common/primitive/kdm-int";

class RadianteKDMI16 extends RadianteKDMInt {
  public constructor(number?: number) {
    super("i16", number);
  }
}

export { RadianteKDMI16, RadianteKDMI16 as KDMI16 };
