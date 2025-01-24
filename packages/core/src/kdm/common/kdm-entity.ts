import type { ZodType } from "zod";
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
  public abstract get schema(): ZodType<T>;

  public get _type(): RadianteKDMEntityConstructor<T> {
    return <RadianteKDMEntityConstructor<T>>this.constructor;
  }

  public get strings(): RadianteKDMStringPointer[] {
    return [];
  }

  protected override _validate(
    input: unknown
  ): null | RadianteKDMInvalidStateError {
    const result = this.schema.safeParse(input);

    if (result.error !== undefined) {
      return new RadianteKDMInvalidStateError(result.error);
    }

    return null;
  }
}

export { RadianteKDMEntity, RadianteKDMEntity as KDMEntity };

export type {
  RadianteKDMEntityConstructor,
  RadianteKDMEntityConstructor as KDMEntityConstructor
};
