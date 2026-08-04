import type { Lang } from "@/lib/i18n";
import type { WeightOption } from "@/content/regions";

export const PICKUP_LOCATION = {
  lat: 39.5626306,
  lng: 45.4850861,
  coordsText: `39°33'45.5"N 45°29'06.3"E`,
  mapsUrl:
    "https://www.google.com/maps/place/39%C2%B033'45.5%22N+45%C2%B029'06.3%22E/@39.5626347,45.4825112,17z/data=!3m1!4b1!4m4!3m3!8m2!3d39.5626306!4d45.4850861",
  geoUri: "geo:39.5626306,45.4850861?q=39.5626306,45.4850861",
  appleMapsUrl: "https://maps.apple.com/?ll=39.5626306,45.4850861&q=Sers%20Honey",
};

export type ComboPackage = {
  id: string;
  weightG: WeightOption;
  quantity: number;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  badge?: Record<Lang, string>;
};

export const COMBO_PACKAGES: ComboPackage[] = [
  {
    id: "duo-classic",
    weightG: 1000,
    quantity: 2,
    title: {
      hy: "Դասական Duo",
      en: "Classic Duo",
      ru: "Классический Duo",
    },
    description: {
      hy: "2 × 1 կգ — ընտանիքի ամենահարմար տարբերակ",
      en: "2 × 1 kg — ideal for the family",
      ru: "2 × 1 кг — идеально для семьи",
    },
    badge: { hy: "Հանրաճանաչ", en: "Popular", ru: "Хит" },
  },
  {
    id: "sweet-pair",
    weightG: 500,
    quantity: 2,
    title: {
      hy: "Քաղցր զույգ",
      en: "Sweet Pair",
      ru: "Сладкая пара",
    },
    description: {
      hy: "2 × 500 գ — նրբաճաշակ ամենօրյա ընտրություն",
      en: "2 × 500 g — elegant everyday choice",
      ru: "2 × 500 г — изящный ежедневный выбор",
    },
  },
  {
    id: "gift-mini",
    weightG: 350,
    quantity: 2,
    title: {
      hy: "Մինի նվեր",
      en: "Mini Gift",
      ru: "Мини-подарок",
    },
    description: {
      hy: "2 × 350 գ — թեթև և գեղեցիկ նվեր",
      en: "2 × 350 g — light and lovely gift",
      ru: "2 × 350 г — лёгкий и красивый подарок",
    },
    badge: { hy: "Նվեր", en: "Gift", ru: "Подарок" },
  },
  {
    id: "family-box",
    weightG: 5000,
    quantity: 1,
    title: {
      hy: "Ընտանեկան տուփ",
      en: "Family Box",
      ru: "Семейная коробка",
    },
    description: {
      hy: "1 × 5 կգ — առատ և շահավետ",
      en: "1 × 5 kg — generous and great value",
      ru: "1 × 5 кг — щедро и выгодно",
    },
    badge: { hy: "Շահավետ", en: "Value", ru: "Выгода" },
  },
];

export function getComboById(id: string | null | undefined) {
  if (!id) return undefined;
  return COMBO_PACKAGES.find((item) => item.id === id);
}
