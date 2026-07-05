import { defineQuery } from "next-sanity";


const projectFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  category,
  date,
  cover,
  summary,
  featured,
  path
`;

const postFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  category,
  date,
  cover,
  summary
`;

export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current)] | order(date desc) { ${projectFields} }`,
);

export const FEATURED_PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && featured == true && defined(slug.current)] | order(date desc) { ${projectFields} }`,
);

export const PROJECT_BY_SLUG_QUERY = defineQuery(
  `*[_type == "project" && slug.current == $slug][0] { ${projectFields}, body }`,
);

export const BLOG_POSTS_QUERY = defineQuery(
  `*[_type == "blogPost" && defined(slug.current)] | order(date desc) { ${postFields} }`,
);

export const POST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "blogPost" && slug.current == $slug][0] { ${postFields}, body }`,
);

// All qualifications, grouped and ordered so the page can render each section
// (education / experience / certificate / award) by filtering on `kind`.
export const QUALIFICATIONS_QUERY = defineQuery(
  `*[_type == "qualification"] | order(kind asc, order asc) {
    _id, kind, title, subtitle, location, startDate, endDate, current,
    bullets, tags, logo, metric, featured, order
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
  `*[_type == "siteSettings"][0] { heroHeading, heroIntro, socialLinks, footerText }`,
);
