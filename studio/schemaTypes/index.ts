import { blogPost } from "./documents/blogPost";
import { project } from "./documents/project";
import { qualification } from "./documents/qualification";
import { skill } from "./documents/skill";
import { qualificationsPage } from "./singletons/qualificationsPage";
import { siteSettings } from "./singletons/siteSettings";

export const schemaTypes = [
  project,
  blogPost,
  qualification,
  skill,
  siteSettings,
  qualificationsPage,
];
