import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const secret = process.env.SANITY_REVALIDATE_SECRET;

/**
 * On-demand revalidation webhook. Configure a Sanity webhook (Studio →
 * API → Webhooks) to POST here with the secret above and a projection that
 * includes `_type`. When a document changes, we invalidate the cache tag
 * matching its `_type` (see sanity/fetch.ts), so edits go live without a
 * redeploy.
 *
 * Manual testing:
 *   curl -X POST "http://localhost:3000/api/revalidate?secret=$SECRET" \
 *     -H 'content-type: application/json' -d '{"_type":"project"}'
 */
export async function POST(request: NextRequest) {
  if (!secret) {
    return new NextResponse(
      "Server misconfigured: missing SANITY_REVALIDATE_SECRET",
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const querySecret = request.nextUrl.searchParams.get("secret");

  const authorized = signature
    ? await isValidSignature(body, signature, secret)
    : querySecret === secret;

  if (!authorized) {
    return new NextResponse("Invalid signature or secret", { status: 401 });
  }

  let type: string | undefined;
  try {
    type = (JSON.parse(body || "{}") as { _type?: string })._type;
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  if (!type) {
    return new NextResponse("Missing _type in payload", { status: 400 });
  }

  revalidateTag(type, { expire: 0 });

  return NextResponse.json({ revalidated: true, type });
}
