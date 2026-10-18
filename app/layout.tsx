import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, SOCIAL_IMAGE, IS_PREVIEW } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: "Lumis SDK",
  title: { default: SITE_TITLE, template: "%s | Lumis SDK" },
  description: SITE_DESCRIPTION,
  keywords: [
    "incident investigation SDK",
    "evidence-grounded incident investigation",
    "root cause analysis Python",
    "falsifiable hypotheses",
    "deterministic triage",
    "bounded investigator agent",
    "operational graph",
    "Python incident investigation framework",
    "vendor-neutral observability",
    "incident investigation proof of concept",
  ],
  authors: [{ name: "Solomon Eshun", url: "https://github.com/soloshun" }],
  creator: "Solomon Eshun and Lumis SDK contributors",
  publisher: "Qadim Labs",
  category: "Developer Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { address: false, email: false, telephone: false },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  // The Lumis symbol, shared with lumis.qadimlabs.com: SVG, a 48px ICO and a 192px PNG (search results
  // prefer a multiple of 48), and the 180px home-screen icon.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  robots: {
    index: !IS_PREVIEW,
    follow: true,
    googleBot: {
      index: !IS_PREVIEW,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Lumis SDK",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e0f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The no-flash theme bootstrap intentionally sets a browser-only attribute
    // before hydration. Suppress that attribute difference on html, not its script.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var forced=new URLSearchParams(location.search).get('lumis-theme');var saved=localStorage.getItem('lumis-doc-theme');var theme=forced||saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.docTheme=theme}catch(e){}})()` }} />
        {children}
      </body>
    </html>
  );
}
