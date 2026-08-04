export const SUPPORTED_LANGS = ["hy", "en", "ru"] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export function isLang(value: string): value is Lang {
  return SUPPORTED_LANGS.includes(value as Lang);
}

export function getSafeLang(value: string): Lang {
  return isLang(value) ? value : "hy";
}
