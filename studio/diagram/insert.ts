// Helpers for putting nodes, groups and connectors on the canvas — shared by
// the palette (drag/click) and the starter templates.
import {
  type Editor,
  type TLArrowBinding,
  type TLShapeId,
  createShapeId,
  toRichText,
} from "tldraw";

import { FLOWS, type FlowKind } from "./flows";
import { GROUP_TYPE } from "./GroupShape";
import type { GroupPreset } from "./groups";
import { type IconItem, type IconPackId, loadPack, toNodeIcon } from "./icons/catalog";
import { NODE_TYPE } from "./NodeShape";
import { SITE_FONT_FACES } from "./theme";

export const NODE_W = 150;
export const NODE_H = 110;

/** Load the site fonts so tldraw measures labels with real metrics. */
export function loadSiteFonts(editor: Editor) {
  return Promise.all(SITE_FONT_FACES.map((f) => editor.fonts.ensureFontIsLoaded(f)));
}

/** Resolve catalog ids ("aws:…", "system:…", "brands:…") across the packs they need. */
export async function resolveItems(ids: string[]) {
  const packs = [...new Set(ids.map((id) => id.split(":")[0] as IconPackId))];
  const lists = await Promise.all(packs.map(loadPack));
  const byId = new Map<string, IconItem>();
  for (const item of lists.flat()) byId.set(item.id, item);
  return byId;
}

/** Create a node card with its top-left at `at` (page coords). */
export function createNode(
  editor: Editor,
  item: IconItem | undefined,
  at: { x: number; y: number },
  text: { label?: string; sublabel?: string } = {},
) {
  const id = createShapeId();
  const icon = item ? toNodeIcon(item) : null;
  editor.createShape({
    id,
    type: NODE_TYPE,
    x: at.x,
    y: at.y,
    // Remembered for role detection (queue / fan-out) in ./behavior.
    meta: item ? { iconId: item.id } : {},
    props: {
      w: NODE_W,
      label: text.label ?? item?.name ?? "Node",
      sublabel: text.sublabel ?? "",
      iconBody: icon?.body ?? "",
      iconViewBox: icon?.viewBox ?? "0 0 24 24",
      iconColor: icon?.color ?? "#121420",
    },
  });
  return id;
}

/** Create a boundary frame with its top-left at `at`, behind everything else. */
export function createGroup(
  editor: Editor,
  preset: GroupPreset,
  iconItem: IconItem | undefined,
  at: { x: number; y: number },
  opts: { w?: number; h?: number; label?: string } = {},
) {
  const id = createShapeId();
  const icon = iconItem ? toNodeIcon(iconItem) : null;
  editor.createShape({
    id,
    type: GROUP_TYPE,
    x: at.x,
    y: at.y,
    props: {
      w: opts.w ?? preset.w,
      h: opts.h ?? preset.h,
      label: opts.label ?? preset.label,
      stroke: preset.stroke,
      fill: preset.fill,
      dashed: preset.dashed,
      iconBody: icon?.body ?? "",
      iconViewBox: icon?.viewBox ?? "0 0 24 24",
      iconColor: preset.iconColor ?? icon?.color ?? preset.stroke,
    },
  });
  editor.sendToBack([id]);
  return id;
}

/**
 * Reparent without ever creating a cycle: drops any shape that is the target
 * itself or one of the target's ancestors (reparenting those would make a
 * shape its own ancestor and crash tldraw's tree walks).
 */
export function safeReparent(editor: Editor, ids: TLShapeId[], parentId: TLShapeId) {
  const ok = ids.filter((id) => id !== parentId && !editor.hasAncestor(parentId, id));
  if (ok.length) editor.reparentShapes(ok, parentId);
}

/**
 * Wrap siblings that sit fully inside a newly placed group. tldraw may have
 * already nested the group inside a container under it, so only shapes that
 * share the group's parent are candidates — never the container itself.
 */
export function adoptShapesInside(editor: Editor, groupId: TLShapeId) {
  const group = editor.getShape(groupId);
  const outer = editor.getShapePageBounds(groupId);
  if (!group || !outer) return;
  const inside = editor
    .getSortedChildIdsForParent(group.parentId)
    .filter((id) => {
      if (id === groupId || editor.getShape(id)?.type === "arrow") return false;
      const b = editor.getShapePageBounds(id);
      return Boolean(b && b.minX >= outer.minX && b.minY >= outer.minY && b.maxX <= outer.maxX && b.maxY <= outer.maxY);
    });
  safeReparent(editor, inside, groupId);
}

/** Arrow bound to both shapes, styled as a connector preset. */
export function connect(
  editor: Editor,
  from: TLShapeId,
  to: TLShapeId,
  kind: FlowKind,
  label?: string,
) {
  const a = editor.getShapePageBounds(from)!.center;
  const b = editor.getShapePageBounds(to)!.center;
  const id = createShapeId();
  const { color, dash } = FLOWS[kind];
  editor.createShape({
    id,
    type: "arrow",
    x: a.x,
    y: a.y,
    props: {
      start: { x: 0, y: 0 },
      end: { x: b.x - a.x, y: b.y - a.y },
      color,
      dash,
      size: "s",
      font: "mono",
      ...(label ? { richText: toRichText(label) } : {}),
    },
  });
  const binding = (toId: TLShapeId, terminal: "start" | "end") => ({
    type: "arrow" as const,
    fromId: id,
    toId,
    props: {
      terminal,
      normalizedAnchor: { x: 0.5, y: 0.5 },
      isExact: false,
      isPrecise: false,
      snap: "none" as const,
    },
  });
  editor.createBindings<TLArrowBinding>([binding(from, "start"), binding(to, "end")]);
  return id;
}
