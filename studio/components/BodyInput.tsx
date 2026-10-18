import { Card, Flex, Text } from "@sanity/ui";
import { useCallback } from "react";
import { PortableTextInput, type ArrayOfObjectsInputProps, type PortableTextInputProps } from "sanity";
import type { TypedObject } from "@sanity/types";

import { looksLikeMarkdown, markdownToBody } from "../lib/markdown";
import { headingCount, readingMinutes } from "../lib/stats";

/** Words (≈ reading time × 200) and headings, measured the way the site does. */
export function BodyStats({ body }: { body?: unknown[] }) {
  const blocks = (body ?? []) as Parameters<typeof readingMinutes>[0];
  const minutes = readingMinutes(blocks);
  const headings = headingCount(blocks);
  return (
    <Card padding={2} radius={2} tone="transparent" border>
      <Flex gap={4} wrap="wrap">
        <Text size={1} muted>
          ≈ {minutes} min read
        </Text>
        <Text size={1} muted>
          {headings} {headings === 1 ? "heading" : "headings"}
        </Text>
        <Text size={1} muted>
          Paste Markdown to convert it into blocks
        </Text>
      </Flex>
    </Card>
  );
}

/** Body field: stats bar + "paste Markdown, get Portable Text". */
export function BodyInput(props: ArrayOfObjectsInputProps) {
  const onPaste = useCallback<NonNullable<PortableTextInputProps["onPaste"]>>(({ event, path }) => {
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (!text || !looksLikeMarkdown(text)) return undefined;
    const insert = markdownToBody(text);
    return insert.length ? { insert: insert as unknown as TypedObject[], path } : undefined;
  }, []);

  return (
    <>
      <BodyStats body={props.value} />
      <div style={{ marginTop: 8 }}>
        <PortableTextInput {...(props as unknown as PortableTextInputProps)} onPaste={onPaste} />
      </div>
    </>
  );
}
