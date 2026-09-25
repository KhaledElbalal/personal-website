import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { lazy, Suspense, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { type ObjectInputProps, set, setIfMissing, unset } from "sanity";

import type { DiagramExport } from "./exportSvg";

// tldraw is heavy — only load it when the editor is opened.
const DiagramEditor = lazy(() =>
  import("./DiagramEditor").then((m) => ({ default: m.DiagramEditor })),
);

type DiagramValue = {
  _type: "diagram";
  pages?: string;
  snapshot?: string;
  svg?: string;
  width?: number;
  height?: number;
};

function pageCount(json: string) {
  try {
    return (JSON.parse(json) as unknown[]).length;
  } catch {
    return 0;
  }
}

export function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function DiagramInput(props: ObjectInputProps) {
  const { onChange, readOnly } = props;
  const value = props.value as DiagramValue | undefined;
  const [open, setOpen] = useState(false);

  const handleSave = useCallback(
    (snapshot: string, exported: DiagramExport | null) => {
      onChange([
        setIfMissing({ _type: "diagram" }),
        set(snapshot, ["snapshot"]),
        ...(exported
          ? [
              set(exported.svg, ["svg"]),
              set(exported.width, ["width"]),
              set(exported.height, ["height"]),
              exported.flows.length ? set(JSON.stringify(exported.flows), ["flows"]) : unset(["flows"]),
              exported.pages.length > 1
                ? set(JSON.stringify(exported.pages), ["pages"])
                : unset(["pages"]),
            ]
          : [unset(["svg"]), unset(["width"]), unset(["height"]), unset(["flows"]), unset(["pages"])]),
      ]);
    },
    [onChange],
  );

  return (
    <Stack space={4}>
      <Card border radius={2} padding={3} tone="transparent">
        <Stack space={3}>
          {value?.pages ? (
            <Text muted size={1}>
              {pageCount(value.pages)} pages — the blog shows tabs to switch between them. Preview shows the first.
            </Text>
          ) : null}
          {value?.svg ? (
            <Box style={{ background: "#fff", borderRadius: 4, padding: 8 }}>
              <img
                src={svgDataUrl(value.svg)}
                alt=""
                style={{ display: "block", width: "100%", maxHeight: 360, objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Text muted size={1}>
              No diagram yet.
            </Text>
          )}
          <Flex gap={2}>
            <Button
              text={value?.snapshot ? "Edit diagram" : "Open diagram editor"}
              tone="primary"
              disabled={readOnly}
              onClick={() => setOpen(true)}
            />
          </Flex>
        </Stack>
      </Card>

      {props.renderDefault(props)}

      {open
        ? createPortal(
            <Suspense fallback={null}>
              <DiagramEditor
                snapshot={value?.snapshot}
                onSave={handleSave}
                onClose={() => setOpen(false)}
              />
            </Suspense>,
            document.body,
          )
        : null}
    </Stack>
  );
}
