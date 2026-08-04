import type { Lang } from "@/lib/i18n";

export type RegionId =
  | "yerevan"
  | "aragatsotn"
  | "ararat"
  | "armavir"
  | "gegharkunik"
  | "kotayk"
  | "lori"
  | "shirak"
  | "syunik"
  | "vayots_dzor"
  | "tavush";

type LocalizedName = Record<Lang, string>;

export type RegionData = {
  id: RegionId;
  name: LocalizedName;
  cities: LocalizedName[];
};

/** Honey pricing: 5000 AMD/kg without delivery, 5500 AMD/kg with delivery */
export const PRICE_PER_KG = 5000;
export const PRICE_PER_KG_DELIVERY = 5500;
export const WEIGHT_OPTIONS_G = [350, 500, 1000, 5000] as const;
export type WeightOption = (typeof WEIGHT_OPTIONS_G)[number];

export function calcOrderTotal(weightG: number, quantity: number, withDelivery = true) {
  const rate = withDelivery ? PRICE_PER_KG_DELIVERY : PRICE_PER_KG;
  const kg = weightG / 1000;
  return Math.round(kg * rate * quantity);
}

export function formatAmd(amount: number, lang: Lang) {
  const formatted = amount.toLocaleString(lang === "hy" ? "hy-AM" : lang === "ru" ? "ru-RU" : "en-US");
  if (lang === "hy") return `${formatted} դրամ`;
  if (lang === "ru") return `${formatted} драм`;
  return `${formatted} AMD`;
}

