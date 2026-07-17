import type { Metadata } from "next";
import { Architecture, Footer, Framework, Hero, Learn, Lifecycle, Principles, Research } from "@/components/home-sections";
import { Community } from "@/components/community";
import { ScrollFX } from "@/components/scroll-fx";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Lumis SDK — Open framework for guarded pipeline recovery",
  description:
    "A vendor-agnostic Python framework for deterministic-first diagnosis and guarded, agentic recovery across data, ML, and software-delivery pipelines.",
};

export default function Home() {
  return (
    <>
      <ScrollFX />
      <SiteNav />
      <main id="main">
        <Hero />
        <Principles />
        <Architecture />
        <Lifecycle />
        <Framework />
        <Research />
        <Learn />
        <Community />
      </main>
      <Footer />
    </>
  );
}
