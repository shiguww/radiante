import { CTRError } from "libctr";
import type { CTRMemory } from "libctr";
import type { RadianteCTRT } from "#ctrt/ctrt";

type RadianteCTRTErrorCode =
  | typeof RadianteCTRTError.ERR_BUILD
  | typeof RadianteCTRTError.ERR_PARSE
  | typeof RadianteCTRTError.ERR_UNKNOWN
  | typeof RadianteCTRTError.ERR_INVALID_HEADER
  | typeof RadianteCTRTError.ERR_NOT_A_CTRT_FILE
  | typeof RadianteCTRTError.ERR_BUFFER_TOO_SMALL
  | typeof RadianteCTRTError.ERR_UNRECOGNIZED_TYPE
  | typeof RadianteCTRTError.ERR_UNEXPECTED_END_OF_FILE;

class RadianteCTRTError extends CTRError {
  public static readonly ERR_BUILD = "ctrt.err_build";
  public static readonly ERR_PARSE = "ctrt.err_parse";
  public static readonly ERR_UNKNOWN = "ctrt.err_unknown";
  public static readonly ERR_INVALID_HEADER = "ctrt.err_invalid_header";
  public static readonly ERR_NOT_A_CTRT_FILE = "ctrt.err_not_a_ctrt_file";
  public static readonly ERR_BUFFER_TOO_SMALL = "ctrt.err_buffer_too_small";
  public static readonly ERR_UNRECOGNIZED_TYPE = "ctrt.err_unrecognized_type";

  public static readonly ERR_UNEXPECTED_END_OF_FILE =
    "ctrt.err_unexpected_end_of_file";

  public readonly texture: RadianteCTRT;
  public override readonly code: RadianteCTRTErrorCode;

  public constructor(
    code: null | undefined | RadianteCTRTErrorCode,
    texture: RadianteCTRT,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.texture = texture;
    this.code = code || RadianteCTRTError.ERR_UNKNOWN;
  }
}

type RadianteCTRTFormatErrorCode =
  | typeof RadianteCTRTError.ERR_BUILD
  | typeof RadianteCTRTError.ERR_PARSE;

class RadianteCTRTFormatError extends RadianteCTRTError {
  public readonly buffer: CTRMemory;
  public override readonly code: RadianteCTRTFormatErrorCode;

  public constructor(
    code: RadianteCTRTFormatErrorCode,
    buffer: CTRMemory,
    texture: RadianteCTRT,
    message?: string,
    cause?: unknown
  ) {
    super(null, texture, message, cause);

    this.code = code;
    this.buffer = buffer;
  }
}

class RadianteCTRTUnrecognizedTypeError extends RadianteCTRTError {
  public readonly type: number | string;
  public override readonly code: typeof RadianteCTRTError.ERR_UNRECOGNIZED_TYPE;

  public constructor(
    texture: RadianteCTRT,
    type: number | string,
    message?: string,
    cause?: unknown
  ) {
    super(null, texture, message, cause);

    this.type = type;
    this.code = RadianteCTRTError.ERR_UNRECOGNIZED_TYPE;
  }
}

export {
  RadianteCTRTError,
  RadianteCTRTError as CTRTError,
  RadianteCTRTFormatError,
  RadianteCTRTFormatError as CTRTFormatError,
  RadianteCTRTUnrecognizedTypeError,
  RadianteCTRTUnrecognizedTypeError as CTRTUnrecognizedTypeError
};

export type {
  RadianteCTRTErrorCode,
  RadianteCTRTErrorCode as CTRTErrorCode,
  RadianteCTRTFormatErrorCode,
  RadianteCTRTFormatErrorCode as CTRTFormatErrorCode
};
