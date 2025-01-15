import { CTRMemory } from "libctr";
import type { CTRMemoryDataType } from "libctr";
import { RadianteKDMEntity } from "#kdm/common/kdm-entity";

type RadianteKDMNumberType = CTRMemoryDataType &
  `${"i" | "u" | "f"}${"8" | "16" | "32"}`;

abstract class RadianteKDMNumber extends RadianteKDMEntity<number> {
  public number: number;
  public type: RadianteKDMNumberType;

  public constructor(type: RadianteKDMNumberType, number?: number) {
    super();

    this.number = 0;
    this.type = type;

    if (number !== undefined) {
      this.set(number);
    }
  }

  protected override _get(): number {
    return this.number;
  }

  protected override _set(number: number): void {
    this.number = number;
  }

  protected override _build(buffer: CTRMemory): void {
    buffer[this.type](this.number);
  }

  protected override _parse(buffer: CTRMemory): void {
    this.number = buffer[this.type](undefined);
  }

  protected override _sizeof(): number {
    return CTRMemory.sizeof(this.type);
  }

  protected override _validate(number: unknown): null | Error {
    if (typeof number !== "number") {
      return new Error("kdm.err_invalid_state");
    }

    if (number > CTRMemory.max(this.type)) {
      return new Error("kdm.err_overflow");
    }

    if (number < CTRMemory.min(this.type)) {
      return new Error("kdm.err_underflow");
    }

    return null;
  }
}

export { RadianteKDMNumber, RadianteKDMNumber as KDMNumber };
