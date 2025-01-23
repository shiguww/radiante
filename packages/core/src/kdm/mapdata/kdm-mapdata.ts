import { CTRMemory } from "libctr";
import { RadianteKDM } from "#kdm/kdm";
import type { CTRMemoryArray } from "libctr";
import { lexicographicalSorting } from "#utils";
import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";
import { RadianteKDMMapData0x15 } from "#kdm/mapdata/mapdata0x15";
import type { IRadianteKDMMapData0x15 } from "#kdm/mapdata/mapdata0x15";
import { RadianteKDMI32Parameter } from "#kdm/common/parameter/kdm-i32-parameter";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";
import { RadianteKDMStructArrayPointer } from "#kdm/common/primitive/kdm-struct-array-pointer";

interface IRadianteKDMMapData {
  map_data_table: string[];
  maps: IRadianteKDMMapData0x15[];
}

class RadianteKDMMapData extends RadianteKDM<IRadianteKDMMapData> {
  private static readonly MAP_DATA_TABLE = "mapDataTable";
  private static readonly MAP_DATA_TABLE_LEN = "mapDataTableLen";

  private readonly _mapDataTableLen: RadianteKDMI32Parameter;
  private readonly _mapDataTable: RadianteKDMStructArrayPointer<RadianteKDMMapData0x15>[];

  public constructor(buffer?: CTRMemoryArray) {
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

    if (buffer !== undefined) {
      this.parse(buffer);
    }
  }

  protected override _get(): IRadianteKDMMapData {
    const maps = Array.from(this.arrays.keys())
      .filter((arr) => arr.every((e) => e instanceof RadianteKDMMapData0x15))
      .map((arr) => arr.map((e) => e.get())[0])
      .filter((m) => m !== undefined);

    const map_data_table = this._mapDataTable
      .map((p) => p.array?.[0]?.struct.unknown0 || null)
      .filter((m) => m !== null);

    return { maps, map_data_table };
  }

  protected override _set(state: IRadianteKDMMapData): void {
    for (const map of state.maps) {
      const array = [new RadianteKDMMapData0x15(map)];
      this.arrays.set(array, 0);

      if (
        map.unknown0 !== null &&
        state.map_data_table.includes(map.unknown0)
      ) {
        const pointer = new RadianteKDMStructArrayPointer(array);
        this._mapDataTable.push(pointer);
      }
    }
  }

  protected override _build(buffer: CTRMemory): void {
    let id = 0x16;

    this._mapDataTable.push(new RadianteKDMStructArrayPointer(null));

    this.arrays.forEach((_, arr) => {
      this.entities.set(id++, arr);
      arr.forEach((e) => this._addString(...e.strings));
    });

    this.entities.set(id++, this._mapDataTable);
    this._addString(RadianteKDMMapData.MAP_DATA_TABLE);

    this.entities.set(id++, this._mapDataTableLen);
    this._addString(RadianteKDMMapData.MAP_DATA_TABLE_LEN);

    this._mapDataTable.sort((a, b) => {
      if (a.first !== null && b.first !== null) {
        return lexicographicalSorting(
          a.first.struct.unknown0 || "",
          b.first.struct.unknown0 || ""
        );
      }

      return 0;
    });

    this._mapDataTableLen.value.set(this._mapDataTable.length);
    super._build(buffer);
  }

  protected override _validate(
    state: unknown
  ): null | RadianteKDMInvalidStateError {
    return null;
  }
}

export { RadianteKDMMapData, RadianteKDMMapData as KDMMapData };
export type { IRadianteKDMMapData, IRadianteKDMMapData as IKDMMapData };
