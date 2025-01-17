import type { CTRMemoryArray } from "libctr";
import { RadianteKDMStruct } from "#kdm/common/kdm-struct";
import { RadianteKDMI32 } from "#kdm/common/primitive/kdm-i32";
import type { RadianteKDMStructObject } from "#kdm/common/kdm-struct";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";

type RadianteKDMMapData0x15Definition = [
  ["unknown0", RadianteKDMStringPointer],
  ["unknown1", RadianteKDMStringPointer],
  ["unknown2", RadianteKDMStringPointer],
  ["unknown3", RadianteKDMStringPointer],
  ["unknown4", RadianteKDMStringPointer],
  ["unknown5", RadianteKDMI32],
  ["unknown6", RadianteKDMStringPointer],
  ["unknown7", RadianteKDMStringPointer],
  ["unknown8", RadianteKDMStringPointer],
  ["unknown9", RadianteKDMI32],
  ["unknown10", RadianteKDMStringPointer],
  ["unknown11", RadianteKDMStringPointer],
  ["unknown12", RadianteKDMStringPointer],
  ["unknown13", RadianteKDMStringPointer],
  ["unknown14", RadianteKDMStringPointer],
  ["unknown15", RadianteKDMStringPointer],
  ["unknown16", RadianteKDMStringPointer],
  ["unknown17", RadianteKDMI32]
];

interface IRadianteKDMMapData0x15
  extends RadianteKDMStructObject<RadianteKDMMapData0x15> {}

class RadianteKDMMapData0x15 extends RadianteKDMStruct<
  "MapData0x15",
  RadianteKDMMapData0x15Definition
> {
  public constructor(stateOrBuffer?: CTRMemoryArray | IRadianteKDMMapData0x15) {
    super(
      "MapData0x15",
      [
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
      ],
      stateOrBuffer
    );
  }
}

export { RadianteKDMMapData0x15, RadianteKDMMapData0x15 as KDMMapData0x15 };

export type {
  IRadianteKDMMapData0x15,
  IRadianteKDMMapData0x15 as IKDMMapData0x15,
  RadianteKDMMapData0x15Definition,
  RadianteKDMMapData0x15Definition as KDMMapData0x15Definition
};
