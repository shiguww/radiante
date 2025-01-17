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
  null,
  null
> {
  public get _type(): RadianteKDMEntityConstructor<T> {
    return <RadianteKDMEntityConstructor<T>>this.constructor;
  }

  public get strings(): RadianteKDMStringPointer[] {
    return [];
  }

  public _validateAt(
    input: object,
    path: string | number
  ): null | RadianteKDMInvalidStateError {
    const state = Reflect.get(input, path);
    const err = this.validate(state);

    if (err !== null) {
      if (err instanceof RadianteKDMInvalidStateError) {
        err.metadata.path.push(path);
        Object.defineProperty(err.metadata, "input", { value: input });

        return err;
      }

      return new RadianteKDMInvalidStateError(
        {
          input,
          state,
          path: [path]
        },
        undefined,
        err
      );
    }

    return null;
  }
}

export { RadianteKDMEntity, RadianteKDMEntity as KDMEntity };

export type {
  RadianteKDMEntityConstructor,
  RadianteKDMEntityConstructor as KDMEntityConstructor
};
