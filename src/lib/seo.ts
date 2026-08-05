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

/** Honey-focused search terms for hy / en / ru discovery. */
export const SEO_KEYWORDS: Record<Lang, string[]> = {
  hy: [
    "մեղր",
    "բնական մեղր",
    "հայկական մեղր",
    "լեռնային մեղր",
    "բազմածաղիկ մեղր",
    "մեղր գնել",
    "մեղր պատվիրել",
    "մեղրի առաքում",
    "մեղր Հայաստան",
    "մեղր Երևան",
    "մեղր Վայք",
    "Վայոց ձոր մեղր",
    "Սերս մեղր",
    "Sers Honey",
    "մաքուր մեղր",
    "տեղական մեղր",
    "նվերային մեղր",
    "մեղրի տեսականի",
    "100% բնական մեղր",
    "մեղր առանց շաքարի",
    "մեղվի մեղր",
    "լեռնային բազմածաղիկ մեղր",
    "մեղր գնել առցանց",
    "հայկական բնական մեղր",
  ],
  en: [
    "honey",
    "natural honey",
    "Armenian honey",
    "mountain honey",
    "multifloral honey",
    "buy honey",
    "order honey",
    "honey delivery",
    "honey Armenia",
    "honey Yerevan",
    "Vayk honey",
    "Vayots Dzor honey",
    "Sers Honey",
    "Sers village honey",
    "pure honey",
    "local honey",
    "raw honey",
    "organic style honey",
    "honey gift",
    "honey jar",
    "100% natural honey",
    "buy honey online Armenia",
    "Armenian mountain honey",
    "wildflower honey Armenia",
  ],
  ru: [
    "мед",
    "мёд",
    "натуральный мед",
    "натуральный мёд",
    "армянский мед",
    "армянский мёд",
    "горный мед",
    "разнотравный мед",
    "купить мед",
    "заказать мед",
    "доставка меда",
    "мед Армения",
    "мед Ереван",
    "мед Вайк",
    "мед Вайоц-Дзор",
    "Sers Honey",
    "мед Серс",
    "чистый мед",
    "местный мед",
    "подарочный мед",
    "100% натуральный мед",
    "купить мед онлайн Армения",
    "армянский горный мед",
    "натуральный мёд Армения",
  ],
};

export const HONEY_FAQ: Record<
  Lang,
  Array<{ question: string; answer: string }>
> = {
  hy: [
    {
      question: "Ի՞նչ մեղր է Sers Honey-ը",
      answer:
        "Sers Honey-ը 100% բնական լեռնային բազմածաղիկ հայկական մեղր է՝ Սերս գյուղից, Վայք, Վայոց ձոր, Հայաստան։",
    },
    {
      question: "Որտեղի՞ց է գալիս մեղրը",
      answer:
        "Մեղրը հավաքվում է Հայաստանի Վայոց ձոր մարզում՝ Սերս գյուղի լեռնային տարածքներում։",
    },
    {
      question: "Ինչպե՞ս պատվիրել մեղր",
      answer:
        "Կարող եք պատվիրել կայքից առաքմամբ Հայաստանում կամ ստանալ ինքնաառաքումով։ Հեռախոս՝ +374 93 132 732։",
    },
    {
      question: "Ի՞նչ չափսերով է վաճառվում մեղրը",
      answer: "Մեղրի տեսականին ներառում է 450 գ, 900 գ և 1000 գ տարաներ։",
    },
  ],
  en: [
    {
      question: "What kind of honey is Sers Honey?",
      answer:
        "Sers Honey is 100% natural Armenian mountain multifloral honey from Sers village, Vayk, Vayots Dzor, Armenia.",
    },
    {
      question: "Where does the honey come from?",
      answer:
        "The honey is harvested in the mountain areas of Sers village in Vayots Dzor Province, Armenia.",
    },
    {
      question: "How can I order honey?",
      answer:
        "You can order online with delivery across Armenia or choose pickup. Phone: +374 93 132 732.",
    },
    {
      question: "What honey jar sizes are available?",
      answer: "Sers Honey is available in 450 g, 900 g and 1000 g jars.",
    },
  ],
  ru: [
    {
      question: "Какой мёд у Sers Honey?",
      answer:
        "Sers Honey — 100% натуральный армянский горный разнотравный мёд из села Серс, Вайк, Вайоц-Дзор, Армения.",
    },
    {
      question: "Откуда мёд?",
      answer:
        "Мёд собирают в горных районах села Серс в провинции Вайоц-Дзор, Армения.",
    },
    {
      question: "Как заказать мёд?",
      answer:
        "Можно заказать на сайте с доставкой по Армении или самовывозом. Телефон: +374 93 132 732.",
    },
    {
      question: "Какие объёмы мёда есть?",
      answer: "Доступны банки 450 г, 900 г и 1000 г.",
    },
  ],
};

export const SOCIAL_LINKS = [
  "https://www.instagram.com/sershoneymy/",
  "https://www.facebook.com/people/SersHoney/",
];