export const ARMENIA_REGIONS_DATA: RegionData[] = [
  {
    id: "yerevan",
    name: { hy: "Երևան", en: "Yerevan", ru: "Ереван" },
    cities: [
      { hy: "Կենտրոն", en: "Kentron", ru: "Кентрон" },
      { hy: "Արաբկիր", en: "Arabkir", ru: "Арабкир" },
      { hy: "Ավան", en: "Avan", ru: "Аван" },
      { hy: "Դավիթաշեն", en: "Davtashen", ru: "Давташен" },
      { hy: "Էրեբունի", en: "Erebuni", ru: "Эребуни" },
      { hy: "Քանաքեր-Զեյթուն", en: "Kanaker-Zeytun", ru: "Канакер-Зейтун" },
      { hy: "Մալաթիա-Սեբաստիա", en: "Malatia-Sebastia", ru: "Малатия-Себастия" },
      { hy: "Նորք-Մարաշ", en: "Nork-Marash", ru: "Норк-Мараш" },
      { hy: "Նոր Նորք", en: "Nor Nork", ru: "Нор Норк" },
      { hy: "Շենգավիթ", en: "Shengavit", ru: "Шенгавит" },
      { hy: "Նուբարաշեն", en: "Nubarashen", ru: "Нубарашен" },
      { hy: "Աջափնյակ", en: "Ajapnyak", ru: "Аджапняк" },
    ],
  },
  {
    id: "aragatsotn",
    name: { hy: "Արագածոտն", en: "Aragatsotn", ru: "Арагацотн" },
    cities: [
      { hy: "Աշտարակ", en: "Ashtarak", ru: "Аштарак" },
      { hy: "Ապարան", en: "Aparan", ru: "Апаран" },
      { hy: "Թալին", en: "Talin", ru: "Талин" },
      { hy: "Բյուրական", en: "Byurakan", ru: "Бюракан" },
      { hy: "Օշական", en: "Oshakan", ru: "Ошакан" },
      { hy: "Արուճ", en: "Aruch", ru: "Аруч" },
      { hy: "Կարբի", en: "Karbi", ru: "Карби" },
      { hy: "Ուջան", en: "Ujan", ru: "Уджан" },
    ],
  },
  {
    id: "ararat",
    name: { hy: "Արարատ", en: "Ararat", ru: "Арарат" },
    cities: [
      { hy: "Արտաշատ", en: "Artashat", ru: "Арташат" },
      { hy: "Արարատ", en: "Ararat", ru: "Арарат" },
      { hy: "Մասիս", en: "Masis", ru: "Масис" },
      { hy: "Վեդի", en: "Vedi", ru: "Веди" },
      { hy: "Այնթափ", en: "Ayntap", ru: "Айнтап" },
      { hy: "Նոր Խարբերդ", en: "Nor Kharberd", ru: "Нор Харберд" },
      { hy: "Դալար", en: "Dalar", ru: "Далар" },
    ],
  },
  {
    id: "armavir",
    name: { hy: "Արմավիր", en: "Armavir", ru: "Армавир" },
    cities: [
      { hy: "Արմավիր", en: "Armavir", ru: "Армавир" },
      { hy: "Վաղարշապատ (Էջմիածին)", en: "Vagharshapat (Etchmiadzin)", ru: "Вагаршапат (Эчмиадзин)" },
      { hy: "Մեծամոր", en: "Metsamor", ru: "Мецамор" },
      { hy: "Բաղրամյան", en: "Baghramyan", ru: "Баграмян" },
      { hy: "Ալաշկերտ", en: "Alashkert", ru: "Алашкерт" },
      { hy: "Նալբանդյան", en: "Nalbandyan", ru: "Налбандян" },
    ],
  },
  {
    id: "gegharkunik",
    name: { hy: "Գեղարքունիք", en: "Gegharkunik", ru: "Гегаркуник" },
    cities: [
      { hy: "Գավառ", en: "Gavar", ru: "Гавар" },
      { hy: "Սևան", en: "Sevan", ru: "Севан" },
      { hy: "Մարտունի", en: "Martuni", ru: "Мартуни" },
      { hy: "Վարդենիս", en: "Vardenis", ru: "Варденис" },
      { hy: "Ճամբարակ", en: "Chambarak", ru: "Чамбарак" },
      { hy: "Ծովագյուղ", en: "Tsovagyugh", ru: "Цовагюх" },
    ],
  },
  {
    id: "kotayk",
    name: { hy: "Կոտայք", en: "Kotayk", ru: "Котайк" },
    cities: [
      { hy: "Հրազդան", en: "Hrazdan", ru: "Раздан" },
      { hy: "Աբովյան", en: "Abovyan", ru: "Абовян" },
      { hy: "Չարենցավան", en: "Charentsavan", ru: "Чаренцаван" },
      { hy: "Եղվարդ", en: "Yeghvard", ru: "Егвард" },
      { hy: "Նոր Հաճն", en: "Nor Hachn", ru: "Нор Ачн" },
      { hy: "Ծաղկաձոր", en: "Tsaghkadzor", ru: "Цахкадзор" },
      { hy: "Բյուրեղավան", en: "Byureghavan", ru: "Бюрегаван" },
      { hy: "Գառնի", en: "Garni", ru: "Гарни" },
    ],
  },
  {
    id: "lori",
    name: { hy: "Լոռի", en: "Lori", ru: "Лори" },
    cities: [
      { hy: "Վանաձոր", en: "Vanadzor", ru: "Ванадзор" },
      { hy: "Սպիտակ", en: "Spitak", ru: "Спитак" },
      { hy: "Ստեփանավան", en: "Stepanavan", ru: "Степанаван" },
      { hy: "Ալավերդի", en: "Alaverdi", ru: "Алаверди" },
      { hy: "Թումանյան", en: "Tumanian", ru: "Туманян" },
      { hy: "Տաշիր", en: "Tashir", ru: "Ташир" },
      { hy: "Ախթալա", en: "Akhtala", ru: "Ахтала" },
    ],
  },
  {
    id: "shirak",
    name: { hy: "Շիրակ", en: "Shirak", ru: "Ширак" },
    cities: [
      { hy: "Գյումրի", en: "Gyumri", ru: "Гюмри" },
      { hy: "Արթիկ", en: "Artik", ru: "Артик" },
      { hy: "Մարալիկ", en: "Maralik", ru: "Маралик" },
      { hy: "Ախուրյան", en: "Akhuryan", ru: "Ахурян" },
      { hy: "Անի", en: "Ani", ru: "Ани" },
    ],
  },
  {
    id: "syunik",
    name: { hy: "Սյունիք", en: "Syunik", ru: "Сюник" },
    cities: [
      { hy: "Կապան", en: "Kapan", ru: "Капан" },
      { hy: "Գորիս", en: "Goris", ru: "Горис" },
      { hy: "Սիսիան", en: "Sisian", ru: "Сисиан" },
      { hy: "Մեղրի", en: "Meghri", ru: "Мегри" },
      { hy: "Քաջարան", en: "Kajaran", ru: "Каджаран" },
      { hy: "Ագարակ", en: "Agarak", ru: "Агарак" },
    ],
  },
  {
    id: "vayots_dzor",
    name: { hy: "Վայոց ձոր", en: "Vayots Dzor", ru: "Вайоц Дзор" },
    cities: [
      { hy: "Եղեգնաձոր", en: "Yeghegnadzor", ru: "Ехегнадзор" },
      { hy: "Ջերմուկ", en: "Jermuk", ru: "Джермук" },
      { hy: "Վայք", en: "Vayk", ru: "Вайк" },
      { hy: "Մալիշկա", en: "Malishka", ru: "Малишка" },
      { hy: "Արենի", en: "Areni", ru: "Арени" },
    ],
  },
  {
    id: "tavush",
    name: { hy: "Տավուշ", en: "Tavush", ru: "Тавуш" },
    cities: [
      { hy: "Իջևան", en: "Ijevan", ru: "Иджеван" },
      { hy: "Դիլիջան", en: "Dilijan", ru: "Дилижан" },
      { hy: "Բերդ", en: "Berd", ru: "Берд" },
      { hy: "Նոյեմբերյան", en: "Noyemberyan", ru: "Ноемберян" },
      { hy: "Այրում", en: "Ayrum", ru: "Айрум" },
    ],
  },
];

export function getRegionById(id: string) {
  return ARMENIA_REGIONS_DATA.find((r) => r.id === id);
}
