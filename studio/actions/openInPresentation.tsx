import { DesktopIcon } from "@sanity/icons";
import { useRouter } from "sanity/router";
import type { DocumentActionComponent } from "sanity";

import { postPath } from "../lib/siteOrigin";

/** Opens the document in the Presentation tool (live draft preview, click-to-edit). */
export const openInPresentation: DocumentActionComponent = (props) => {
  const router = useRouter();
  const path = postPath((props.draft ?? props.published) as Parameters<typeof postPath>[0]);
  return {
    label: "Preview on site",
    icon: DesktopIcon,
    disabled: !path,
    title: path ? undefined : "Add a slug first",
    onHandle: () => {
      if (path) router.navigateUrl({ path: `/presentation?preview=${encodeURIComponent(path)}` });
      props.onComplete();
    },
  };
};
