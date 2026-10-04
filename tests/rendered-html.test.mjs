import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { after, before, test } from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const PORT = 4397;
const BASE = `http://127.0.0.1:${PORT}`;
let server;
let output = "";
before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(PORT), "--hostname", "127.0.0.1"], {stdio: ["ignore", "pipe", "pipe"]});
  server.stdout.on("data", chunk => { output += chunk; });
  server.stderr.on("data", chunk => { output += chunk; });
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(output);
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await setTimeout(100);
  }
  throw new Error(`Production server failed to become ready: ${output}`);
});
after(() => server?.kill());
const render = path => fetch(`${BASE}${path}`, {redirect: "manual"});

test("browser-only theme initialization is scoped to the root hydration boundary", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /<html\b[^>]*\bsuppressHydrationWarning\b/);
  assert.doesNotMatch(layout, /<script\b[^>]*\bsuppressHydrationWarning\b/);
  const html = await (await render("/")).text();
  const bootstrap = html.match(/<script[^>]*>([^<]*lumis-doc-theme[^<]*)<\/script>/)?.[1];
  assert.ok(bootstrap, "theme bootstrap is included before page hydration");
  for (const [search, saved, systemDark, expected] of [
    ["", null, true, "dark"], ["", null, false, "light"],
    ["", "light", true, "light"], ["", "dark", false, "dark"],
    ["?lumis-theme=light", "dark", true, "light"],
    ["?lumis-theme=dark", "light", false, "dark"],
  ]) {
    const document = {documentElement: {dataset: {}}};
    runInNewContext(bootstrap, {document, location: {search}, URLSearchParams,
      localStorage: {getItem: () => saved}, matchMedia: () => ({matches: systemDark})}, {timeout: 1000});
    assert.equal(document.documentElement.dataset.docTheme, expected);
  }
});

test("homepage communicates the current investigation boundary and accurate source install", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Operational intelligence/);
  assert.match(html, /Grounded in evidence/);
  assert.match(html, /Models propose/);
  assert.match(html, /Lumis tests/);
  assert.match(html, /--branch dev/);
  assert.match(html, /WORK IN PROGRESS · EXPERIMENTAL PREVIEW/);
  assert.match(html, /LUMIS PLATFORM · COMING SOON/);
  assert.match(html, /unconfirmed_hypothesis/);
  assert.match(html, /id="research"/);
  assert.match(html, /id="community"/);
  assert.match(html, /Star on GitHub/);
  assert.match(html, /DOWNLOAD PDF/);
  const paper = await render("/research/agentic-self-healing-for-data-and-ai-pipelines.pdf");
  assert.equal(paper.status, 200);
  assert.match(paper.headers.get("content-type"), /application\/pdf/);
  assert.match(html, /Sample operational dependency graph/);
  assert.match(html, /Evidence categories—not confidence scores/);
  assert.doesNotMatch(html, /uv add lumis-sdk|13 RUNNABLE COOKBOOKS|softwareVersion|pypi.org|diagnose --config/);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /<title>Lumis SDK: Evidence-Grounded Operational Intelligence<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/lumis-sdk-site\.vercel\.app\/?"/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.ok(schemas.some(schema => schema["@graph"]?.some(item => item.codeRepository?.endsWith("/lumis-sdk"))));
});

