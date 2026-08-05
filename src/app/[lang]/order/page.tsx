import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderPage } from "@/components/OrderPage";
import { getDbData } from "@/lib/db";
import { isLang, SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import {
  BUSINESS_LOCATION,
  BUSINESS_PHONE,
  getBaseUrl,
  getLocaleCode,
  SEO_KEYWORDS,
  SITE_NAME,
} from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
};

const orderSeoCopy: Record<Lang, { title: string; description: string; keywords: string[] }> = {
  hy: {
    title: "Մեղր պատվիրել առցանց | Բնական մեղր գնել Հայաստանից",
    description:
      "Պատվիրեք բնական մեղր առցանց։ Sers Honey լեռնային մեղր Վայքից՝ առաքում Հայաստանում կամ ինքնաառաքում Սերս գյուղից։ Մեղր գնել 450գ, 900գ, 1000գ։",
    keywords: [
      "մեղր պատվիրել",
      "մեղր գնել",
      "մեղր գնել առցանց",
      "մեղրի առաքում Հայաստան",
      "բնական մեղր պատվիրել",
    ],
  },
  en: {
    title: "Order Honey Online | Buy Natural Honey in Armenia",
    description:
      "Order natural honey online. Sers Honey mountain honey from Vayk with delivery across Armenia or pickup from Sers village. Buy honey in 450g, 900g and 1000g jars.",
    keywords: [
      "order honey",
      "buy honey",
      "buy honey online Armenia",
      "honey delivery Armenia",
      "order natural honey",
    ],
  },
  ru: {
    title: "Заказать мёд онлайн | Купить натуральный мёд в Армении",
    description:
      "Закажите натуральный мёд онлайн. Горный мёд Sers Honey из Вайка с доставкой по Армении или самовывозом из села Серс. Купить мёд 450 г, 900 г, 1000 г.",
    keywords: [
      "заказать мед",
      "купить мед",
      "купить мед онлайн Армения",
      "доставка меда Армения",
      "заказать натуральный мед",
    ],
  },
};

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  const data = await getDbData();
  const copy = data[lang as Lang];
  if (!copy) return {};

  const safeLang = lang as Lang;
  const seoCopy = orderSeoCopy[safeLang];
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/${lang}/order`;
  const ogImage = `${baseUrl}/images/product-sizes-sers-v2.jpg`;

  return {
    title: {
      absolute: `${seoCopy.title} | ${SITE_NAME}`,
    },
    description: seoCopy.description,
    keywords: [...SEO_KEYWORDS[safeLang], ...seoCopy.keywords],
    alternates: {
      canonical: pageUrl,
      languages: {
        hy: `${baseUrl}/hy/order`,
        en: `${baseUrl}/en/order`,
        ru: `${baseUrl}/ru/order`,
        "x-default": `${baseUrl}/hy/order`,
      },
    },
    openGraph: {
      title: `${seoCopy.title} | ${SITE_NAME}`,
      description: seoCopy.description,
      url: pageUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: getLocaleCode(safeLang),
      alternateLocale: SUPPORTED_LANGS.filter((l) => l !== safeLang).map(getLocaleCode),
      images: [
        {
          url: ogImage,
          alt: copy.sections.productsTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${seoCopy.title} | ${SITE_NAME}`,
      description: seoCopy.description,
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

export default async function LocalizedOrderPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const data = await getDbData();
  const copy = data[lang as Lang];
  if (!copy) notFound();

  const safeLang = lang as Lang;
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/${safeLang}/order`;
  const location = BUSINESS_LOCATION[safeLang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CheckoutPage",
    "@id": `${pageUrl}/#webpage`,
    url: pageUrl,
    name: orderSeoCopy[safeLang].title,
    description: orderSeoCopy[safeLang].description,
    inLanguage: safeLang,
    mainEntity: {
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${baseUrl}/#organization`,
      name: SITE_NAME,
      telephone: BUSINESS_PHONE,
      address: {
        "@type": "PostalAddress",
        addressLocality: location.locality,
        addressRegion: location.region,
        addressCountry: "AM",
      },
    },
    potentialAction: {
      "@type": "OrderAction",
      target: pageUrl,
      object: {
        "@type": "Product",
        name: `${SITE_NAME} natural Armenian honey`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <OrderPage lang={safeLang} copy={copy} />
    </>
  );
}
