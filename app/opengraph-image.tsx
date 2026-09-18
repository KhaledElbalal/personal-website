import { ImageResponse } from "next/og";

import { OG_SIZE, SiteOgCard, loadGoogleFont } from "@/lib/og";
import { getSiteName } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [name, fontData] = await Promise.all([
    getSiteName(),
    loadGoogleFont("Space+Mono", 700),
  ]);
  return new ImageResponse(<SiteOgCard name={name} />, {
    ...size,
    fonts: [{ name: "Space Mono", data: fontData, weight: 700, style: "normal" }],
  });
}
