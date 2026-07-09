import { defineQuery } from "next-sanity";


const projectFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  category,
  startDate,
  endDate,
  current,
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
  `*[_type == "project" && defined(slug.current)] | order(startDate desc) { ${projectFields} }`,
);

export const FEATURED_PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && featured == true && defined(slug.current)] | order(startDate desc) { ${projectFields} }`,
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
  `*[_type == "siteSettings"][0] { heroHeading, heroIntro, socialLinks, footerText }`,
);
