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
 *   sanityFetch(PROJECTS_QUERY, {}, ["project"])
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
): Promise<T> {
  "use cache";
  cacheLife("hours");
  for (const tag of tags) {
    cacheTag(tag);
  }
  return client.fetch<T>(query, params);
}
