import { CTRMemory } from "libctr";
import { RadianteKDMEntity } from "#kdm/common/kdm-entity";
import { RadianteKDMError, RadianteKDMInvalidStateError } from "#kdm/kdm-error";

import type {
  RadianteKDMBuildContext,
  RadianteKDMParseContext
} from "#kdm/kdm";

class RadianteKDMString extends RadianteKDMEntity<string> {
  public static bytelength(string: string): number {
    return Math.ceil(CTRMemory.bytelength(string + "\0", "utf8") / 4) * 4;
  }

  private _string: string;

  public constructor(string?: string) {
    super();
    this._string = "";

    if (string !== undefined) {
      this.set(string);
    }
  }

  public get string(): string {
    return this._string;
  }

  protected override _get(): string {
    return this._string;
  }

  protected override _set(string: string): void {
    this._string = string;
  }

  protected override _build(
    buffer: CTRMemory,
    ctx: RadianteKDMBuildContext
  ): void {
    const offset = buffer.offset;
    const string = this._string;

    buffer.string(string, { encoding: "utf8", terminator: "\0" });

    while (buffer.offset % 4 !== 0) {
      buffer.u8(0x00);
    }

    ctx.instance.strings.set(string, offset);
  }

  protected override _parse(
    buffer: CTRMemory,
    ctx: RadianteKDMParseContext
  ): void {
    const offset = buffer.offset;
    const string = buffer.string({ encoding: "utf8", terminator: "\0" });

    while (buffer.offset % 4 !== 0) {
      if (buffer.u8() !== 0x00) {
        throw new RadianteKDMError(RadianteKDMError.ERR_MALFORMED_FILE);
      }
    }

    this._string = string;

    ctx.strings.set(offset, string);
    ctx.instance.strings.set(string, offset);
  }

  protected override _sizeof(): number {
    return RadianteKDMString.bytelength(this._string);
  }

  protected override _validate(
    input: unknown
  ): null | RadianteKDMInvalidStateError {
    if (typeof input !== "string") {
      return new RadianteKDMInvalidStateError([], input, input);
    }

    return null;
  }
}

export { RadianteKDMString, RadianteKDMString as KDMString };
