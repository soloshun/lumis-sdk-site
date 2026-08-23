import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the SDK homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Build guarded recovery for/);
  assert.match(html, /Deterministic first/);
  assert.match(html, /Lumis SDK stays useful on its own/);
  assert.match(html, /LUMIS · COMING SOON/);
  assert.doesNotMatch(html, /lumis\.qadimlabs\.com/);
  assert.match(html, /View on GitHub/);
  assert.match(html, /WORK IN PROGRESS · EXPERIMENTAL PREVIEW/);
  assert.match(html, /PUBLISHED ON arXiv · 2608\.01955/);
  assert.match(html, /Verified repetition becomes policy/);
  assert.match(html, /https:\/\/arxiv\.org\/abs\/2608\.01955/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("server-renders structured documentation", async () => {
  const response = await render("/docs");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Lumis SDK documentation/);
  assert.match(html, /Design principles/);
  assert.match(html, /Documentation page/);
  assert.match(html, /Toggle documentation color theme/);
  assert.match(html, /<details/);
  assert.match(html, /WORK IN PROGRESS · EXPERIMENTAL PREVIEW/);
  assert.match(html, /class="docs-topbar"/);
  assert.doesNotMatch(html, /class="docs-topbar scroll-header/);
});

test("server-renders the published research and learning loops", async () => {
  const [research, architecture, memory] = await Promise.all([
    render("/docs/project/research"),
    render("/docs/architecture/overview"),
    render("/docs/concepts/operational-memory"),
  ]);
  assert.equal(research.status, 200);
  assert.equal(architecture.status, 200);
  assert.equal(memory.status, 200);
  assert.match(await research.text(), /Published preprint/);
  assert.match(await architecture.text(), /Seven-layer reference architecture/);
  assert.match(await memory.text(), /Five is an example, not a universal constant/);
});

test("server-renders nested framework concepts", async () => {
  const [healing, lifecycle] = await Promise.all([
    render("/docs/concepts/healing-as-code"),
    render("/docs/architecture/lifecycle-contracts"),
  ]);
  assert.equal(healing.status, 200);
  assert.equal(lifecycle.status, 200);
  assert.match(await healing.text(), /A direction, not a shipped executor/);
  assert.match(await lifecycle.text(), /Current orchestration/);
});
