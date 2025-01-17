export {
  Locale,
  CN_CHINESE,
  EU_FRENCH,
  EU_GERMAN,
  KR_KOREAN,
  US_FRENCH,
  EU_ENGLISH,
  EU_ITALIAN,
  EU_SPANISH,
  US_ENGLISH,
  TW_CHINESE,
  US_SPANISH,
  JP_JAPANESE,
  isLocale as is,
  LocaleCode as Code,
  isLocaleCode as isCode,
  normalizeLocale as normalize,
  normalizeLocaleCode as normalizeCode
} from "#locale/locale";

export {
  RadianteLocaleError as Error,
  RadianteInvalidLocaleError as InvalidLocaleError,
  RadianteInvalidLocaleCodeError as InvalidLocaleCodeError
} from "#locale/locale-error";

export type {
  RadianteLocaleErrorCode as ErrorCode,
  RadianteLocaleErrorMetadata as ErrorMetadata,
  RadianteInvalidLocaleErrorMetadata as InvalidLocaleErrorMetadata,
  RadianteInvalidLocaleCodeErrorMetadata as InvalidLocaleCodeErrorMetadata
} from "#locale/locale-error";
