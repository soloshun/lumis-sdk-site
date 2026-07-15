import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", base).toString();

  return {
    metadataBase: base,
    title: { default: "Lumis SDK", template: "%s · Lumis SDK" },
    description: "Open-source contracts and local reference adapters for deterministic-first, evidence-grounded incident recovery.",
    openGraph: {
      type: "website",
      siteName: "Lumis SDK",
      title: "Lumis SDK — Diagnosis-as-Code for engineering systems",
      description: "Deterministic-first, evidence-grounded incident diagnosis and guarded recovery workflows.",
      images: [{ url: socialImage, width: 1732, height: 909, alt: "Lumis SDK — Diagnosis-as-Code for engineering systems" }],
    },
    twitter: { card: "summary_large_image", images: [socialImage] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
