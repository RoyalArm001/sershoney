import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${SITE_NAME} | Natural Armenian Honey from Vayots Dzor`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Sers Honey is 100% natural mountain multifloral honey from Sers village near Vayk, Vayots Dzor, Armenia.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "food",
  keywords: [
    "Sers Honey",
    "natural honey",
    "Armenian honey",
    "mountain honey",
    "Vayk honey",
    "Vayots Dzor honey",
    "Սերս մեղր",
    "Վայք մեղր",
    "բնական մեղր",
  ],
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
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "100% natural mountain multifloral honey from Vayots Dzor, Armenia.",
    images: [
      {
        url: "/images/hero-honey.jpg",
        width: 1200,
        height: 630,
        alt: "Sers Honey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "100% natural mountain multifloral honey from Vayots Dzor, Armenia.",
    images: ["/images/hero-honey.jpg"],
  },
  icons: {
    icon: [{ url: "/images/honeycomb-main.png", type: "image/png" }],
    apple: [{ url: "/images/honeycomb-main.png" }],
  },
  verification: {
    // Add Search Console / Bing codes here when available
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a07" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const langHeader = headerStore.get("x-lang") || "hy";
  const lang = isLang(langHeader) ? langHeader : "hy";

  return (
    <html lang={lang}>
      <head>
        <link rel="preload" as="image" href="/brand/sers-honey-wordmark.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
