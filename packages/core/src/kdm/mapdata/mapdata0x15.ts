import type { ZodType } from "zod";
import type { CTRMemoryArray } from "libctr";
import { RadianteKDMStruct } from "#kdm/common/kdm-struct";
import { RadianteKDMI32 } from "#kdm/common/primitive/kdm-i32";
import type { RadianteKDMStructObject } from "#kdm/common/kdm-struct";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";

type RadianteKDMMapData0x15Definition = ReturnType<typeof _definition>;

interface IRadianteKDMMapData0x15
  extends RadianteKDMStructObject<RadianteKDMMapData0x15> {}

class RadianteKDMMapData0x15 extends RadianteKDMStruct<
  "MapData0x15",
  RadianteKDMMapData0x15Definition
> {
  public static get schema(): ZodType<IRadianteKDMMapData0x15> {
    return new RadianteKDMMapData0x15().schema;
  }

  public constructor(stateOrBuffer?: CTRMemoryArray | IRadianteKDMMapData0x15) {
    super("MapData0x15", _definition(), stateOrBuffer);
  }
}

function _definition() {
  return [
    ["unknown0", new RadianteKDMStringPointer()],
    ["unknown1", new RadianteKDMStringPointer()],
    ["unknown2", new RadianteKDMStringPointer()],
    ["unknown3", new RadianteKDMStringPointer()],
    ["unknown4", new RadianteKDMStringPointer()],
    ["unknown5", new RadianteKDMI32()],
    ["unknown6", new RadianteKDMStringPointer()],
    ["unknown7", new RadianteKDMStringPointer()],
    ["unknown8", new RadianteKDMStringPointer()],
    ["unknown9", new RadianteKDMI32()],
    ["unknown10", new RadianteKDMStringPointer()],
    ["unknown11", new RadianteKDMStringPointer()],
    ["unknown12", new RadianteKDMStringPointer()],
    ["unknown13", new RadianteKDMStringPointer()],
    ["unknown14", new RadianteKDMStringPointer()],
    ["unknown15", new RadianteKDMStringPointer()],
    ["unknown16", new RadianteKDMStringPointer()],
    ["unknown17", new RadianteKDMI32()]
  ] as const;
}

export { RadianteKDMMapData0x15, RadianteKDMMapData0x15 as KDMMapData0x15 };

export type {
  IRadianteKDMMapData0x15,
  IRadianteKDMMapData0x15 as IKDMMapData0x15,
  RadianteKDMMapData0x15Definition,
  RadianteKDMMapData0x15Definition as KDMMapData0x15Definition
};
