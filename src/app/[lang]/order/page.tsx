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
    title: "Պատվիրել բնական մեղր Վայքից",
    description:
      "Պատվիրեք Sers Honey բնական լեռնային մեղրը Վայքից՝ առաքմամբ ամբողջ Հայաստանում կամ ստացեք Սերս գյուղից։",
    keywords: ["բնական մեղր պատվիրել", "մեղր գնել", "մեղրի առաքում Հայաստան"],
  },
  en: {
    title: "Order Natural Armenian Honey",
    description:
      "Order Sers Honey natural mountain honey from Vayk with delivery across Armenia or pickup from Sers village.",
    keywords: ["order Armenian honey", "buy honey Armenia", "honey delivery Armenia"],
  },
  ru: {
    title: "Заказать натуральный армянский мёд",
    description:
      "Закажите натуральный горный мёд Sers Honey из Вайка с доставкой по Армении или самовывозом из села Серс.",
    keywords: ["заказать армянский мед", "купить мед в Армении", "доставка меда Армения"],
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
  const ogImage = `${baseUrl}/images/product-sizes-sers-v2.png`;

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
