import { CTRBinarySerializable } from "libctr";
import type { CTREventEmitterEventMap } from "libctr";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

abstract class RadianteKDMEntity<S = unknown> extends CTRBinarySerializable<
  S,
  CTREventEmitterEventMap,
  RadianteKDMBuildContext,
  RadianteKDMParseContext,
  null,
  null
> {
}

export { RadianteKDMEntity, RadianteKDMEntity as KDMEntity };
