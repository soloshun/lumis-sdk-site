import Link from "next/link";

export function Brand({ docs = false }: { docs?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Lumis SDK home">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      <span className="brand-word">lumis</span>
      <span className="brand-product">{docs ? "docs" : "sdk"}</span>
    </Link>
  );
}

export function GitHubMark() {
  return <span className="github-mark" aria-hidden="true">GH</span>;
}
