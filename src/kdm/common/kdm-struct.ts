import { CTRMemory } from "libctr";
import type { CTRMemoryArray } from "libctr";
import { KDMEntity } from "#kdm/common/kdm-entity";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

interface RadianteKDMStructDefinition extends Array<[string, KDMEntity<any>]> {}

type RadianteKDMStructObject<
  N extends string,
  T extends RadianteKDMStructDefinition
> = {
  [K in T[number] as K[0]]: K[1] extends KDMEntity<infer S> ? S : never;
} & Record<"entity", N>;

abstract class RadianteKDMStruct<
  N extends string = string,
  T extends RadianteKDMStructDefinition = RadianteKDMStructDefinition
> extends KDMEntity<RadianteKDMStructObject<N, T>> {
  protected _struct: T;
  private readonly _name: N;

  protected constructor(
    name: N,
    struct: T,
    stateOrBuffer?: CTRMemoryArray | RadianteKDMStructObject<N, T>
  ) {
    super();

    this._name = name;
    this._struct = struct;

    if (CTRMemory.isSource(stateOrBuffer)) {
      this.parse(stateOrBuffer);
    } else if (stateOrBuffer !== undefined) {
      this.set(stateOrBuffer);
    }
  }

  public get fields(): T[number][1][] {
    return this._struct.map(([, field]) => field);
  }

  protected override _get(): RadianteKDMStructObject<N, T> {
    return Object.assign(
      Object.create(null),
      Object.fromEntries(
        this._struct.map(([key, field]) => [key, field.get()])
      ),
      {
        entity: this._name
      }
    );
  }

  protected override _set(state: RadianteKDMStructObject<N, T>): void {
    for (const [key, field] of this._struct) {
      field.set(Reflect.get(state, key));
    }
  }

  protected override _build(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    this.fields.forEach((f) => f.build(buffer, ctx));
  }

  protected override _parse(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    this.fields.forEach((f) => f.parse(buffer, ctx));
  }

  protected override _sizeof(): number {
    return this.fields
      .map((f) => f.sizeof)
      .reduce((prev, curr) => prev + curr, 0);
  }

  protected override _validate(state: unknown): null | Error {
    if (state === null || typeof state !== "object") {
      return new Error("kdm.err_invalid_state");
    }

    for (const [key, field] of this._struct) {
      const value = Reflect.get(state, key);
      const err = field.validate(value);

      if (err !== null) {
        return new Error("kdm.err_invalid_state");
      }
    }

    return null;
  }
}

export { RadianteKDMStruct, RadianteKDMStruct as KDMStruct };

export type {
  RadianteKDMStructObject,
  RadianteKDMStructObject as KDMStructObject,
  RadianteKDMStructDefinition,
  RadianteKDMStructDefinition as KDMStructDefinition
};
