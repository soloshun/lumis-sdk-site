import Link from "next/link";

export function Wordmark() {
  return (
    <span className="brand-word" aria-hidden="true">
      Lum<span className="brand-i">ı<i /></span>s
    </span>
  );
}

export function Brand({ docs = false }: { docs?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Lumis SDK home">
      <Wordmark />
      <span className="brand-product">{docs ? "docs" : "sdk"}</span>
    </Link>
  );
}

export function GitHubMark() {
  return <span className="github-mark" aria-hidden="true">GH</span>;
}
