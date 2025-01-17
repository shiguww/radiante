import {
  RadianteInvalidLocaleError,
  RadianteInvalidLocaleCodeError
} from "#locale/locale-error";

enum LocaleCode {
  EU_FRENCH = "EUR_fr",
  EU_GERMAN = "EUR_de",
  KR_KOREAN = "KOR_kr",
  US_FRENCH = "USA_fr",
  CN_CHINESE = "CHN_zh",
  EU_ENGLISH = "EUR_en",
  EU_ITALIAN = "EUR_it",
  EU_SPANISH = "EUR_es",
  TW_CHINESE = "TWN_zh",
  US_ENGLISH = "USA_en",
  US_SPANISH = "USA_es",
  JP_JAPANESE = "JPN_ja"
}

const localecodes = new Set(Object.values(LocaleCode));

function isLocaleCode(value: unknown): value is LocaleCode {
  return localecodes.has(<LocaleCode>value);
}

function normalizeLocaleCode(code: string): LocaleCode {
  switch (code.toLowerCase()) {
    case "chn_zh":
    case "cn_simp_chinese":
      return LocaleCode.CN_CHINESE;
    case "eur_de":
    case "eu_german":
      return LocaleCode.EU_GERMAN;
    case "eur_en":
    case "eu_english":
      return LocaleCode.EU_ENGLISH;
    case "eur_es":
    case "eu_spanish":
      return LocaleCode.EU_SPANISH;
    case "eur_fr":
    case "eu_french":
      return LocaleCode.EU_FRENCH;
    case "eur_it":
    case "eu_italian":
      return LocaleCode.EU_ITALIAN;
    case "jpn_ja":
    case "jp_japanese":
      return LocaleCode.JP_JAPANESE;
    case "kor_ko":
    case "kr_korean":
      return LocaleCode.KR_KOREAN;
    case "twn_zh":
    case "tw_trad_chinese":
      return LocaleCode.TW_CHINESE;
    case "usa_en":
    case "us_english":
      return LocaleCode.US_ENGLISH;
    case "usa_fr":
    case "us_french":
      return LocaleCode.US_FRENCH;
    case "usa_es":
    case "us_spanish":
      return LocaleCode.US_SPANISH;
    default:
      throw new RadianteInvalidLocaleCodeError({ code });
  }
}

enum Locale {
  EU_FRENCH = "EU_French",
  EU_GERMAN = "EU_German",
  KR_KOREAN = "KR_Korean",
  US_FRENCH = "US_French",
  EU_ENGLISH = "EU_English",
  EU_ITALIAN = "EU_Italian",
  EU_SPANISH = "EU_Spanish",
  US_ENGLISH = "US_English",
  US_SPANISH = "US_Spanish",
  JP_JAPANESE = "JP_Japanese",
  CN_CHINESE = "CN_Simp_Chinese",
  TW_CHINESE = "TW_Trad_Chinese"
}

const locales = new Set(Object.values(Locale));

function isLocale(value: unknown): value is Locale {
  return locales.has(<Locale>value);
}

function normalizeLocale(locale: string): Locale {
  switch (locale.toLowerCase()) {
    case "chn_zh":
    case "cn_simp_chinese":
      return Locale.CN_CHINESE;
    case "eur_de":
    case "eu_german":
      return Locale.EU_GERMAN;
    case "eur_en":
    case "eu_english":
      return Locale.EU_ENGLISH;
    case "eur_es":
    case "eu_spanish":
      return Locale.EU_SPANISH;
    case "eur_fr":
    case "eu_french":
      return Locale.EU_FRENCH;
    case "eur_it":
    case "eu_italian":
      return Locale.EU_ITALIAN;
    case "jpn_ja":
    case "jp_japanese":
      return Locale.JP_JAPANESE;
    case "kor_ko":
    case "kr_korean":
      return Locale.KR_KOREAN;
    case "twn_zh":
    case "tw_trad_chinese":
      return Locale.TW_CHINESE;
    case "usa_en":
    case "us_english":
      return Locale.US_ENGLISH;
    case "usa_fr":
    case "us_french":
      return Locale.US_FRENCH;
    case "usa_es":
    case "us_spanish":
      return Locale.US_SPANISH;
    default:
      throw new RadianteInvalidLocaleError({ locale });
  }
}

const {
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
  JP_JAPANESE
} = Locale;

export {
  Locale,
  isLocale,
  LocaleCode,
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
  isLocaleCode,
  normalizeLocale,
  normalizeLocaleCode
};
