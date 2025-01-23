import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";
import { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

class RadianteKDMStringPointer extends RadianteKDMPointer<null | string> {
  public string: null | string;

  public constructor(string?: string) {
    super();

    this.string = null;

    if (string !== undefined) {
      this.set(string);
    }
  }

  protected override _get(): null | string {
    return this.string || null;
  }

  protected override _set(string: null | string): void {
    this.string = string || null;
  }

  protected override _resolve(ctx: RadianteKDMBuildContext): void {
    this._pointer =
      this.string === null ? 0 : ctx.instance.strings.get(this.string) || 0;
  }

  protected override _validate(
    input: unknown
  ): null | RadianteKDMInvalidStateError {
    const state = input;

    if (input !== null && typeof input !== "string") {
      return new RadianteKDMInvalidStateError({
        input,
        state,
        path: []
      });
    }

    return null;
  }

  protected override _dereference(ctx: RadianteKDMParseContext): void {
    this.string = null;

    if (this._pointer !== 0) {
      this.string = ctx.strings.get(this._pointer) || null;
    }
  }
}

export {
  RadianteKDMStringPointer,
  RadianteKDMStringPointer as KDMStringPointer
};
