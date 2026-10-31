/** Route fallback. Deliberately empty: pages are cached, so this is only seen
 * on a cold fetch, and a full-screen loader flashing between pages made
 * navigation feel like a reload. The page-level view transition covers the swap. */
export default function Loading() {
  return <div role="status" aria-label="Loading" className="min-h-[60svh] flex-1" />;
}
