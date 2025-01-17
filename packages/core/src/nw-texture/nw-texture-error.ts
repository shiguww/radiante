import { CTRError } from "libctr";
import type { CTRMemory } from "libctr";

type RadianteNWTextureErrorCode =
  | typeof RadianteNWTextureError.ERR_MALFORMED_DATA
  | typeof RadianteNWTextureError.ERR_MALFORMED_INFO;

class RadianteNWTextureError<
  C extends RadianteNWTextureErrorCode
> extends CTRError<
  C,
  {
    data: CTRMemory;
    info: CTRMemory;
  }
> {
  public static readonly ERR_MALFORMED_DATA = "nwtexture.err_malformed_data";
  public static readonly ERR_MALFORMED_INFO = "nwtexture.err_malformed_info";

  public static is<C extends RadianteNWTextureErrorCode>(
    err: unknown,
    code?: C
  ): err is RadianteNWTextureError<C> {
    return (
      err instanceof RadianteNWTextureError &&
      (code === undefined || err.code === code)
    );
  }
}

export { RadianteNWTextureError, RadianteNWTextureError as NWTextureError };

export type {
  RadianteNWTextureErrorCode,
  RadianteNWTextureErrorCode as NWTextureErrorCode
};
