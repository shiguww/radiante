import {
  KDMEmptyArrayError,
  RadianteKDMInvalidPointerError,
  RadianteKDMInvalidStateError,
  RadianteKDMUnknownArrayError
} from "#kdm/kdm-error";
import { RadianteKDMStruct } from "#kdm/common/kdm-struct";
import type { RadianteKDMStructObject } from "#kdm/common/kdm-struct";
import { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

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
        throw new KDMEmptyArrayError({ array });
      }

      this._struct = <RadianteKDMStructConstructor<S>>array[0]._type;
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
      throw new RadianteKDMUnknownArrayError({
        array: this._array,
        instance: ctx.instance
      });
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
      throw new RadianteKDMInvalidPointerError({
        pointer: this,
        instance: ctx.instance
      });
    }

    this._array = <S[]>array;

    if (array[0] === undefined) {
      throw new KDMEmptyArrayError({ array });
    }

    this._struct = <RadianteKDMStructConstructor<S>>array[0]._type;
  }

  protected override _validate(state: unknown): null | Error {
    const input = state;

    if (input === null) {
      return null;
    }

    if (this._struct === null) {
      return new RadianteKDMInvalidStateError({
        input,
        state,
        path: []
      });
    }

    if (!Array.isArray(input)) {
      return new RadianteKDMInvalidStateError({
        state,
        input,
        path: []
      });
    }

    const struct = new this._struct();

    for (let i = 0; i < input.length; i += 1) {
      if (input[i] === null) {
        continue;
      }

      const err = struct._validateAt(input, i);

      if (err !== null) {
        return err;
      }
    }

    return null;
  }
}

export {
  RadianteKDMStructArrayPointer,
  RadianteKDMStructArrayPointer as KDMStructArrayPointer
};
