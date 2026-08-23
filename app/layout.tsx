import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_TITLE = "Lumis SDK: Agentic Self-Healing for Data & AI Pipelines";
const SITE_DESCRIPTION = "Open-source, vendor-agnostic Python framework for deterministic-first diagnosis and guarded recovery across data, ML, and software delivery pipelines.";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: "Lumis SDK",
  title: { default: SITE_TITLE, template: "%s | Lumis SDK" },
  description: SITE_DESCRIPTION,
  keywords: [
    "agentic self-healing",
    "self-healing data pipelines",
    "AI pipeline recovery",
    "data pipeline incident response",
    "deterministic diagnosis",
    "guarded remediation",
    "AIOps framework",
    "MLOps reliability",
    "vendor-agnostic Python SDK",
    "open-source incident recovery",
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
    locale: "en_US",
    url: "/",
    siteName: "Lumis SDK",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Lumis SDK — agentic self-healing for data and AI pipelines" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", alt: "Lumis SDK — agentic self-healing for data and AI pipelines" }],
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){try{var forced=new URLSearchParams(location.search).get('lumis-theme');var saved=localStorage.getItem('lumis-doc-theme');var theme=forced||saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.docTheme=theme}catch(e){}})()` }} />
        {children}
      </body>
    </html>
  );
}
