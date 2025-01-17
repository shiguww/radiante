import { RadianteKDMNumber } from "#kdm/common/primitive/kdm-number";

class RadianteKDMI16 extends RadianteKDMNumber {
  public constructor(number?: number) {
    super("i16", number);
  }
}

export { RadianteKDMI16, RadianteKDMI16 as KDMI16 };
