import z from "zod";
import type { ZodType } from "zod";
import { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

class RadianteKDMStringPointer extends RadianteKDMPointer<null | string> {
  public static readonly schema: ZodType<null | string> = z
    .string()
    .nullable()
    .transform((s) => (typeof s === "string" && s.length === 0 ? null : s));

  public string: null | string;

  public constructor(string?: string) {
    super();

    this.string = null;

    if (string !== undefined) {
      this.set(string);
    }
  }

  public override get schema(): ZodType<null | string> {
    return RadianteKDMStringPointer.schema;
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
