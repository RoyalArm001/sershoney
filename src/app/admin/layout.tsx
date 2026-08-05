import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Sers Honey Admin",
  description: "Sers Honey պատվերների կառավարում",
  applicationName: "Sers Honey Admin",
  manifest: "/admin-manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sers Admin",
  },
  icons: {
    icon: [
      { url: "/images/sers-honey-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/sers-honey-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/sers-honey-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a07",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
