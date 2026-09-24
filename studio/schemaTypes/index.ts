import { experience } from "./documents/experience";
import { post } from "./documents/post";
import { skill } from "./documents/skill";
import { diagram } from "./objects/diagram";
import { qualificationsPage } from "./singletons/qualificationsPage";
import { siteSettings } from "./singletons/siteSettings";

export const schemaTypes = [
  post,
  experience,
  skill,
  siteSettings,
  qualificationsPage,
  diagram,
];
