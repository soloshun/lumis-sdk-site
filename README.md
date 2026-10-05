# Lumis SDK website

The website and documentation for [Lumis SDK](https://github.com/soloshun/lumis-sdk), live at **[lumis-sdk.vercel.app](https://lumis-sdk.vercel.app)**:

- the home page at `/`;
- the documentation at [`/docs`](https://lumis-sdk.vercel.app/docs).

Lumis SDK is an experimental Python SDK for evidence-grounded incident investigation. It is the open-source (Apache-2.0) proof of concept of Lumis' investigation core; other Lumis products and services are separate. The company site is [lumis.qadimlabs.com](https://lumis.qadimlabs.com).

Built with Next.js 16, React 19 and TypeScript, and deployed on Vercel.

## Content rules

Everything on the site must be true of the published **`lumis-sdk` 0.1.0**:

- **Read-only.** Lumis has no remediation executor, no automatic rule learning and no hosted service.
- **Experimental.** APIs may change before 1.0.
- **Evaluated on one estate.** The only live evaluation is the GridCast reference estate: 15 injected failures, one model (DeepSeek v4 pro). Results come from the [research notes](https://github.com/soloshun/lumis-cookbooks/blob/main/gridcast/docs/research-notes.md), exclude scenario N (a ground-truth leak), and always carry that caveat.
- **Open source means the SDK only.** Do not write "built in the open", "built in public" or "no lock-in". The tests fail on those phrases.

Sources of truth are the SDK's `README.md`, `docs/` and `CHANGELOG.md` on `main`. When the SDK changes, update these together and bump `CONTENT_UPDATED` in `lib/site.ts`:

- the docs (`content/docs.ts`);
- the home page;
- the tests.

## Development

Use Node 22.x.

```sh
npm ci
npm run dev          # http://localhost:3000
npm run lint
npx tsc --noEmit
npm test             # production build + smoke tests on port 4397
```

`npm test` builds the site and checks the production server. It covers:

- the home page and all 16 docs pages: status banner, canonical URLs and one `h1` each;
- the palette, structured data, sitemap and robots;
- legacy redirects, `llms.txt` / `llms-full.txt` and the social image;
- the wording rules above.

## Where things live

| Path | Contents |
|---|---|
| `content/docs.ts` | All documentation pages as typed blocks, grouped into Start here, Concepts, Build and Project. Text supports `code`, **bold** and `[links](/docs/...)`; diagrams are Mermaid. |
| `components/home-sections.tsx` | Home page sections. The hero YAML is the SDK's tested small-project example; keep it exact. |
| `components/community.tsx` | Live GitHub stars and contributors, plus email contact (`solomon@qadimlabs.com`). |
| `components/site-nav.tsx` | Status banner, home navigation and the docs top bar. |
| `components/brand.tsx` | The wordmark. It links home on the home page and to `/docs` in the docs. |
| `components/mermaid.tsx` | Diagram rendering. It waits for fonts and passes the resolved font family, so labels are not clipped. |
| `app/globals.css` | Design system: paper and ink with one teal accent, light and dark via `data-doc-theme`. |
| `app/docs/[[...slug]]/page.tsx` | Docs layout: sidebar, table of contents, "Copy as Markdown", previous and next. |
| `app/icon.svg` | Tab icon: the Lumis symbol, shared with lumis.qadimlabs.com. |
| `app/og/route.tsx` | The 1200×630 social image, generated from code. |
| `lib/site.ts` | Canonical origin, title, description and content date. |
| `next.config.ts` | Permanent redirects for retired and renamed docs URLs. |

## Deployment

Vercel builds `main` with the Next.js framework preset (`next build`, default output directory).

- **Canonical origin.** The order is `NEXT_PUBLIC_SITE_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`, then `https://lumis-sdk.vercel.app`. It drives canonical URLs, the sitemap, JSON-LD, social metadata and `llms.txt`.
- **Search verification.** Optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` add verification tags.
- **Preview builds.** Vercel previews are `noindex` and disallowed in `robots.txt`.

The Cloudflare, database and starter-auth files (`worker/`, `db/`, `drizzle/`, `examples/`) are unused leftovers from the original template and are not part of the Vercel build.

## Branches

- `dev`: where changes land, through pull requests.
- `main`: production. Promote from `dev` after review.
- `legacy/pre-operational-intelligence-2026-10-04`: the original website, preserved.
