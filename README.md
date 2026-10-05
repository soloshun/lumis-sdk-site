# Lumis SDK website

The home page and documentation for [Lumis SDK](https://github.com/soloshun/lumis-sdk), an experimental, open-source Python SDK for evidence-grounded incident investigation. Built with Next.js, React and TypeScript; deployed with Vercel's native Next.js build.

## Content truth

The site describes **`lumis-sdk` 0.1.0** as published on PyPI (5 October 2026). Every claim must hold for that release:

- **Read-only.** There is no remediation executor, no automatic rule learning and no hosted service.
- **Experimental.** APIs may change before 1.0.
- **Evaluated on one estate.** The only live evaluation is the GridCast reference estate (15 injected failures) with one model, DeepSeek v4 pro. Numbers on the site are taken from the cookbook's research notes, exclude scenario N (a ground-truth leak), and always carry that caveat.

Sources: the SDK `README.md`, `docs/` and `CHANGELOG.md` on `main`, and `lumis-cookbooks/gridcast/docs/research-notes.md`. When the SDK changes, update `content/docs.ts`, the home page and `tests/rendered-html.test.mjs` together, and bump `CONTENT_UPDATED` in `lib/site.ts`.

## Development

Use Node 22.x.

```sh
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm test
```

`npm test` builds with native Next.js and smoke-tests the production server on port 4397. It checks:

- the home page and all documentation pages;
- the palette, metadata, structured data and the sitemap;
- legacy redirects, the AI-readable files and the social image.

## Editing

| File | What it holds |
|---|---|
| `content/docs.ts` | The 16 documentation pages as typed blocks. Text supports `code`, **bold** and `[links](/docs/...)`; diagrams are Mermaid. |
| `components/home-sections.tsx` | The home page sections. The hero YAML is the SDK's tested small-project example; keep it exact. |
| `components/community.tsx` | Live GitHub stars and contributors; contact is by email (`solomon@qadimlabs.com`). |
| `components/site-nav.tsx` | The status banner and the navigation bars. |
| `app/globals.css` | The design system: paper and ink with one teal accent, in light and dark themes (`data-doc-theme`). |
| `components/mermaid.tsx` | Diagram rendering. It waits for fonts and passes the resolved font family, so labels are measured correctly. |
| `lib/site.ts` | Canonical origin, title, description and content date. |
| `app/og/route.tsx` | The 1200×630 social image, generated from code. |
| `next.config.ts` | Permanent redirects for retired and renamed documentation URLs. |

## Vercel and SEO

Select **Next.js** as the framework. Build with `npm run build` (or the checked-in `next build` override), and leave Output Directory at its Next.js default. Do not point Vercel at a Vite `dist` output. All active docs routes are prerendered; unknown pages return 404.

Original Cloudflare, database, and starter-auth files remain untouched. The active Vercel scripts use native Next.js; `.openai/hosting.json` is historical resource metadata, not the active Vercel deployment configuration. No external resources were deleted.

Set `NEXT_PUBLIC_SITE_URL` to the final public origin (for example `https://sdk.example.com`) before building. `VERCEL_PROJECT_PRODUCTION_URL` is the fallback, followed by `https://lumis-sdk-site.vercel.app`. These drive canonical URLs, sitemap, JSON-LD, social metadata, and AI-readable links. Optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` inject verification tags; registering Search Console and submitting the sitemap are separate owner actions.

Production metadata includes unique titles/descriptions/canonicals, WebSite and SoftwareApplication/SoftwareSourceCode JSON-LD, doc TechArticle/BreadcrumbList, robots, sitemap, manifest, and Open Graph/X cards. Vercel preview builds are marked noindex and robots-disallowed to avoid competing with production URLs. Retired API pages redirect to the project page rather than presenting old interfaces as current. Search rankings and indexing are not guaranteed.

## Branch history and promotion

- `legacy/pre-operational-intelligence-2026-10-04` preserves the old website (commit `34f4e2f`).
- `dev` is where changes land.
- `main` is promoted from `dev` after review.

Promote through a reviewed `dev` → `main` change after verification. A pushed branch is not evidence of a Vercel production deployment. Legacy branch content should be used from a separate checkout, not combined with current SDK contracts.
