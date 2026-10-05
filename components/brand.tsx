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
    <Link className="brand" href={docs ? "/docs" : "/"} aria-label={docs ? "Lumis SDK documentation" : "Lumis SDK home"}>
      <Wordmark />
      <span className="brand-product">{docs ? "docs" : "sdk"}</span>
    </Link>
  );
}
