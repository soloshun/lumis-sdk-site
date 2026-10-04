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
    "operational intelligence SDK",
    "evidence-grounded incident investigation",
    "falsifiable hypotheses",
    "deterministic triage",
    "bounded investigator agent",
    "operational graph",
    "Python incident investigation framework",
    "vendor-neutral observability",
    "open-source operational intelligence",
  ],
  authors: [{ name: "Solomon Eshun", url: "https://github.com/soloshun" }],
  creator: "Solomon Eshun and Lumis SDK contributors",
  publisher: "Qadim Labs",
  category: "Developer Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: { address: false, email: false, telephone: false },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg" },
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
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){try{var forced=new URLSearchParams(location.search).get('lumis-theme');var saved=localStorage.getItem('lumis-doc-theme');var theme=forced||saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.docTheme=theme}catch(e){}})()` }} />
        {children}
      </body>
    </html>
  );
}
