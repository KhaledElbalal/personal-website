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

export const TIMELINE_QUERY = defineQuery(
  `*[_type == "timelineEntry"] | order(order asc) { _id, hash, text, ref, date, detail }`,
);

export const SKILLS_QUERY = defineQuery(
  `*[_type == "skill"] | order(order asc) { _id, role, description, items, path }`,
);

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings"][0] { heroHeading, heroIntro, socialLinks, footerText }`,
);
