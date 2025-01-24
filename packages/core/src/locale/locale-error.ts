import { CTRError } from "libctr";

type RadianteLocaleErrorCode =
  | typeof RadianteLocaleError.ERR_UNKNOWN
  | typeof RadianteLocaleError.ERR_INVALID_LOCALE
  | typeof RadianteLocaleError.ERR_INVALID_LOCALE_CODE;

class RadianteLocaleError extends CTRError {
  public static readonly ERR_UNKNOWN = "locale.err_unknown";
  public static readonly ERR_INVALID_LOCALE = "locale.err_invalid_locale";

  public static readonly ERR_INVALID_LOCALE_CODE =
    "locale.err_invalid_locale_code";

  public override readonly code: RadianteLocaleErrorCode;

  public constructor(
    code?: null | RadianteLocaleErrorCode,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);
    this.code = code || RadianteLocaleError.ERR_UNKNOWN;
  }
}

class RadianteInvalidLocaleError extends RadianteLocaleError {
  public readonly locale: string;
  public override readonly code: typeof RadianteLocaleError.ERR_INVALID_LOCALE;

  public constructor(locale: string, message?: string, cause?: unknown) {
    super(null, message || `invalid locale '${locale}'`, cause);

    this.locale = locale;
    this.code = RadianteLocaleError.ERR_INVALID_LOCALE;
  }
}

class RadianteInvalidLocaleCodeError extends RadianteLocaleError {
  public readonly localecode: string;
  public override readonly code: typeof RadianteLocaleError.ERR_INVALID_LOCALE_CODE;

  public constructor(localecode: string, message?: string, cause?: unknown) {
    super(null, message || `invalid locale code '${localecode}'`, cause);

    this.localecode = localecode;
    this.code = RadianteLocaleError.ERR_INVALID_LOCALE_CODE;
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
  RadianteLocaleErrorCode as LocaleErrorCode
};
