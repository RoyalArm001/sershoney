import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: [
          "OAI-SearchBot",
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "ClaudeBot",
          "Anthropic-ai",
          "Claude-Web",
          "PerplexityBot",
          "Perplexity-User",
          "Applebot-Extended",
          "Amazonbot",
          "Meta-ExternalAgent",
          "Meta-ExternalFetcher",
          "Bytespider",
          "YouBot",
        ],
        allow: ["/", "/llms.txt", "/brand/", "/images/"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
