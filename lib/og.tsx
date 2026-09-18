import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

const OG_COLORS = {
  ink: "#121420",
  ghostWhite: "#f7f7ff",
  accentBright: "#38b6ff",
  mutedOnDark: "rgba(247,247,255,0.6)",
};

/** Fetches a Google Fonts TTF/OTF file for use with next/og's ImageResponse —
 * Satori can't load woff2, so we ask Google's CSS2 endpoint for the legacy
 * truetype/opentype fallback it still serves alongside woff2. */
export async function loadGoogleFont(family: string, weight = 700) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
  ).then((res) => res.text());
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error(`Could not resolve a font file for ${family}`);
  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

/** The [K▮] mark, sized for reuse across the site-wide OG image and the
 * smaller per-post cards. */
function Mark({ fontSize }: { fontSize: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontWeight: 700,
        fontSize,
        color: OG_COLORS.ghostWhite,
      }}
    >
      <span style={{ color: OG_COLORS.accentBright }}>[</span>
      <span style={{ display: "flex" }}>K</span>
      <span
        style={{
          display: "flex",
          marginLeft: fontSize * 0.12,
          width: fontSize * 0.16,
          height: fontSize * 0.86,
          backgroundColor: OG_COLORS.accentBright,
        }}
      />
      <span style={{ color: OG_COLORS.accentBright }}>]</span>
    </div>
  );
}

/** Site-wide default OG/Twitter card — Home and any page without its own. */
export function SiteOgCard({ name = SITE_NAME }: { name?: string }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: OG_COLORS.ink,
        fontFamily: "Space Mono",
      }}
    >
      <Mark fontSize={120} />
      <div
        style={{
          display: "flex",
          marginTop: 36,
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 4,
          color: OG_COLORS.ghostWhite,
        }}
      >
        {name.toUpperCase()}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 16,
          fontSize: 24,
          color: OG_COLORS.mutedOnDark,
        }}
      >
        Data Science &amp; Frontend Engineer
      </div>
    </div>
  );
}

/** Per-post/per-project card — title + category, used by the dynamic
 * opengraph-image routes under /blog/[slug] and /projects/[slug]. */
export function PostOgCard({
  kind,
  category,
  title,
  name = SITE_NAME,
}: {
  kind: "project" | "post";
  category?: string;
  title: string;
  name?: string;
}) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_COLORS.ink,
        padding: 72,
        fontFamily: "Space Mono",
      }}
    >
      <Mark fontSize={40} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          gap: 24,
        }}
      >
        {category ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 4,
              backgroundColor: OG_COLORS.accentBright,
              color: OG_COLORS.ink,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {category}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.25,
            maxWidth: 1000,
            color: OG_COLORS.ghostWhite,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 22, color: OG_COLORS.mutedOnDark }}>
        {kind === "project" ? "Project" : "Blog Post"} · {name}
      </div>
    </div>
  );
}
