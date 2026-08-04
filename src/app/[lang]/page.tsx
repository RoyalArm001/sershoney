import { notFound } from "next/navigation";
import { HomePage } from "@/components/HomePage";
import { isLang, type Lang } from "@/lib/i18n";
import { getDbData } from "@/lib/db";
import { PICKUP_LOCATION } from "@/content/pickup";
import {
  BUSINESS_LOCATION,
  BUSINESS_PHONE,
  getBaseUrl,
  SEO_KEYWORDS,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LocalizedPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const data = await getDbData();
  const copy = data[lang as Lang];
  if (!copy) notFound();

  const safeLang = lang as Lang;
  const location = BUSINESS_LOCATION[safeLang];
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/${lang}`;
  const orgId = `${baseUrl}/#organization`;
  const websiteId = `${baseUrl}/${lang}/#website`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": orgId,
        name: SITE_NAME,
        alternateName: ["Սերս մեղր", "Sers Honey Armenia"],
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/brand/sers-honey-wordmark.png`,
        },
        image: `${baseUrl}/images/hero-honey.jpg`,
        description: copy.metaDescription,
        slogan: copy.footerLine,
        telephone: BUSINESS_PHONE,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: BUSINESS_PHONE,
          contactType: "sales and customer service",
          areaServed: "AM",
          availableLanguage: ["Armenian", "English", "Russian"],
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: location.locality,
          addressRegion: location.region,
          addressCountry: "AM",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: PICKUP_LOCATION.lat,
          longitude: PICKUP_LOCATION.lng,
        },
        hasMap: PICKUP_LOCATION.mapsUrl,
        keywords: SEO_KEYWORDS[safeLang],
        knowsAbout: SEO_KEYWORDS[safeLang],
        sameAs: SOCIAL_LINKS,
        areaServed: {
          "@type": "Country",
          name: "Armenia",
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: pageUrl,
        name: SITE_NAME,
        alternateName: "Sers Honey Armenia",
        description: copy.metaDescription,
        inLanguage: lang,
        publisher: { "@id": orgId },
        isPartOf: {
          "@id": `${baseUrl}/#website-root`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website-root`,
        url: baseUrl,
        name: SITE_NAME,
        publisher: { "@id": orgId },
        inLanguage: ["hy", "en", "ru"],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: copy.metaTitle,
        description: copy.metaDescription,
        isPartOf: { "@id": websiteId },
        about: { "@id": orgId },
        inLanguage: lang,
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${baseUrl}/images/hero-honey.jpg`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}/#products`,
        name: copy.sections.productsTitle,
        itemListElement: (copy.sizes || []).map((size: { name: string; weight: string; text: string }, idx: number) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Product",
            "@id": `${pageUrl}/#product-${idx}`,
            name: `${SITE_NAME} — ${size.name} (${size.weight})`,
            description: size.text,
            image: `${baseUrl}/images/product-sizes-sers-v2.png`,
            sku: `sers-honey-${size.weight}`.replace(/\s+/g, "-").toLowerCase(),
            brand: {
              "@type": "Brand",
              name: SITE_NAME,
            },
            manufacturer: { "@id": orgId },
            category: "Honey",
            countryOfOrigin: {
              "@type": "Country",
              name: "Armenia",
            },
            additionalProperty: [
              {
                "@type": "PropertyValue",
                name: "netWeight",
                value: size.weight,
              },
              {
                "@type": "PropertyValue",
                name: "productType",
                value: "Mountain multi-flower honey",
              },
            ],
            offers: {
              "@type": "Offer",
              url: `${pageUrl}/order`,
              priceCurrency: "AMD",
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: { "@id": orgId },
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomePage lang={safeLang} copy={copy} />
    </>
  );
}
