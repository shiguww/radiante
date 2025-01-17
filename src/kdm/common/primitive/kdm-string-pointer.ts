import { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";
import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";

class RadianteKDMStringPointer extends RadianteKDMPointer<string> {
  public string: string;

  public constructor(string?: string) {
    super();

    this.string = "";

    if (string !== undefined) {
      this.set(string);
    }
  }

  protected override _get(): string {
    return this.string;
  }

  protected override _set(string: string): void {
    this.string = string;
  }

  protected override _resolve(ctx: RadianteKDMBuildContext): void {
    this._pointer = ctx.instance.strings.get(this.string) || 0;
  }

  protected override _validate(state: unknown): null | Error {
    if (typeof state !== "string") {
      return new RadianteKDMInvalidStateError({
        state,
        path: [],
        input: state
      });
    }

    return null;
  }

  protected override _dereference(ctx: RadianteKDMParseContext): void {
    this.string = ctx.strings.get(this._pointer) || "";
  }
}

export {
  RadianteKDMStringPointer,
  RadianteKDMStringPointer as KDMStringPointer
};
