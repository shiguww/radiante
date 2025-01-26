import { CTRBinarySerializable } from "libctr";
import type { CTREventEmitterEventMap } from "libctr";
import type { RadianteKSMContext } from "#ksm/ksm-context";

abstract class RadianteKSMEntity<
  S = never,
  E extends CTREventEmitterEventMap = CTREventEmitterEventMap
> extends CTRBinarySerializable<S, E, RadianteKSMContext> {}

export { RadianteKSMEntity, RadianteKSMEntity as KSMEntity };
