import { _validateAt } from "#kdm/kdm-utils";
import { CTRBinarySerializable } from "libctr";
import type { CTREventEmitterEventMap } from "libctr";
import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";
import type { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

type RadianteKDMEntityConstructor<T = unknown> = new () => RadianteKDMEntity<T>;

abstract class RadianteKDMEntity<T = unknown> extends CTRBinarySerializable<
  T,
  CTREventEmitterEventMap,
  RadianteKDMBuildContext,
  RadianteKDMParseContext,
  Error,
  Error,
  RadianteKDMInvalidStateError
> {
  public get _type(): RadianteKDMEntityConstructor<T> {
    return <RadianteKDMEntityConstructor<T>>this.constructor;
  }

  public get strings(): RadianteKDMStringPointer[] {
    return [];
  }

  public override validate(
    input: unknown
  ): null | RadianteKDMInvalidStateError {
    return this._validate(input);
  }

  protected abstract override _validate(
    input: unknown
  ): null | RadianteKDMInvalidStateError;

  public _validateAt(
    input: unknown,
    state: unknown,
    path: (string | number)[]
  ): null | RadianteKDMInvalidStateError {
    return _validateAt(input, state, path, this);
  }
}

export { RadianteKDMEntity, RadianteKDMEntity as KDMEntity };

export type {
  RadianteKDMEntityConstructor,
  RadianteKDMEntityConstructor as KDMEntityConstructor
};
