import { RadianteKDMStruct } from "#kdm/common/kdm-struct";
import { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

import type {
  RadianteKDMStructObject,
  RadianteKDMStructDefinition
} from "#kdm/common/kdm-struct";

class RadianteKDMStructArrayPointer extends RadianteKDMPointer<
  null | RadianteKDMStructObject<string, RadianteKDMStructDefinition>[]
> {
  private _array: null | RadianteKDMStruct[];

  public constructor(array?: null | RadianteKDMStruct[]) {
    super();
    this._array = array || null;
  }

  public get array(): null | RadianteKDMStruct[] {
    return this._array;
  }

  protected override _get():
    | null
    | RadianteKDMStructObject<string, RadianteKDMStructDefinition>[] {
    if (this._array === null) {
      return null;
    }

    return this._array.map((e) => e.get());
  }

  protected override _resolve(ctx: RadianteKDMBuildContext): void {
    if (this._array === null) {
      return void (this._pointer = 0);
    }

    const offset = ctx.arrays.get(this._array);

    if (offset === undefined) {
      throw "kdm.err_unknown_array";
    }

    this._pointer = offset;
  }

  protected override _dereference(ctx: RadianteKDMParseContext): void {
    if (this._pointer === 0) {
      return void (this._array = null);
    }

    const array = ctx.arrays.get(this._pointer);

    if (array === undefined) {
      throw "kdm.err_unknown_pointer";
    }

    if (!array.every((e) => e instanceof RadianteKDMStruct)) {
      throw "kdm.err_invalid_array_type";
    }

    this._array = array;
  }

  protected override _validate(array: unknown): null | Error {
    if (!Array.isArray(array)) {
      return new Error("kdm.err_invalid_state");
    }

    for (const entry of array) {
      if (entry === null || typeof entry !== "object") {
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
