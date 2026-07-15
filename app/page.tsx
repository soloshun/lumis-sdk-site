import type { Metadata } from "next";
import { Architecture, Cookbooks, Footer, Hero, Lifecycle, Principles } from "@/components/home-sections";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Lumis SDK — Diagnosis-as-Code for engineering systems",
  description:
    "An open-source, deterministic-first Python SDK for evidence-grounded incident diagnosis and guarded recovery workflows.",
};

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <Hero />
        <Principles />
        <Architecture />
        <Lifecycle />
        <Cookbooks />
      </main>
      <Footer />
    </>
  );
}
