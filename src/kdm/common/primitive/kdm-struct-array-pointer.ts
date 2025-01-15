import { RadianteKDMStruct } from "#kdm/common/kdm-struct";
import { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";
import type { RadianteKDMStructObject } from "#kdm/common/kdm-struct";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

type RadianteKDMStructConstructor<
  S extends RadianteKDMStruct = RadianteKDMStruct
> = new () => S;

class RadianteKDMStructArrayPointer<
  S extends RadianteKDMStruct<any, any> = RadianteKDMStruct
> extends RadianteKDMPointer<null | RadianteKDMStructObject<S>[]> {
  private _array: null | S[];
  private _struct: null | RadianteKDMStructConstructor<S>;

  public constructor(array?: null | S[]) {
    super();

    this._struct = null;
    this._array = array || null;

    if (array !== null && array !== undefined) {
      if (array[0] === undefined) {
        throw "kdm.err_empty_array";
      }

      this._struct = <RadianteKDMStructConstructor<S>>array[0].constructor;
    }
  }

  public get array(): null | S[] {
    return this._array;
  }

  public get first(): S | null {
    return this._array?.[0] || null;
  }

  protected override _get(): null | RadianteKDMStructObject<S>[] {
    if (this._array === null) {
      return null;
    }

    return this._array.map((e) => <RadianteKDMStructObject<S>>e.get());
  }

  protected override _resolve(ctx: RadianteKDMBuildContext): void {
    if (this._array === null) {
      this._pointer = 0;
      return;
    }

    const offset = ctx.instance.arrays.get(this._array);

    if (offset === undefined) {
      throw "kdm.err_unknown_array";
    }

    this._pointer = offset;
  }

  protected override _dereference(ctx: RadianteKDMParseContext): void {
    if (this._pointer === 0) {
      this._array = null;
      return;
    }

    const array = ctx.arrays.get(this._pointer);

    if (array === undefined) {
      throw "kdm.err_unknown_pointer";
    }

    this._array = <S[]>array;

    if (array[0] === undefined) {
      throw "kdm.err_empty_array";
    }

    this._struct = <RadianteKDMStructConstructor<S>>array[0].constructor;
  }

  protected override _validate(array: unknown): null | Error {
    if (array === null) {
      return null;
    }

    if (this._struct === null) {
      throw "kdm.err_invalid_state";
    }

    if (!Array.isArray(array)) {
      return new Error("kdm.err_invalid_state");
    }

    for (const entry of array) {
      if (entry === null) {
        continue;
      }

      const struct = new this._struct();
      const err = struct.validate(entry);

      if (err !== null) {
        return new Error("kdm.err_invalid_state");
      }
    }

    return null;
  }
}

export {
  RadianteKDMStructArrayPointer,
  RadianteKDMStructArrayPointer as KDMStructArrayPointer
};
