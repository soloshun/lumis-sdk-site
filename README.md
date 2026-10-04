# Lumis SDK website

A one-page introduction and nine-page, bespoke documentation site for **evidence-grounded operational intelligence**. Built with Next.js, React, and TypeScript; deployed with Vercel's native Next.js build. Light/dark docs, persistent experimental notice, grouped navigation, rendered code, copyable Markdown, and a static social preview are included.

## Content truth

The site follows the current SDK `dev` architecture, reviewed through `f42b8e8` on 2026-10-04, including the local notebook additions. Primary workflow: prepared graph → registered evidence → deterministic triage → optional bounded investigator → mechanical assessment → human review. SQL observations, typed Git/Kubernetes change records, and competing-root abstention are covered.

The SDK is experimental and this architecture is not established as a published package-index release. Source metadata (`0.1.0rc1`) is not a publication claim. No automatic remediation, rule promotion, live OTLP receiver, or confirmed causal diagnosis is advertised. The earlier arXiv preprint is labelled foundational prior research. Platform links remain “coming soon”.

Source references: sibling `lumis-sdk/README.md`, SDK docs/contracts, root `new_design_pattern.md`, `lumis_new_design_pattern_contd.md`, `working_lumis_products.md`, and the marketing site's operational-intelligence direction. SDK code overrides aspirational design notes and stale documentation where they conflict. The website does not modify the SDK, cookbooks, or marketing project.

## Development

Use Node 22.x.

```sh
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm test
```

`npm test` builds with native Next.js and smoke-tests the production HTTP server. It checks all nine docs pages, current terminology, metadata, structured data, crawler outputs, AI-readable content, legacy redirects, and the generated social PNG. The test server uses localhost port 4397 and exits after the suite.

## Editing

- `components/home-sections.tsx`: concise homepage and illustrative investigation panel.
- `content/docs.ts`: nine current pages, sections, source references, reading order, and Markdown export.
- `components/site-nav.tsx`: permanent preview banner; only the main-page header hides on downward scroll.
- `app/globals.css`: original graphite/blue/amber visual system and documentation themes.
- `components/community.tsx`: original contribution, contributor, and live GitHub star section, with current SDK wording.
- `lib/site.ts`: canonical origin, shared metadata, social image, and content update date.
- `app/og/route.tsx`: text-accurate 1200×630 PNG preview, generated from code.
- `next.config.ts`: permanent redirects for retired documentation and social-image URLs.

Update SDK claims, examples, site metadata, and AI-readable text together. Increment `CONTENT_UPDATED` when public content materially changes. Keep `llms.txt` and `llms-full.txt` based on the same docs source; they are readable context files, not a promise of search ranking.

## Vercel and SEO

Select **Next.js** as the framework. Build with `npm run build` (or the checked-in `next build` override), and leave Output Directory at its Next.js default. Do not point Vercel at a Vite `dist` output. All active docs routes are prerendered; unknown pages return 404.

Original Cloudflare, database, and starter-auth files remain untouched. The active Vercel scripts use native Next.js; `.openai/hosting.json` is historical resource metadata, not the active Vercel deployment configuration. No external resources were deleted.

Set `NEXT_PUBLIC_SITE_URL` to the final public origin (for example `https://sdk.example.com`) before building. `VERCEL_PROJECT_PRODUCTION_URL` is the fallback, followed by `https://lumis-sdk-site.vercel.app`. These drive canonical URLs, sitemap, JSON-LD, social metadata, and AI-readable links. Optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` inject verification tags; registering Search Console and submitting the sitemap are separate owner actions.

Production metadata includes unique titles/descriptions/canonicals, WebSite and SoftwareApplication/SoftwareSourceCode JSON-LD, doc TechArticle/BreadcrumbList, robots, sitemap, manifest, and Open Graph/X cards. Vercel preview builds are marked noindex and robots-disallowed to avoid competing with production URLs. Retired API pages redirect to the migration guide rather than presenting old interfaces as current. Search rankings and indexing are not guaranteed.

## Branch history and promotion

- `legacy/pre-operational-intelligence-2026-10-04` preserves old website commit `34f4e2f` unchanged.
- `dev` contains the new website and current operational documentation.
- `main` stays on the previous site until the new direction is reviewed and promoted.

Promote through a reviewed `dev` → `main` change after verification. A pushed branch is not evidence of a Vercel production deployment. Legacy branch content should be used from a separate checkout, not combined with current SDK contracts.
