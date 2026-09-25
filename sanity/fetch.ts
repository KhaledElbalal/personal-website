import { cacheLife, cacheTag } from "next/cache";

import { client } from "./client";

/**
 * Cached read against Sanity, built on Next 16 Cache Components.
 *
 * `use cache` makes the result cacheable (requires `cacheComponents: true` in
 * next.config.ts). `cacheLife('hours')` sets stale 5m / revalidate 1h / expire
 * 1d. Each tag registers this entry for on-demand invalidation — the webhook
 * route (app/api/revalidate) calls `revalidateTag(type, { expire: 0 })` when a
 * document of that `_type` changes, so edits go live without a redeploy.
 *
 * Pass the document `_type`(s) the query reads as `tags`, e.g.
 *   sanityFetch(POSTS_QUERY, {}, ["post"])
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
): Promise<T> {
  "use cache";
  // Locally there's no revalidate webhook, so keep dev near-live — otherwise
  // Studio edits don't show up for up to an hour.
  // Next treats stale < 30s, revalidate 0 or expire < 5min as request-time
  // data (breaks prerendering — see next/dist/server/use-cache/constants.js),
  // so these are the shortest values that still prerender.
  if (process.env.NODE_ENV === "development") cacheLife({ stale: 30, revalidate: 1, expire: 300 });
  else cacheLife("hours");
  for (const tag of tags) {
    cacheTag(tag);
  }
  return client.fetch<T>(query, params);
}
