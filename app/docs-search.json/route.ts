import { NextResponse } from "next/server";
import { docs } from "@/content/docs";
import { createDocsSearchIndex } from "@/lib/docs-search";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(createDocsSearchIndex(docs), { headers: { "X-Robots-Tag": "noindex" } });
}
