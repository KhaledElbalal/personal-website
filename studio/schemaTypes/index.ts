import { blogPost } from "./documents/blogPost";
import { project } from "./documents/project";
import { skill } from "./documents/skill";
import { timelineEntry } from "./documents/timelineEntry";
import { siteSettings } from "./singletons/siteSettings";

export const schemaTypes = [
  project,
  blogPost,
  timelineEntry,
  skill,
  siteSettings,
];
