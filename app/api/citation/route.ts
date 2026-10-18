import { resolveCitation } from "@/lib/citations";

// Public, read-only metadata about public documents; the Studio (another
// origin) calls this to verify a reference identifier as you type.
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") ?? "";
  const id = searchParams.get("id") ?? "";
  if (!kind || !id) return Response.json({ error: "kind and id are required" }, { status: 400, headers: CORS });
  const found = await resolveCitation(kind, id);
  if (!found) return Response.json({ error: "not found" }, { status: 404, headers: CORS });
  return Response.json(found, { headers: CORS });
}
