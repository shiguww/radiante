import z from "zod";
import { CTRMemory } from "libctr";
import type { ZodType } from "zod";
import { RadianteKDMEntity } from "#kdm/common/kdm-entity";
import { RadianteKDMI32 } from "#kdm/common/primitive/kdm-i32";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

interface IRadianteKDMBaseParameter<T, N extends string> {
  value: T;
  _entity: N;
  name: null | string;
}

abstract class RadianteKDMBaseParameter<
  T,
  N extends string
> extends RadianteKDMEntity<IRadianteKDMBaseParameter<T, N>> {
  private readonly _entity: N;
  public readonly unknown0: RadianteKDMI32;
  public readonly name: RadianteKDMStringPointer;
  public abstract readonly value: RadianteKDMEntity<T>;

  protected constructor(entity: N) {
    super();

    this._entity = entity;
    this.unknown0 = new RadianteKDMI32();
    this.name = new RadianteKDMStringPointer();
  }

  public override get schema(): ZodType<IRadianteKDMBaseParameter<T, N>> {
    return <ZodType<IRadianteKDMBaseParameter<T, N>>>z.object({
      name: this.name.schema,
      value: this.value.schema,
      _entity: z.literal(this._entity)
    });
  }

  protected override _get(): IRadianteKDMBaseParameter<T, N> {
    return {
      _entity: this._entity,
      name: this.name.get(),
      value: this.value.get()
    };
  }

  protected override _set(state: IRadianteKDMBaseParameter<T, N>): void {
    this.name.set(state.name);
    this.value.set(state.value);
  }

  protected override _build(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    this.name.build(buffer, ctx);
    this.unknown0.build(buffer, ctx);
    this.value.build(buffer, ctx);
  }

  protected override _parse(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    this.name.parse(buffer, ctx);
    this.unknown0.parse(buffer, ctx);
    this.value.parse(buffer, ctx);
  }

  protected override _sizeof(): number {
    return this.name.sizeof + this.unknown0.sizeof + this.value.sizeof;
  }
}

export {
  RadianteKDMBaseParameter,
  RadianteKDMBaseParameter as KDMBaseParameter
};

export type {
  IRadianteKDMBaseParameter,
  IRadianteKDMBaseParameter as IKDMBaseParameter
};
