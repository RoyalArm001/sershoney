import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnershipPage } from "@/components/PartnershipPage";
import { isLang, SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

const copy: Record<Lang, { title: string; description: string }> = {
  hy: { title: "Համագործակցություն | Sers Honey", description: "Համագործակցեք Sers Honey-ի հետ՝ խանութների, սրճարանների, հյուրանոցների, նվերային փաթեթների և մեծածախ մատակարարման համար։" },
  en: { title: "Partnership | Sers Honey", description: "Partner with Sers Honey for retail, wholesale, cafés, hotels and gift packages in Armenia." },
  ru: { title: "Сотрудничество | Sers Honey", description: "Сотрудничайте с Sers Honey: розница, опт, кафе, отели и подарочные наборы в Армении." },
};

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/${lang}/partnership`;
  return {
    title: copy[lang].title,
    description: copy[lang].description,
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(SUPPORTED_LANGS.map((item) => [item, `${baseUrl}/${item}/partnership`])),
    },
  };
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <PartnershipPage lang={lang} />;
}
