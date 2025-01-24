import { CTRMemory } from "libctr";
import { KDMEntity } from "#kdm/common/kdm-entity";
import { RadianteKDMInvalidPointerError } from "#kdm/kdm-error";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

abstract class RadianteKDMPointer<S = unknown> extends KDMEntity<S> {
  protected _pointer: number;

  protected constructor() {
    super();
    this._pointer = 0;
  }

  public get pointer(): number {
    return this._pointer;
  }

  public resolve(buffer: CTRMemory, ctx: RadianteKDMBuildContext): this {
    const offset = ctx.pointers.get(this);

    if (offset === undefined) {
      throw new RadianteKDMInvalidPointerError(this);
    }

    this._resolve(ctx);
    buffer.at(offset, (buffer) => buffer.u32(this._pointer));

    return this;
  }

  public dereference(ctx: RadianteKDMParseContext): this {
    this._dereference(ctx);
    return this;
  }

  protected abstract _resolve(ctx: RadianteKDMBuildContext): void;
  protected abstract _dereference(ctx: RadianteKDMParseContext): void;

  protected override _build(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    ctx.pointers.set(this, buffer.offset);
    buffer.u32(this._pointer);
  }

  protected override _parse(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    ctx.pointers.set(buffer.offset, this);
    this._pointer = buffer.u32();
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE;
  }
}

export { RadianteKDMPointer, RadianteKDMPointer as KDMPointer };
