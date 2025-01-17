import { CTRMemory } from "libctr";
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
  name: string;
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

  protected override _validate(parameter: unknown): null | Error {
    if (parameter === null || typeof parameter !== "object") {
      return new Error("kdm.err_invalid_state");
    }

    if (this.name.validate(Reflect.get(parameter, "name"))) {
      return new Error("kdm.err_invalid_state");
    }

    if (this.value.validate(Reflect.get(parameter, "value"))) {
      return new Error("kdm.err_invalid_state");
    }

    return new Error("kdm.err_invalid_state");
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
