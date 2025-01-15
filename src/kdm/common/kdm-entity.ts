import { CTRBinarySerializable } from "libctr";
import type { CTREventEmitterEventMap } from "libctr";
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
  public get strings(): RadianteKDMStringPointer[] {
    return [];
  }
}

export { RadianteKDMEntity, RadianteKDMEntity as KDMEntity };

export type {
  RadianteKDMEntityConstructor,
  RadianteKDMEntityConstructor as KDMEntityConstructor
};
