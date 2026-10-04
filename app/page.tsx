import type { Metadata } from "next";
import { Architecture, Footer, Hero, Principles, Research, Start, Workflow } from "@/components/home-sections";
import { Community } from "@/components/community";
import { ScrollFX } from "@/components/scroll-fx";
import { JsonLd } from "@/components/json-ld";
import { SiteNav } from "@/components/site-nav";
import { absoluteUrl, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE }, description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${absoluteUrl()}#website`, url: absoluteUrl(), name: "Lumis SDK", description: SITE_DESCRIPTION, inLanguage: "en" },
    { "@type": ["SoftwareApplication", "SoftwareSourceCode"], "@id": `${absoluteUrl()}#software`, name: "Lumis SDK", url: absoluteUrl(), description: SITE_DESCRIPTION,
      applicationCategory: "DeveloperApplication", applicationSubCategory: "Operational incident investigation", operatingSystem: "Cross-platform", programmingLanguage: "Python",
      runtimePlatform: "Python 3.11+", isAccessibleForFree: true, license: "https://www.apache.org/licenses/LICENSE-2.0", codeRepository: "https://github.com/soloshun/lumis-sdk",
      downloadUrl: "https://github.com/soloshun/lumis-sdk/tree/dev", developmentStatus: "Experimental development", sameAs: ["https://github.com/soloshun/lumis-sdk"],
      author: { "@type": "Person", name: "Solomon Eshun", url: "https://github.com/soloshun" },
    },
  ],
};

export default function Home() {
  return <><JsonLd data={schema} /><ScrollFX /><SiteNav /><main id="main"><Hero /><Principles /><Architecture /><Workflow /><Start /><Research /><Community /></main><Footer /></>;
}
