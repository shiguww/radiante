import { CTRError } from "libctr";

type RadianteLocaleErrorCode =
  | typeof RadianteLocaleError.ERR_INVALID_LOCALE
  | typeof RadianteLocaleError.ERR_INVALID_LOCALE_CODE;

interface RadianteLocaleErrorMetadata {
  code?: string;
  locale?: string;
}

abstract class RadianteLocaleError<
  C extends RadianteLocaleErrorCode,
  M extends RadianteLocaleErrorMetadata
> extends CTRError<C, M> {
  public static readonly ERR_INVALID_LOCALE = "locale.err_invalid_locale";

  public static readonly ERR_INVALID_LOCALE_CODE =
    "locale.err_invalid_locale_code";
}

interface RadianteInvalidLocaleErrorMetadata
  extends Pick<Required<RadianteLocaleErrorMetadata>, "locale"> {}

class RadianteInvalidLocaleError extends RadianteLocaleError<
  typeof RadianteLocaleError.ERR_INVALID_LOCALE,
  RadianteInvalidLocaleErrorMetadata
> {
  public static is(err: unknown): err is RadianteInvalidLocaleError {
    return err instanceof RadianteInvalidLocaleError;
  }

  public constructor(
    metadata: RadianteInvalidLocaleErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(
      RadianteLocaleError.ERR_INVALID_LOCALE,
      metadata,
      message || `Invalid locale '${metadata.locale}'`,
      cause
    );
  }
}

interface RadianteInvalidLocaleCodeErrorMetadata
  extends Pick<Required<RadianteLocaleErrorMetadata>, "code"> {}

class RadianteInvalidLocaleCodeError extends RadianteLocaleError<
  typeof RadianteLocaleError.ERR_INVALID_LOCALE_CODE,
  RadianteInvalidLocaleCodeErrorMetadata
> {
  public static is(err: unknown): err is RadianteInvalidLocaleCodeError {
    return err instanceof RadianteInvalidLocaleCodeError;
  }

  public constructor(
    metadata: RadianteInvalidLocaleCodeErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(
      RadianteLocaleError.ERR_INVALID_LOCALE_CODE,
      metadata,
      message || `Invalid locale code '${metadata.code}'`,
      cause
    );
  }
}

export {
  RadianteLocaleError,
  RadianteLocaleError as LocaleError,
  RadianteInvalidLocaleError,
  RadianteInvalidLocaleError as InvalidLocaleError,
  RadianteInvalidLocaleCodeError,
  RadianteInvalidLocaleCodeError as InvalidLocaleCodeError
};

export type {
  RadianteLocaleErrorCode,
  RadianteLocaleErrorCode as LocaleErrorCode,
  RadianteLocaleErrorMetadata,
  RadianteLocaleErrorMetadata as LocaleErrorMetadata,
  RadianteInvalidLocaleErrorMetadata,
  RadianteInvalidLocaleErrorMetadata as InvalidLocaleErrorMetadata,
  RadianteInvalidLocaleCodeErrorMetadata,
  RadianteInvalidLocaleCodeErrorMetadata as InvalidLocaleCodeErrorMetadata
};
