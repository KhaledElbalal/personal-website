import type { StructureResolver } from "sanity/structure";

const SINGLETONS = ["siteSettings", "qualificationsPage"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.listItem()
        .title("Qualifications Page")
        .id("qualificationsPage")
        .child(
          S.document()
            .schemaType("qualificationsPage")
            .documentId("qualificationsPage"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETONS.includes(item.getId() ?? ""),
      ),
    ]);
