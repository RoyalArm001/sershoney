import { MetadataRoute } from "next";
import { SUPPORTED_LANGS } from "@/lib/i18n";
import { getBaseUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const homeAlternates = Object.fromEntries(
    SUPPORTED_LANGS.map((lang) => [lang, `${baseUrl}/${lang}`])
  ) as Record<string, string>;
  homeAlternates["x-default"] = `${baseUrl}/hy`;

  const orderAlternates = Object.fromEntries(
    SUPPORTED_LANGS.map((lang) => [lang, `${baseUrl}/${lang}/order`])
  ) as Record<string, string>;
  orderAlternates["x-default"] = `${baseUrl}/hy/order`;

  const homePages: MetadataRoute.Sitemap = SUPPORTED_LANGS.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: homeAlternates },
  }));

  const orderPages: MetadataRoute.Sitemap = SUPPORTED_LANGS.map((lang) => ({
    url: `${baseUrl}/${lang}/order`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: { languages: orderAlternates },
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: homeAlternates },
    },
    ...homePages,
    ...orderPages,
  ];
}
