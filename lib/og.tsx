import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

// Same palette as the site: a navy field, ghost-white type, one bright blue.
const OG_COLORS = {
  field: "#121420",
  ink: "#f7f7ff",
  accentBright: "#38b6ff",
  muted: "rgba(247,247,255,0.7)",
};

const PAD = 72;

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

/** Poppins carries every line of text, as on the site; Space Mono is only for
 * the [K▮] mark, which is how the logo is drawn. */
export async function loadOgFonts() {
  const [mono, bold, medium] = await Promise.all([
    loadGoogleFont("Space+Mono", 700),
    loadGoogleFont("Poppins", 700),
    loadGoogleFont("Poppins", 500),
  ]);
  return [
    { name: "Space Mono", data: mono, weight: 700 as const, style: "normal" as const },
    { name: "Poppins", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Poppins", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

/** The [K▮] mark, sized for reuse across the site-wide OG image and the
 * smaller per-post cards. */
function Mark({ fontSize }: { fontSize: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontFamily: "Space Mono",
        fontWeight: 700,
        fontSize,
        color: OG_COLORS.ink,
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

/** Site-wide default OG/Twitter card — Home and any page without its own.
 * Mirrors the home page: the name set huge on the navy field. */
export function SiteOgCard({
  name = SITE_NAME,
  url,
}: {
  name?: string;
  url?: string;
}) {
  const label = name.toUpperCase();
  // Poppins bold caps average ~0.6em wide with this tracking; fit the name to the card.
  const fontSize = Math.min(200, Math.floor((OG_SIZE.width - 2 * PAD) / (label.length * 0.62)));
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: OG_COLORS.field,
        padding: PAD,
        fontFamily: "Poppins",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Mark fontSize={56} />
        {url ? (
          <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: OG_COLORS.muted }}>
            {url.replace(/^https?:\/\//, "")}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 500,
            color: OG_COLORS.accentBright,
          }}
        >
          Software Engineer
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -fontSize * 0.03,
            color: OG_COLORS.ink,
          }}
        >
          {label}
        </div>
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
  // Long titles drop a size so they stay within four lines.
  const fontSize = title.length > 80 ? 52 : title.length > 48 ? 62 : 72;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: OG_COLORS.field,
        padding: PAD,
        fontFamily: "Poppins",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Mark fontSize={44} />
        {category ? (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 500,
              color: OG_COLORS.accentBright,
            }}
          >
            {category}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          fontSize,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -fontSize * 0.03,
          color: OG_COLORS.ink,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: OG_COLORS.muted }}>
        {kind === "project" ? "Project" : "Blog post"} · {name}
      </div>
    </div>
  );
}
