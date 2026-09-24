import { defineQuery } from "next-sanity";

// Shared list-row fields for both `kind`s. Project-only: startDate/endDate/
// current/featured/path. Post-only: date. See studio/schemaTypes/documents/post.ts.
const postFields = /* groq */ `
  _id,
  kind,
  title,
  "slug": slug.current,
  category,
  date,
  startDate,
  endDate,
  current,
  cover,
  summary,
  featured,
  path
`;

// `kind` param: "project" | "post". order() coalesces the two date shapes so
// a single query serves both /projects and /blog list pages.
export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && kind == $kind && defined(slug.current)] | order(coalesce(date, startDate) desc) { ${postFields} }`,
);

export const FEATURED_PROJECTS_QUERY = defineQuery(
  `*[_type == "post" && kind == "project" && featured == true && defined(slug.current)] | order(startDate desc) { ${postFields} }`,
);

// Diagram blocks drop their editor `snapshot` — the page only needs the SVG.
export const POST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0] { ${postFields}, tags, series, "body": body[]{
    _type != "diagram" => @,
    _type == "diagram" => { _key, _type, alt, caption, svg, width, height }
  } }`,
);

// Sibling posts sharing a series name, ordered by part — powers the series
// nav bar + "also in this series" list on the post detail page.
export const SERIES_POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current) && series.name == $name] | order(series.part asc) {
    _id, title, "slug": slug.current, date, "part": series.part
  }`,
);

// All career/credential entries, newest first. Each view is a filter on `type`:
// the git-log Timeline = job|internship|degree|achievement; the Education card
// = degree; Honors & Awards = award|achievement; Certificates = certificate.
export const EXPERIENCE_QUERY = defineQuery(
  `*[_type == "experience"] | order(startDate desc, order asc) {
    _id, type, title, organization, detail, startDate, endDate, current,
    location, tags, metric, logo, featured, order
  }`,
);

// Page-level content (hero intro, CV download URL, headline stats).
export const QUALIFICATIONS_PAGE_QUERY = defineQuery(
  `*[_type == "qualificationsPage"][0] {
    intro,
    "cvUrl": cv.asset->url,
    stats
  }`,
);

export const SKILLS_QUERY = defineQuery(
  `*[_type == "skill"] | order(order asc) { _id, role, description, items, path }`,
);

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings"][0] { siteName, heroHeading, heroIntro, socialLinks, footerText }`,
);
