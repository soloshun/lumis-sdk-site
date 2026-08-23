import type { Metadata } from "next";
import { Architecture, Footer, Framework, Hero, Learn, Lifecycle, Principles, Research } from "@/components/home-sections";
import { Community } from "@/components/community";
import { JsonLd } from "@/components/json-ld";
import { ScrollFX } from "@/components/scroll-fx";
import { SiteNav } from "@/components/site-nav";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Lumis SDK: Agentic Self-Healing for Data & AI Pipelines" },
  description: "Open-source, vendor-agnostic Python framework for deterministic-first diagnosis and guarded recovery across data, ML, and software delivery pipelines.",
  alternates: { canonical: "/" },
};

const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("/")}#website`,
      url: absoluteUrl("/"),
      name: "Lumis SDK",
      alternateName: "Lumis Open-Source SDK",
      description: "Agentic self-healing for data and AI pipelines.",
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${absoluteUrl("/")}#software`,
      name: "Lumis SDK",
      url: absoluteUrl("/"),
      description: "Open-source, vendor-agnostic Python framework for deterministic-first diagnosis and guarded recovery across data, ML, and software delivery pipelines.",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "AIOps and pipeline reliability framework",
      operatingSystem: "Cross-platform",
      programmingLanguage: "Python",
      softwareVersion: "0.0.8",
      isAccessibleForFree: true,
      license: "https://www.apache.org/licenses/LICENSE-2.0",
      codeRepository: "https://github.com/soloshun/lumis-sdk",
      downloadUrl: "https://pypi.org/project/lumis-sdk/",
      sameAs: [
        "https://github.com/soloshun/lumis-sdk",
        "https://pypi.org/project/lumis-sdk/",
        "https://arxiv.org/abs/2608.01955",
      ],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", name: "Solomon Eshun", url: "https://github.com/soloshun" },
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={homepageSchema} />
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
