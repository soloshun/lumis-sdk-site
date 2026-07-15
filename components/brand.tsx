import Link from "next/link";
import Image from "next/image";

export function Brand({ docs = false }: { docs?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Lumis SDK home">
      <Image className="brand-icon" src="/icon.svg" alt="" width={28} height={28} priority />
      <span className="brand-word">lumis</span>
      <span className="brand-product">{docs ? "docs" : "sdk"}</span>
    </Link>
  );
}

export function GitHubMark() {
  return <span className="github-mark" aria-hidden="true">GH</span>;
}
