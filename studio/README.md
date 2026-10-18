# Khaled Portfolio — Sanity Studio

Standalone Sanity Studio for the portfolio content. This is a **separate
project/deploy** from the Next.js site (in the parent directory) — it is not
mounted inside the app. The site reads this content read-only via
`@sanity/client`.

## Setup

```bash
cd studio
npm install
cp .env.example .env           # then fill in SANITY_STUDIO_PROJECT_ID
npx sanity login               # authenticate (first time)
npx sanity init --env          # or create a project at sanity.io/manage and paste its id
npm run dev                    # http://localhost:3333
```

Set the same project id / dataset in the **site's** `.env.local`
(`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`).

## Content types

- `project`, `blogPost` — cards/rows + Portable Text body; cover images require alt text.
- `timelineEntry` — Qualifications git-log rows.
- `skill` — "About Me" terminal tiles.
- `siteSettings` — singleton (hero, social links, footer).

## Writing experience

- **Editor tabs** — Write / Details / Cover / Series. Blog posts and Projects are separate lists (plus a Drafts list); "New" offers one entry per kind.
- **Live preview** — the Presentation tool (and a "Preview on site" document action) loads the real site with drafts and click-to-edit. One-time setup:
  1. Create a **Viewer** token at sanity.io/manage → API → Tokens.
  2. Site `.env.local`: `SANITY_API_READ_TOKEN=<token>`, `NEXT_PUBLIC_SANITY_STUDIO_URL=<studio url>`.
  3. Studio `.env`: `SANITY_STUDIO_PREVIEW_ORIGIN=<site url>` (default `http://localhost:3000`).
  4. Add the Studio origin to the project's CORS origins **with credentials**.
  Published pages stay static: `proxy.ts` only reroutes requests carrying the Draft Mode cookie to `/preview/...`.
- **Markdown paste** — pasting Markdown into the body converts it to blocks (h1–h6 → H2/H3, lists, quotes, bold/italic/code, links, fenced code → Code cell).
- **References** — the identifier field checks PEP / WG21 / RFC / man-page ids against the site's `/api/citation`.
- **Warnings** (not blockers) — missing cover, long summary, half-filled series, long post without headings.
- **Diagram editor** — set `SANITY_STUDIO_TLDRAW_LICENSE_KEY` in `studio/.env`.

## Deploy the Studio

```bash
npm run deploy                 # → https://<your-project>.sanity.studio (free hosting)
```

## Type generation (run after schema changes)

From this directory, regenerate the site's typed query results:

```bash
npm run typegen                # sanity schema extract + typegen → ../sanity.types.ts
```

The site also exposes `npm run typegen` at the repo root, which delegates here.

## Revalidation webhook (makes edits go live without a redeploy)

In **sanity.io/manage → API → Webhooks**, add a webhook:

- **URL:** `https://<your-site-domain>/api/revalidate`
- **Trigger:** on create / update / delete
- **Projection:** `{ _type }`
- **Secret:** the same value as the site's `SANITY_REVALIDATE_SECRET`

The site route (`app/api/revalidate/route.ts`) verifies the signature and
calls `revalidateTag(_type, { expire: 0 })`.
