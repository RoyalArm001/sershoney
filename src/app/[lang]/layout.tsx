import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HoneycombBackground } from "@/components/HoneycombBackground";
import { SiteIntro } from "@/components/SiteIntro";
import { getDbData } from "@/lib/db";
import { isLang, SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { getBaseUrl, getLocaleCode, SEO_KEYWORDS, SITE_NAME } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const data = await getDbData();
  const copy = data[lang as Lang];
  if (!copy) return {};

  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/${lang}`;
  const ogImage = `${baseUrl}/images/hero-honey.jpg`;

  return {
    title: {
      absolute: copy.metaTitle,
    },
    description: copy.metaDescription,
    keywords: SEO_KEYWORDS[lang],
    alternates: {
      canonical: pageUrl,
      languages: {
        hy: `${baseUrl}/hy`,
        en: `${baseUrl}/en`,
        ru: `${baseUrl}/ru`,
        "x-default": `${baseUrl}/hy`,
      },
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      type: "website",
      locale: getLocaleCode(lang),
      alternateLocale: SUPPORTED_LANGS.filter((l) => l !== lang).map(getLocaleCode),
      url: pageUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: copy.hero.subtitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.metaTitle,
      description: copy.metaDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const safeLang = lang as Lang;

  return (
    <div lang={safeLang}>
      <HoneycombBackground />
      <SiteIntro />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
