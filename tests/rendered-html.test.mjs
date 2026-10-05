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

test("homepage states the current release, boundaries and honest results", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Incident investigation/);
  assert.match(html, /grounded in evidence/);
  assert.match(html, /pip install (&quot;|")lumis-sdk\[http,agent\]/);
  assert.match(html, /Experimental · v0\.1\.0/);
  assert.match(html, /supported_diagnosis/);
  assert.match(html, /proof of concept, not a benchmark/);
  assert.match(html, /id="how"/);
  assert.match(html, /id="results"/);
  assert.match(html, /id="research"/);
  assert.match(html, /id="community"/);
  assert.match(html, /solomon@qadimlabs\.com/);
  assert.match(html, /href="https:\/\/lumis\.qadimlabs\.com"/);
  assert.match(html, /lumis\.qadimlabs\.com\/blog/);
  assert.match(html, /Download PDF/);
  const paper = await render("/research/agentic-self-healing-for-data-and-ai-pipelines.pdf");
  assert.equal(paper.status, 200);
  assert.match(paper.headers.get("content-type"), /application\/pdf/);
  assert.doesNotMatch(html, /--branch dev|COMING SOON|Discord|diagnose --config|13 RUNNABLE COOKBOOKS/);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /<title>Lumis SDK: Evidence-Grounded Incident Investigation<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/lumis-sdk-site\.vercel\.app\/?"/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const software = schemas.flatMap(schema => schema["@graph"] || []).find(item => item.codeRepository);
  assert.ok(software?.codeRepository.endsWith("/lumis-sdk"));
  assert.equal(software.softwareVersion, "0.1.0");
});

test("the paper-and-teal palette is in use", async () => {
  const html = await (await render("/")).text();
  const sheets = [...html.matchAll(/href="([^"]+\.css(?:\?[^"]*)?)"/g)].map(match => match[1]);
  const css = (await Promise.all(sheets.map(async url => (await render(url)).text()))).join("\n");
  assert.match(css, /--accent:\s*#0d7a6f/i);
  assert.match(css, /--bg:\s*#f7f7f4/i);
  assert.doesNotMatch(css, /#2962ff/i);
});

const pages = ["", "quickstart", "small-project", "how-it-works", "graph", "evidence", "triage", "investigator", "reports", "configuration", "connectors", "api", "models", "safety", "evaluation", "project"];
test("all documentation pages are server-rendered with unique canonicals and the status banner", async () => {
  for (const slug of pages) {
    const path = `/docs${slug ? `/${slug}` : ""}`;
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /TechArticle/);
    assert.match(html, /BreadcrumbList/);
    assert.match(html, /class="docs-topbar"/);
    assert.match(html, /Toggle color theme/);
    assert.match(html, /<details/);
    assert.match(html, /Experimental · v0\.1\.0/);
    assert.ok(html.includes(`rel="canonical" href="https://lumis-sdk-site.vercel.app${path}"`), path);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, path);
    assert.match(html, /\/og/);
  }
});

test("docs cover change evidence, SQL, competing roots, missing data and the evaluation caveats", async () => {
  const connectors = await (await render("/docs/connectors")).text();
  const reports = await (await render("/docs/reports")).text();
  const evidence = await (await render("/docs/evidence")).text();
  const evaluation = await (await render("/docs/evaluation")).text();
  assert.match(connectors, /Recent changes/);
  assert.match(connectors, /Read-only SQL/);
  assert.match(connectors, /ScalingReplicaSet/);
  assert.match(reports, /insufficient_evidence/);
  assert.match(reports, /competing roots listed|competing roots/);
  assert.match(evidence, /Missing data is unknown, never zero/);
  assert.match(evaluation, /ground-truth leak/);
  assert.match(evaluation, /one model family/);
});

test("crawler discovery contains only the new current pages", async () => {
  const robots = await (await render("/robots.txt")).text();
  const sitemap = await (await render("/sitemap.xml")).text();
  const manifest = await (await render("/manifest.webmanifest")).json();
  assert.match(robots, /Sitemap: https:\/\/lumis-sdk-site\.vercel\.app\/sitemap\.xml/);
  assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length + 1);
  assert.match(sitemap, /2026-10-05/);
  for (const slug of pages.filter(Boolean)) assert.ok(sitemap.includes(`/docs/${slug}</loc>`));
  assert.doesNotMatch(sitemap, /lifecycle-contracts|project\/research|cookbooks/);
  assert.match(manifest.name, /Incident Investigation/);
});

test("legacy bookmarks permanently redirect without implying retired API support", async () => {
  for (const [old, current] of [["getting-started/quickstart", "quickstart"], ["architecture/overview", "how-it-works"], ["concepts/healing-as-code", "project"], ["project/research", "project"], ["python-api/plugins", "project"], ["overview", ""], ["architecture", "how-it-works"], ["investigation", "investigator"]]) {
    const response = await render(`/docs/${old}`);
    assert.equal(response.status, 308, old);
    assert.equal(response.headers.get("location"), `/docs${current ? `/${current}` : ""}`);
  }
  assert.equal((await render("/docs/not-a-real-page")).status, 404);
});

test("AI-readable documents use canonical URLs and the current SDK architecture", async () => {
  const index = await (await render("/llms.txt")).text();
  const full = await (await render("/llms-full.txt")).text();
  assert.match(index, /evidence-grounded incident investigation/);
  assert.match(index, /YamlProject.handle_incident/);
  assert.match(index, /https:\/\/lumis-sdk-site\.vercel\.app\/docs\/quickstart/);
  assert.doesNotMatch(index, /127\.0\.0\.1|Python package:/);
  assert.match(full, /lumis.dev\/operational-v1alpha1/);
  assert.match(full, /Recent changes/);
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
