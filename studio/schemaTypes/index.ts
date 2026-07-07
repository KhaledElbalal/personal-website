import { blogPost } from "./documents/blogPost";
import { experience } from "./documents/experience";
import { project } from "./documents/project";
import { skill } from "./documents/skill";
import { qualificationsPage } from "./singletons/qualificationsPage";
import { siteSettings } from "./singletons/siteSettings";

export const schemaTypes = [
  project,
  blogPost,
  experience,
  skill,
  siteSettings,
  qualificationsPage,
];