test("the original visual palette remains intact", async () => {
  const html = await (await render("/")).text();
  const sheets = [...html.matchAll(/href="([^"]+\.css(?:\?[^"]*)?)"/g)].map(match => match[1]);
  const css = (await Promise.all(sheets.map(async url => (await render(url)).text()))).join("\n");
  assert.match(css, /--signal:\s*#2962ff/i);
  assert.match(css, /--signal-soft:\s*#7aa2ff/i);
  assert.doesNotMatch(css, /#245f5b|#9fbbb8|#263229/i);
});

const pages = ["", "quickstart", "architecture", "investigation", "configuration", "connectors", "api", "safety", "project"];
test("all nine documentation pages are server-rendered with unique canonicals and stable header", async () => {
  for (const slug of pages) {
    const path = `/docs${slug ? `/${slug}` : ""}`;
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /TechArticle/);
    assert.match(html, /BreadcrumbList/);
    assert.match(html, /class="docs-topbar"/);
    assert.doesNotMatch(html, /docs-topbar scroll-header|PHASE 1/);
    assert.match(html, /Toggle documentation color theme/);
    assert.match(html, /<details/);
    assert.match(html, /WORK IN PROGRESS · EXPERIMENTAL PREVIEW/);
    assert.ok(html.includes(`rel="canonical" href="https://lumis-sdk-site.vercel.app${path}"`));
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, path);
    assert.match(html, /\/og/);
  }
});

test("current SDK details include change evidence, SQL, conflicting roots, and uncertainty", async () => {
  const connectorHtml = await (await render("/docs/connectors")).text();
  const investigationHtml = await (await render("/docs/investigation")).text();
  assert.match(connectorHtml, /Recent changes as checkable evidence/);
  assert.match(connectorHtml, /Read-only|read-only PostgreSQL/);
  assert.match(connectorHtml, /ScalingReplicaSet/);
  assert.match(investigationHtml, /Competing supported roots yield insufficient_evidence/);
  assert.match(investigationHtml, /quality: degraded/);
  assert.match(investigationHtml, /No|no|never/);
});

test("crawler discovery contains only the new current pages", async () => {
  const robots = await (await render("/robots.txt")).text();
  const sitemap = await (await render("/sitemap.xml")).text();
  const manifest = await (await render("/manifest.webmanifest")).json();
  assert.match(robots, /Sitemap: https:\/\/lumis-sdk-site\.vercel\.app\/sitemap\.xml/);
  assert.equal((sitemap.match(/<loc>/g) || []).length, 10);
  assert.match(sitemap, /2026-10-04/);
  for (const slug of pages.filter(Boolean)) assert.ok(sitemap.includes(`/docs/${slug}</loc>`));
  assert.doesNotMatch(sitemap, /lifecycle-contracts|project\/research|cookbooks/);
  assert.match(manifest.name, /Operational Intelligence/);
});

test("legacy bookmarks permanently redirect without implying retired API support", async () => {
  for (const [old, current] of [["getting-started/quickstart", "quickstart"], ["architecture/overview", "architecture"], ["concepts/healing-as-code", "project"], ["project/research", "project"], ["python-api/plugins", "project"], ["overview", ""]]) {
    const response = await render(`/docs/${old}`);
    assert.equal(response.status, 308, old);
    assert.equal(response.headers.get("location"), `/docs${current ? `/${current}` : ""}`);
  }
  assert.equal((await render("/docs/not-a-real-page")).status, 404);
});

test("AI-readable documents use canonical URLs and the current SDK architecture", async () => {
  const index = await (await render("/llms.txt")).text();
  const full = await (await render("/llms-full.txt")).text();
  assert.match(index, /evidence-grounded operational intelligence/);
  assert.match(index, /YamlProject.handle_incident/);
  assert.match(index, /https:\/\/lumis-sdk-site\.vercel\.app\/docs\/quickstart/);
  assert.doesNotMatch(index, /127\.0\.0\.1|Python package:/);
  assert.match(full, /lumis.dev\/operational-v1alpha1/);
  assert.match(full, /Recent changes as checkable evidence/);
  assert.match(full, /unconfirmed_hypothesis/);
  assert.doesNotMatch(full, /run_guarded_lifecycle|lumis.dev\/v1/);
});

test("social preview is a freshly rendered PNG, and old image URLs redirect", async () => {
  const response = await render("/og");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /image\/png/);
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual([...bytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const old = await render("/og.png");
  assert.equal(old.status, 308);
  assert.equal(old.headers.get("location"), "/og");
});
