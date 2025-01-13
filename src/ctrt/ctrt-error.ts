import { CTRError } from "libctr";
import type { CTRMemory } from "libctr";
import type { RadianteCTRT } from "#ctrt/ctrt";

type RadianteCTRTErrorCode =
  | typeof RadianteCTRTError.ERR_UNKNOWN
  | typeof RadianteCTRTError.ERR_INVALID_HEADER
  | typeof RadianteCTRTError.ERR_NOT_A_CTRT_FILE
  | typeof RadianteCTRTError.ERR_BUFFER_TOO_SMALL
  | typeof RadianteCTRTError.ERR_UNRECOGNIZED_TYPE
  | typeof RadianteCTRTError.ERR_UNEXPECTED_END_OF_FILE;

interface RadianteCTRTErrorMetadata {
  buffer?: CTRMemory;
  texture: RadianteCTRT;
  type?: number | string;
}

class RadianteCTRTError<
  C extends RadianteCTRTErrorCode = RadianteCTRTErrorCode,
  M extends RadianteCTRTErrorMetadata = RadianteCTRTErrorMetadata
> extends CTRError<C, M> {
  public static is<C extends RadianteCTRTErrorCode>(
    value: unknown,
    code?: C
  ): value is RadianteCTRTError<C> {
    return (
      value instanceof RadianteCTRTError &&
      (code === undefined || value.code === code)
    );
  }

  public static readonly ERR_UNKNOWN = "ctrt::err_unknown";
  public static readonly ERR_INVALID_HEADER = "ctrt::err_invalid_header";
  public static readonly ERR_NOT_A_CTRT_FILE = "ctrt::err_not_a_ctrt_file";
  public static readonly ERR_BUFFER_TOO_SMALL = "ctrt::err_buffer_too_small";
  public static readonly ERR_UNRECOGNIZED_TYPE = "ctrt::err_unrecognized_type";

  public static readonly ERR_UNEXPECTED_END_OF_FILE =
    "ctrt::err_unexpected_end_of_file";
}

interface RadianteCTRTFormatErrorMetadata
  extends Pick<RadianteCTRTErrorMetadata, "buffer" | "texture"> {}

class RadianteCTRTFormatError<
  C extends RadianteCTRTErrorCode
> extends RadianteCTRTError<C, RadianteCTRTFormatErrorMetadata> {}

interface RadianteCTRTUnrecognizedTypeErrorMetadata
  extends Pick<RadianteCTRTErrorMetadata, "type" | "texture"> {}

class RadianteCTRTUnrecognizedTypeError extends RadianteCTRTError<
  typeof RadianteCTRTError.ERR_UNRECOGNIZED_TYPE,
  RadianteCTRTUnrecognizedTypeErrorMetadata
> {
  public constructor(
    metadata: RadianteCTRTUnrecognizedTypeErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteCTRTError.ERR_UNRECOGNIZED_TYPE, metadata, message, cause);
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
  RadianteCTRTErrorMetadata,
  RadianteCTRTErrorMetadata as CTRTErrorMetadata,
  RadianteCTRTFormatErrorMetadata,
  RadianteCTRTFormatErrorMetadata as CTRTFormatErrorMetadata,
  RadianteCTRTUnrecognizedTypeErrorMetadata,
  RadianteCTRTUnrecognizedTypeErrorMetadata as CTRTUnrecognizedTypeErrorMetadata
};
