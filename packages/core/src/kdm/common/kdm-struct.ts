import { CTRMemory } from "libctr";
import type { CTRMemoryArray } from "libctr";
import { KDMEntity } from "#kdm/common/kdm-entity";
import { RadianteKDMStringPointer } from "#kdm/common/primitive/kdm-string-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";
import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";

type RadianteKDMStructConstructor<
  T extends RadianteKDMStructDefinition = RadianteKDMStructDefinition
> = new () => RadianteKDMStruct<string, T>;

interface RadianteKDMStructDefinition extends Array<[string, KDMEntity<any>]> {}

type RadianteKDMStructObject<S extends RadianteKDMStruct = RadianteKDMStruct> =
  S extends RadianteKDMStruct<infer N, infer T>
    ? {
        [K in T[number] as K[0]]: K[1] extends KDMEntity<infer S> ? S : never;
      } & Record<"entity", N>
    : never;

abstract class RadianteKDMStruct<
  N extends string = string,
  T extends RadianteKDMStructDefinition = RadianteKDMStructDefinition
> extends KDMEntity<RadianteKDMStructObject<RadianteKDMStruct<N, T>>> {
  protected _definition: T;
  private readonly _name: N;

  protected constructor(
    name: N,
    definition: T,
    stateOrBuffer?:
      | CTRMemoryArray
      | RadianteKDMStructObject<RadianteKDMStruct<N, T>>
  ) {
    super();

    this._name = name;
    this._definition = definition;

    if (CTRMemory.isSource(stateOrBuffer)) {
      this.parse(stateOrBuffer);
    } else if (stateOrBuffer !== undefined) {
      this.set(stateOrBuffer);
    }
  }

  public get fields(): T[number][1][] {
    return this._definition.map(([, field]) => field);
  }

  public get struct(): RadianteKDMStructObject<RadianteKDMStruct<N, T>> {
    return Object.assign(
      Object.create(null),
      Object.fromEntries(
        this._definition.map(([key, field]) => [key, field.get()])
      ),
      {
        entity: this._name
      }
    );
  }

  public override get strings(): RadianteKDMStringPointer[] {
    return this.fields.filter((f) => f instanceof RadianteKDMStringPointer);
  }

  protected override _get(): RadianteKDMStructObject<RadianteKDMStruct<N, T>> {
    return this.struct;
  }

  protected override _set(
    state: RadianteKDMStructObject<RadianteKDMStruct<N, T>>
  ): void {
    for (const [key, field] of this._definition) {
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

  protected override _validate(
    input: unknown
  ): null | RadianteKDMInvalidStateError {
    const state: unknown = input;

    if (input === null || typeof input !== "object") {
      return new RadianteKDMInvalidStateError({ input, state, path: [] });
    }

    for (const [key, field] of this._definition) {
      const err = field._validateAt(input, Reflect.get(input, key), [key]);

      if (err !== null) {
        return err;
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
  RadianteKDMStructDefinition as KDMStructDefinition,
  RadianteKDMStructConstructor,
  RadianteKDMStructConstructor as KDMStructConstructor
};
