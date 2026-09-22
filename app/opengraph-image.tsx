import { ImageResponse } from "next/og";

import { OG_SIZE, SiteOgCard, loadOgFonts } from "@/lib/og";
import { SITE_URL, getSiteName } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [name, fonts] = await Promise.all([getSiteName(), loadOgFonts()]);
  return new ImageResponse(<SiteOgCard name={name} url={SITE_URL} />, {
    ...size,
    fonts,
  });
}
