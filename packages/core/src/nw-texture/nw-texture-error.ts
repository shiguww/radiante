import { CTRError } from "libctr";
import type { CTRMemory } from "libctr";

type RadianteNWTextureErrorCode =
  | typeof RadianteNWTextureError.ERR_DECODE
  | typeof RadianteNWTextureError.ERR_ENCODE
  | typeof RadianteNWTextureError.ERR_UNKNOWN
  | typeof RadianteNWTextureError.ERR_MALFORMED_DATA
  | typeof RadianteNWTextureError.ERR_MALFORMED_INFO;

class RadianteNWTextureError extends CTRError {
  public static readonly ERR_DECODE = "nwtexture.err_decode";
  public static readonly ERR_ENCODE = "nwtexture.err_encode";
  public static readonly ERR_UNKNOWN = "nwtexture.err_unknown";
  public static readonly ERR_MALFORMED_DATA = "nwtexture.err_malformed_data";
  public static readonly ERR_MALFORMED_INFO = "nwtexture.err_malformed_info";

  public readonly data: CTRMemory;
  public readonly info: CTRMemory;
  public override readonly code: RadianteNWTextureErrorCode;

  public constructor(
    code: null | undefined | RadianteNWTextureErrorCode,
    data: CTRMemory,
    info: CTRMemory,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.data = data;
    this.info = info;
    this.code = code || RadianteNWTextureError.ERR_UNKNOWN;
  }
}

export { RadianteNWTextureError, RadianteNWTextureError as NWTextureError };

export type {
  RadianteNWTextureErrorCode,
  RadianteNWTextureErrorCode as NWTextureErrorCode
};
