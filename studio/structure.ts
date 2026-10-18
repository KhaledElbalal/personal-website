import { BookIcon, EditIcon, RocketIcon } from "@sanity/icons";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

const SINGLETONS = ["siteSettings", "qualificationsPage"];
const ORDER = "order(coalesce(date, startDate) desc)";

// Posts and projects share the `post` type, split by `kind`. Legacy docs
// without a kind are treated as blog posts.
const postList = (S: StructureBuilder, id: string, title: string, kind: "post" | "project", icon: typeof BookIcon) =>
  S.listItem()
    .id(id)
    .title(title)
    .icon(icon)
    .child(
      S.documentList()
        .id(id)
        .title(title)
        .schemaType("post")
        .filter(`_type == "post" && (kind == $kind || (!defined(kind) && $kind == "post"))`)
        .params({ kind })
        .apiVersion("2024-10-01")
        .defaultOrdering([
          { field: "startDate", direction: "desc" },
          { field: "date", direction: "desc" },
        ])
        .initialValueTemplates([S.initialValueTemplateItem(kind === "post" ? "post-blog" : "post-project")]),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      postList(S, "blogPosts", "Blog posts", "post", BookIcon),
      postList(S, "projects", "Projects", "project", RocketIcon),
      S.listItem()
        .id("postDrafts")
        .title("Drafts (unpublished changes)")
        .icon(EditIcon)
        .child(
          S.documentList()
            .id("postDrafts")
            .title("Drafts")
            .schemaType("post")
            .filter(`_type == "post" && _id in path("drafts.**")`)
            .apiVersion("2024-10-01")
            .defaultOrdering([{ field: "_updatedAt", direction: "desc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Qualifications Page")
        .id("qualificationsPage")
        .child(S.document().schemaType("qualificationsPage").documentId("qualificationsPage")),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? "";
        return id !== "post" && !SINGLETONS.includes(id);
      }),
    ]);

