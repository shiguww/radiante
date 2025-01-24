import z from "zod";
import type { ZodType } from "zod";
import { RadianteKDMStruct } from "#kdm/common/kdm-struct";
import type { RadianteKDMStructObject } from "#kdm/common/kdm-struct";
import { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

import {
  KDMEmptyArrayError,
  RadianteKDMUnknownArrayError,
  RadianteKDMInvalidPointerError
} from "#kdm/kdm-error";

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
        throw new KDMEmptyArrayError(array);
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

  public override get schema(): ZodType<null | RadianteKDMStructObject<S>[]> {
    if (this._struct === null) {
      return z.null();
    }

    const instance = new this._struct();
    
    return <ZodType<null | RadianteKDMStructObject<S>[]>>(
      instance.schema.array().nullable()
    );
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
      throw new RadianteKDMUnknownArrayError(this._array);
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
      throw new RadianteKDMInvalidPointerError(this);
    }

    this._array = <S[]>array;

    if (array[0] === undefined) {
      throw new KDMEmptyArrayError(array);
    }

    this._struct = <RadianteKDMStructConstructor<S>>array[0]._type;
  }
}

export {
  RadianteKDMStructArrayPointer,
  RadianteKDMStructArrayPointer as KDMStructArrayPointer
};
