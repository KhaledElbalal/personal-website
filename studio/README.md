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
