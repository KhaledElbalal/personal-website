import { NextResponse, type NextRequest } from "next/server";

// Draft Mode (Presentation tool): published post pages are prerendered and
// cached, so editors with the Draft Mode cookie are rewritten to the uncached
// /preview tree, which reads drafts. Everyone else is untouched.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("__prerender_bypass")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/preview${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/:section(blog|projects)/:slug([^/.]+)",
};
