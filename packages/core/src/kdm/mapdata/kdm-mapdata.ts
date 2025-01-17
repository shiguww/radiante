import { CTRMemory } from "libctr";
import { RadianteKDM } from "#kdm/kdm";
import { lexicographicalSorting } from "#utils";
import { RadianteKDMMapData0x15 } from "#kdm/mapdata/mapdata0x15";
import type { IRadianteKDMMapData0x15 } from "#kdm/mapdata/mapdata0x15";
import { RadianteKDMI32Parameter } from "#kdm/common/parameter/kdm-i32-parameter";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";
import { RadianteKDMStructArrayPointer } from "#kdm/common/primitive/kdm-struct-array-pointer";
import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";

type IRadianteKDMMapData = IRadianteKDMMapData0x15[];

class RadianteKDMMapData extends RadianteKDM<IRadianteKDMMapData> {
  private static readonly MAP_DATA_TABLE = "mapDataTable";
  private static readonly MAP_DATA_TABLE_LEN = "mapDataTableLen";

  private readonly _mapDataTableLen: RadianteKDMI32Parameter;
  private readonly _mapDataTable: RadianteKDMStructArrayPointer<RadianteKDMMapData0x15>[];

  public constructor(bufferOrState?: Buffer | CTRMemory | IRadianteKDMMapData) {
    const mapDataTable: RadianteKDMStructArrayPointer<RadianteKDMMapData0x15>[] =
      [];

    const mapDataTableLen = new RadianteKDMI32Parameter(
      RadianteKDMMapData.MAP_DATA_TABLE_LEN
    );

    super(
      [[0x15, RadianteKDMMapData0x15]],
      [
        [
          new RadianteKDMStringPointer(RadianteKDMMapData.MAP_DATA_TABLE),
          mapDataTable
        ]
      ],
      [mapDataTableLen]
    );

    this._mapDataTable = mapDataTable;
    this._mapDataTableLen = mapDataTableLen;

    if (Buffer.isBuffer(bufferOrState) || bufferOrState instanceof CTRMemory) {
      this.parse(bufferOrState);
    } else if (bufferOrState !== undefined) {
      this.set(bufferOrState);
    }
  }

  protected override _get(): IRadianteKDMMapData {
    this._mapDataTable.sort(
      (a, b) =>
        Number(this.arrays.get(a.array!)) - Number(this.arrays.get(b.array!))
    );

    return this._mapDataTable
      .map((e) => e.get())
      .flat()
      .filter((e) => e !== null);
  }

  protected override _set(array: IRadianteKDMMapData): void {
    this._mapDataTable.length = 0;

    for (const entry of array) {
      const array = entry === null ? null : [new RadianteKDMMapData0x15(entry)];
      const pointer = new RadianteKDMStructArrayPointer(array);

      this._mapDataTable.push(pointer);
    }
  }

  protected override _build(buffer: CTRMemory): void {
    let id = 0x16;

    this._mapDataTable.forEach((pointer) => {
      if (pointer.array === null) {
        return;
      }

      this.arrays.set(pointer.array, 0);
      this.entities.set(id++, pointer.array);

      pointer.array.forEach((e) =>
        e.strings.forEach((s) => {
          if (s.string !== "" && !this.strings.has(s.string)) {
            this.strings.set(s.string, 0);
          }
        })
      );
    });

    this.entities.set(id++, this._mapDataTable);
    this.strings.set(RadianteKDMMapData.MAP_DATA_TABLE, 0);

    this.entities.set(id++, this._mapDataTableLen);
    this.strings.set(RadianteKDMMapData.MAP_DATA_TABLE_LEN, 0);

    this._mapDataTable.sort((a, b) => {
      if (a.first !== null && b.first !== null) {
        return lexicographicalSorting(
          a.first.struct.unknown0 || "",
          b.first.struct.unknown0 || ""
        );
      }

      return 0;
    });

    this._mapDataTable.push(new RadianteKDMStructArrayPointer(null));
    this._mapDataTableLen.value.set(this._mapDataTable.length);

    super._build(buffer);
  }

  protected override _validate(input: unknown): null | Error {
    if (!Array.isArray(input)) {
      return new RadianteKDMInvalidStateError({
        input,
        state: input,
        path: []
      });
    }

    let err: null | RadianteKDMInvalidStateError;

    for (let i = 0; i < input.length; i += 1) {
      if (input[i] === null) {
        continue;
      }

      err = new RadianteKDMMapData0x15()._validateAt(input, i);

      if (err !== null) {
        return err;
      }
    }

    return null;
  }
}

export { RadianteKDMMapData, RadianteKDMMapData as KDMMapData };
export type { IRadianteKDMMapData, IRadianteKDMMapData0x15 as IKDMMapData0x15 };
