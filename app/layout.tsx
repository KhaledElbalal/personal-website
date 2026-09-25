import type { Metadata } from "next";
import { Space_Mono, Poppins, Inter, Urbanist } from "next/font/google";
import "./globals.css";

import { IntroSplash } from "@/components/layout/IntroSplash";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeaderContainer } from "@/components/layout/SiteHeaderContainer";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE_SUFFIX,
  SITE_URL,
} from "@/lib/site";
import { sanityFetch } from "@/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const urbanist = Urbanist({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SITE_SETTINGS_QUERY_RESULT>(
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
  );
  const name = settings?.siteName || SITE_NAME;
  // Deliberately not settings.heroIntro: that's longer on-page hero copy,
  // and reusing it here made <meta description>/og:description/twitter:description
  // run well past the ~125–160 char range search engines and social crawlers
  // show before truncating.
  const description = SITE_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} — ${SITE_TITLE_SUFFIX}`,
      template: `%s — ${name}`,
    },
    description,
    keywords: [
      name,
      "Software Engineer",
      "Data Science",
      "Frontend Developer",
      "Machine Learning",
      "Next.js Portfolio",
      "Competitive Programming",
    ],
    authors: [{ name, url: SITE_URL }],
    creator: name,
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      siteName: name,
      title: name,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${poppins.variable} ${inter.variable} ${urbanist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IntroSplash />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeaderContainer />
        <main id="main-content" className="flex flex-1 flex-col">
          <RouteTransition>{children}</RouteTransition>
        </main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
