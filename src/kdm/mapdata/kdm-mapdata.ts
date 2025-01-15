import { RadianteKDM } from "#kdm/kdm";
import type { CTRMemory } from "libctr";
import { RadianteKDMMapData0x15 } from "#kdm/mapdata/mapdata0x15";
import type { IRadianteKDMMapData0x15 } from "#kdm/mapdata/mapdata0x15";
import { RadianteKDMI32Parameter } from "#kdm/common/parameter/kdm-i32-parameter";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";

class RadianteKDMMapData extends RadianteKDM<IRadianteKDMMapData0x15[]> {
  public constructor(
    bufferOrState?: Buffer | CTRMemory | IRadianteKDMMapData0x15[]
  ) {
    super(
      [[0x15, RadianteKDMMapData0x15]],
      [[new RadianteKDMStringPointer("mapDataTable"), []]],
      [new RadianteKDMI32Parameter("mapDataTableLen")],
      bufferOrState
    );
  }
}

export { RadianteKDMMapData, RadianteKDMMapData as KDMMapData };
