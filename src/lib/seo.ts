import type { Lang } from "@/lib/i18n";

export const SITE_NAME = "Sers Honey";
export const DEFAULT_BASE_URL = "https://sershoney.com";
export const BUSINESS_PHONE = "+37493132732";
export const BUSINESS_PHONE_DISPLAY = "+374 93 132 732";

export const BUSINESS_LOCATION: Record<
  Lang,
  { locality: string; municipality: string; region: string; country: string; full: string }
> = {
  hy: {
    locality: "Սերս գյուղ",
    municipality: "Վայք",
    region: "Վայոց ձոր",
    country: "Հայաստան",
    full: "Սերս գյուղ, Վայք, Վայոց ձոր, Հայաստան",
  },
  en: {
    locality: "Sers village",
    municipality: "Vayk",
    region: "Vayots Dzor",
    country: "Armenia",
    full: "Sers village, Vayk, Vayots Dzor, Armenia",
  },
  ru: {
    locality: "село Серс",
    municipality: "Вайк",
    region: "Вайоц-Дзор",
    country: "Армения",
    full: "село Серс, Вайк, Вайоц-Дзор, Армения",
  },
};

export function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function getLocaleCode(lang: Lang) {
  if (lang === "hy") return "hy_AM";
  if (lang === "ru") return "ru_RU";
  return "en_US";
}

export function getHtmlLang(lang: Lang) {
  return lang;
}

export const SEO_KEYWORDS: Record<Lang, string[]> = {
  hy: [
    "Sers Honey",
    "Սերս մեղր",
    "Վայք մեղր",
    "Վայոց ձոր մեղր",
    "մեղր Հայաստան",
    "մեղր գնել",
    "բնական մեղր",
    "100% բնական մեղր",
    "լեռնային մեղր",
    "հայկական մեղր",
    "բազմածաղիկ մեղր",
    "մեղրի տեսականի",
    "մաքուր մեղր",
    "տեղական մեղր",
    "նվերային մեղր",
    "մեղրի առաքում",
  ],
  en: [
    "Sers Honey",
    "Sers village honey",
    "Vayk honey",
    "Vayots Dzor honey",
    "natural honey",
    "natural honey Armenia",
    "mountain honey",
    "Armenian honey",
    "multifloral honey",
    "pure honey",
    "local Armenian honey",
    "honey varieties",
    "buy honey Armenia",
    "Armenian honey gift",
    "honey delivery Armenia",
  ],
  ru: [
    "Sers Honey",
    "мед Серс",
    "мед Вайк",
    "мед Вайоц-Дзор",
    "натуральный мед",
    "натуральный мёд Армения",
    "горный мед",
    "армянский мед",
    "разнотравный мед",
    "чистый мед",
    "виды меда",
    "купить мед в Армении",
    "подарочный армянский мед",
    "доставка меда Армения",
  ],
};

export const SOCIAL_LINKS = [
  "https://www.instagram.com/p/DN-yt5BiJPG/",
];
