import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/hy", "/en", "/ru", "/images/"],
        disallow: ["/admin", "/admin/", "/api/"],
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
        ],
        allow: ["/", "/hy", "/en", "/ru", "/llms.txt", "/images/", "/brand/"],
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
