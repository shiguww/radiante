import { RadianteKDMNumber } from "#kdm/common/primitive/kdm-number";

class RadianteKDMF32 extends RadianteKDMNumber {
  public constructor(number?: number) {
    super("f32", number);
  }
}

export { RadianteKDMF32, RadianteKDMF32 as KDMF32 };
