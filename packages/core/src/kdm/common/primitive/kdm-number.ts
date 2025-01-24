import z from "zod";
import { CTRMemory } from "libctr";
import type { ZodNumber } from "zod";
import type { CTRMemoryDataType } from "libctr";
import { RadianteKDMEntity } from "#kdm/common/kdm-entity";

type RadianteKDMNumberType = CTRMemoryDataType &
  `${"i" | "u" | "f"}${"8" | "16" | "32"}`;

abstract class RadianteKDMNumber extends RadianteKDMEntity<number> {
  public number: number;
  public readonly type: RadianteKDMNumberType;

  public constructor(type: RadianteKDMNumberType, number?: number) {
    super();

    this.number = 0;
    this.type = type;

    if (number !== undefined) {
      this.set(number);
    }
  }

  public override get schema(): ZodNumber {
    return z
      .number()
      .max(Number(CTRMemory.max(this.type)))
      .min(Number(CTRMemory.min(this.type)));
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
}

export { RadianteKDMNumber, RadianteKDMNumber as KDMNumber };
