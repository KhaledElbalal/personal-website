import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  type Editor,
  Tldraw,
  getSnapshot,
  loadSnapshot,
} from "tldraw";
import "tldraw/tldraw.css";

import { type DiagramExport, exportDiagram } from "./exportSvg";
import { applyFlow, FLOWS, type FlowKind, SiteArrowShapeUtil } from "./flows";
import { BehavesAs, FlowsPanel } from "./FlowsPanel";
import { GroupShapeUtil } from "./GroupShape";
import { GROUP_PRESETS, type GroupPreset } from "./groups";
import { type IconItem, type IconPackId, loadPack } from "./icons/catalog";
import { adoptShapesInside, createGroup, createNode, loadSiteFonts, NODE_H, NODE_W, resolveItems, safeReparent } from "./insert";
import { NODE_TYPE, NodeShapeUtil } from "./NodeShape";
import { insertTemplate, TEMPLATES, type Template } from "./templates";
import { ACCENT, FONT, INK, SITE_THEME } from "./theme";

const SHAPE_UTILS = [NodeShapeUtil, GroupShapeUtil, SiteArrowShapeUtil];
const THEMES = { default: SITE_THEME };
const DRAG_MIME = "application/x-sd-item";
const MAX_RESULTS = 180;

type TabId = IconPackId | "groups" | "templates" | "flows";
const TABS: { id: TabId; label: string }[] = [
  { id: "system", label: "System" },
  { id: "brands", label: "Tech" },
  { id: "aws", label: "AWS" },
  { id: "groups", label: "Groups" },
  { id: "templates", label: "Templates" },
  { id: "flows", label: "Flows" },
];

/**
 * Break any parent cycle in a saved document (a shape that is its own
 * ancestor crashes tldraw) by moving the looping shape to the page.
 */
function repairParentCycles<T extends { store: Record<string, { typeName?: string; parentId?: string }> }>(doc: T): T {
  const shapes = Object.values(doc.store).filter((r) => r.typeName === "shape") as {
    id?: string;
    parentId?: string;
  }[];
  const byId = new Map(shapes.map((s) => [s.id, s]));
  const page = Object.values(doc.store).find((r) => r.typeName === "page") as { id?: string } | undefined;
  for (const shape of shapes) {
    const seen = new Set<string | undefined>();
    let cur: typeof shape | undefined = shape;
    while (cur?.parentId?.startsWith("shape:")) {
      if (seen.has(cur.id)) {
        console.warn("Diagram: repaired parent cycle at", cur.id);
        cur.parentId = page?.id;
        break;
      }
      seen.add(cur.id);
      cur = byId.get(cur.parentId);
    }
  }
  return doc;
}

type Props = {
  snapshot?: string;
  onSave: (snapshot: string, exported: DiagramExport | null) => Promise<void> | void;
  onClose: () => void;
};

export function DiagramEditor({ snapshot, onSave, onClose }: Props) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleMount = useCallback(
    (ed: Editor) => {
      if (snapshot) {
        try {
          loadSnapshot(ed.store, { document: repairParentCycles(JSON.parse(snapshot)) });
        } catch (err) {
          console.error("Could not load diagram snapshot", err);
        }
      }
      ed.updateInstanceState({ isGridMode: true });
      ed.setStyleForNextShapes(DefaultDashStyle, "solid");
      ed.setStyleForNextShapes(DefaultFontStyle, "mono");
      ed.setStyleForNextShapes(DefaultSizeStyle, "s");
      ed.setStyleForNextShapes(DefaultColorStyle, "black");
      if (snapshot) ed.zoomToFit({ animation: { duration: 0 } });
      void loadSiteFonts(ed);
      setEditor(ed);
      if (import.meta.env.DEV) (window as unknown as { __sdEditor: Editor }).__sdEditor = ed;
      return ed.store.listen(() => setDirty(true), { scope: "document", source: "user" });
    },
    [snapshot],
  );

  const save = useCallback(async () => {
    if (!editor || saving) return;
    setSaving(true);
    try {
      editor.complete();
      const doc = JSON.stringify(getSnapshot(editor.store).document);
      await onSave(doc, await exportDiagram(editor));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [editor, onSave, saving]);

  const close = useCallback(() => {
    if (dirty && !window.confirm("Discard unsaved diagram changes?")) return;
    onClose();
  }, [dirty, onClose]);

  // ⌘S / Ctrl+S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [save]);

  /** Page point for a drop (screen coords) or the viewport centre. */
  const pointFor = useCallback(
    (screen?: { x: number; y: number }) =>
      editor
        ? screen
          ? editor.screenToPage(screen)
          : editor.getViewportPageBounds().center
        : { x: 0, y: 0 },
    [editor],
  );

  const addIcon = useCallback(
    (item: IconItem, screen?: { x: number; y: number }) => {
      if (!editor) return;
      const c = pointFor(screen);
      const id = createNode(editor, item, { x: c.x - NODE_W / 2, y: c.y - NODE_H / 2 });
      // Dropped inside a group? Nest it so it moves with the group.
      const target = editor.getShapeAtPoint(c, {
        hitInside: true,
        filter: (s) => s.id !== id && editor.getShapeUtil(s).canReceiveNewChildrenOfType(s, NODE_TYPE),
      });
      if (target) safeReparent(editor, [id], target.id);
      editor.select(id);
    },
    [editor, pointFor],
  );

  const addGroup = useCallback(
    async (preset: GroupPreset, iconItem: IconItem | undefined, screen?: { x: number; y: number }) => {
      if (!editor) return;
      const c = pointFor(screen);
      // Picked before the palette finished loading icons? Resolve it now.
      const icon =
        iconItem ?? (preset.icon ? (await resolveItems([preset.icon])).get(preset.icon) : undefined);
      const id = createGroup(editor, preset, icon, { x: c.x - preset.w / 2, y: c.y - preset.h / 2 });
      adoptShapesInside(editor, id);
      editor.select(id);
    },
    [editor, pointFor],
  );

  const addTemplate = useCallback(
    (tpl: Template) => {
      if (editor) void insertTemplate(editor, tpl);
    },
    [editor],
  );

  // Drag payloads resolve through these (set by the palette as it loads).
  const itemsRef = useRef(new Map<string, IconItem>());
  const groupIconsRef = useRef(new Map<string, IconItem>());

  return (
    <div style={styles.root}>
      {/* tldraw's HTML text reads these vars rather than the theme fonts. */}
      <style>{`.tl-container{--tl-font-mono:'${FONT.mono}',monospace;--tl-font-sans:'${FONT.sans}',sans-serif;--tl-font-serif:'${FONT.body}',sans-serif;--tl-font-draw:'${FONT.body}',sans-serif}`}</style>
      <header style={styles.bar}>
        <strong style={{ fontFamily: `'${FONT.mono}', monospace`, color: INK }}>
          <span style={{ color: ACCENT }}>##</span> Diagram
        </strong>
        <FlowPresets editor={editor} />
        <BehavesAs editor={editor} />
        <span style={styles.hint}>Double-click a card, group or arrow to label it · ⌘S to save</span>
        <span style={{ flex: 1 }} />
        <button type="button" style={styles.ghost} onClick={close}>
          Close
        </button>
        <button type="button" style={styles.primary} onClick={save} disabled={!editor || saving}>
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
      </header>
      <div style={styles.body}>
        <Palette
          editor={editor}
          onPickIcon={(item) => addIcon(item)}
          onPickGroup={(preset, icon) => void addGroup(preset, icon)}
          onPickTemplate={addTemplate}
          itemsRef={itemsRef}
          groupIconsRef={groupIconsRef}
        />
        <div
          style={styles.canvas}
          onDragOverCapture={(e) => {
            if (e.dataTransfer.types.includes(DRAG_MIME)) {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }
          }}
          onDropCapture={(e) => {
            const payload = e.dataTransfer.getData(DRAG_MIME);
            if (!payload) return;
            e.preventDefault();
            e.stopPropagation();
            const at = { x: e.clientX, y: e.clientY };
            const sep = payload.indexOf("|");
            const kind = payload.slice(0, sep);
            const id = payload.slice(sep + 1);
            if (kind === "icon") {
              const item = itemsRef.current.get(id);
              if (item) addIcon(item, at);
            } else if (kind === "group") {
              const preset = GROUP_PRESETS.find((p) => p.id === id);
              if (preset) void addGroup(preset, preset.icon ? groupIconsRef.current.get(preset.icon) : undefined, at);
            }
          }}
        >
          <Tldraw
            licenseKey={process.env.SANITY_STUDIO_TLDRAW_LICENSE_KEY}
            shapeUtils={SHAPE_UTILS}
            themes={THEMES}
            colorScheme="light"
            onMount={handleMount}
          />
        </div>
      </div>
    </div>
  );
}

// ── Connector presets ──

function FlowSwatch({ kind }: { kind: FlowKind }) {
  const color = kind === "request" ? ACCENT : kind === "async" ? INK : "#8a8f98";
  const dash = kind === "async" ? "5 4" : kind === "response" ? "1.5 3.5" : undefined;
  return (
    <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
      <line x1="1" y1="5" x2="20" y2="5" stroke={color} strokeWidth="1.8" strokeDasharray={dash} strokeLinecap="round" />
      <path d="M19 1.5 L25 5 L19 8.5" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function FlowPresets({ editor }: { editor: Editor | null }) {
  return (
    <div role="group" aria-label="Connector presets" style={styles.flows}>
      {(Object.keys(FLOWS) as FlowKind[]).map((kind) => (
        <button
          key={kind}
          type="button"
          title={`${FLOWS[kind].hint} — restyles selected arrows, or draws a new one`}
          style={styles.flowBtn}
          disabled={!editor}
          onClick={() => editor && applyFlow(editor, kind)}
        >
          <FlowSwatch kind={kind} />
          {FLOWS[kind].label}
        </button>
      ))}
    </div>
  );
}

// ── Palette ──

function Palette({
  editor,
  onPickIcon,
  onPickGroup,
  onPickTemplate,
  itemsRef,
  groupIconsRef,
}: {
  editor: Editor | null;
  onPickIcon: (item: IconItem) => void;
  onPickGroup: (preset: GroupPreset, icon: IconItem | undefined) => void;
  onPickTemplate: (tpl: Template) => void;
  itemsRef: React.RefObject<Map<string, IconItem>>;
  groupIconsRef: React.RefObject<Map<string, IconItem>>;
}) {
  const [tab, setTab] = useState<TabId>("system");
  const isIconTab = tab === "system" || tab === "brands" || tab === "aws";

  return (
    <aside style={styles.palette}>
      <style>{"[data-sd-tile] svg{width:100%;height:100%;display:block}"}</style>
      <div role="tablist" style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            style={tab === t.id ? styles.tabActive : styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {isIconTab ? <IconGrid key={tab} pack={tab} onPick={onPickIcon} itemsRef={itemsRef} /> : null}
      {tab === "groups" ? <GroupGrid onPick={onPickGroup} iconsRef={groupIconsRef} /> : null}
      {tab === "templates" ? <TemplateList onPick={onPickTemplate} /> : null}
      {tab === "flows" ? <FlowsPanel editor={editor} /> : null}
    </aside>
  );
}

function IconTile({ item, onPick }: { item: IconItem; onPick: (item: IconItem) => void }) {
  return (
    <button
      type="button"
      title={item.label}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_MIME, `icon|${item.id}`);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onPick(item)}
      style={styles.tile}
    >
      <span
        aria-hidden="true"
        data-sd-tile=""
        style={{ ...styles.tileIcon, color: item.color }}
        dangerouslySetInnerHTML={{ __html: item.raw }}
      />
      <span style={styles.tileLabel}>{item.name}</span>
    </button>
  );
}

function IconGrid({
  pack,
  onPick,
  itemsRef,
}: {
  pack: IconPackId;
  onPick: (item: IconItem) => void;
  itemsRef: React.RefObject<Map<string, IconItem>>;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<IconItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    loadPack(pack)
      .then((list) => {
        if (!live) return;
        for (const item of list) itemsRef.current.set(item.id, item);
        setItems(list);
      })
      .catch((err: unknown) => live && setError(String(err)));
    return () => {
      live = false;
    };
  }, [pack, itemsRef]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!items) return [];
    if (!q) return items.slice(0, MAX_RESULTS);
    // Rank: exact name, name prefix, name contains, then keyword matches.
    const rank = (i: IconItem) => {
      const name = i.name.toLowerCase();
      if (name === q) return 0;
      if (name.startsWith(q)) return 1;
      if (name.includes(q)) return 2;
      return `${i.label} ${i.keywords}`.toLowerCase().includes(q) ? 3 : -1;
    };
    return items
      .map((i) => [rank(i), i] as const)
      .filter(([r]) => r >= 0)
      .sort((a, b) => a[0] - b[0])
      .slice(0, MAX_RESULTS)
      .map(([, i]) => i);
  }, [items, q]);

  const favorites = q ? [] : filtered.filter((i) => i.favorite);
  const rest = q ? filtered : filtered.filter((i) => !i.favorite);

  return (
    <>
      <input
        type="search"
        placeholder={pack === "aws" ? "Search AWS (e.g. S3, Lambda)" : "Search icons"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.search}
      />
      <div style={styles.grid}>
        {error ? <p style={styles.note}>Failed to load icons: {error}</p> : null}
        {!items && !error ? <p style={styles.note}>Loading…</p> : null}
        {favorites.length ? <p style={styles.section}>Favorites</p> : null}
        {favorites.map((item) => (
          <IconTile key={item.id} item={item} onPick={onPick} />
        ))}
        {favorites.length && rest.length ? <p style={styles.section}>All</p> : null}
        {rest.map((item) => (
          <IconTile key={item.id} item={item} onPick={onPick} />
        ))}
        {items && filtered.length === MAX_RESULTS ? (
          <p style={styles.note}>Showing first {MAX_RESULTS} — refine your search.</p>
        ) : null}
      </div>
    </>
  );
}

function GroupGrid({
  onPick,
  iconsRef,
}: {
  onPick: (preset: GroupPreset, icon: IconItem | undefined) => void;
  iconsRef: React.RefObject<Map<string, IconItem>>;
}) {
  const [icons, setIcons] = useState<Map<string, IconItem> | null>(null);

  useEffect(() => {
    let live = true;
    const ids = GROUP_PRESETS.map((p) => p.icon).filter((id): id is string => Boolean(id));
    void resolveItems(ids).then((map) => {
      if (!live) return;
      for (const [id, item] of map) iconsRef.current.set(id, item);
      setIcons(map);
    });
    return () => {
      live = false;
    };
  }, [iconsRef]);

  return (
    <div style={{ ...styles.grid, gridTemplateColumns: "1fr 1fr", paddingTop: 10 }}>
      <p style={styles.note}>Drop a group over cards to wrap them — they move with it.</p>
      {GROUP_PRESETS.map((preset) => {
        const icon = preset.icon ? icons?.get(preset.icon) : undefined;
        return (
          <button
            key={preset.id}
            type="button"
            title={preset.label}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_MIME, `group|${preset.id}`);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onPick(preset, icon)}
            style={{
              ...styles.groupTile,
              borderColor: preset.stroke,
              borderStyle: preset.dashed ? "dashed" : "solid",
              background: preset.fill === "transparent" ? "#fff" : preset.fill,
            }}
          >
            {icon ? (
              <span
                aria-hidden="true"
                data-sd-tile=""
                style={{ width: 18, height: 18, flex: "none", color: preset.iconColor ?? icon.color }}
                dangerouslySetInnerHTML={{ __html: icon.raw }}
              />
            ) : null}
            <span style={{ ...styles.tileLabel, color: preset.stroke, fontWeight: 700, textAlign: "left" }}>
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TemplateList({ onPick }: { onPick: (tpl: Template) => void }) {
  return (
    <div style={{ ...styles.grid, gridTemplateColumns: "1fr", paddingTop: 10 }}>
      {TEMPLATES.map((tpl) => (
        <button key={tpl.id} type="button" onClick={() => onPick(tpl)} style={styles.templateCard}>
          <strong style={{ fontFamily: `'${FONT.mono}', monospace`, fontSize: 13, color: INK }}>
            {tpl.title}
          </strong>
          <span style={{ fontSize: 11.5, lineHeight: 1.4, color: "rgba(18,20,32,0.65)" }}>
            {tpl.description}
          </span>
        </button>
      ))}
    </div>
  );
}

const styles = {
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 100000,
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "10px 16px",
    borderBottom: `1.5px solid ${INK}`,
    fontSize: 14,
  },
  hint: { color: "rgba(18,20,32,0.65)", fontSize: 12 },
  flows: { display: "flex", gap: 6 },
  flowBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: `1.5px solid ${INK}`,
    background: "#fff",
    color: INK,
    borderRadius: 4,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  ghost: {
    border: `1.5px solid ${INK}`,
    background: "#fff",
    color: INK,
    borderRadius: 4,
    padding: "6px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  primary: {
    border: `1.5px solid ${INK}`,
    background: ACCENT,
    color: "#f7f7ff",
    borderRadius: 4,
    padding: "6px 16px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "-3px 3px 0 rgba(18,20,32,0.3)",
  },
  body: { flex: 1, display: "flex", minHeight: 0 },
  canvas: { flex: 1, position: "relative", minWidth: 0 },
  palette: {
    width: 300,
    display: "flex",
    flexDirection: "column",
    borderRight: `1.5px solid ${INK}`,
    background: "#f7f7f7",
    minHeight: 0,
  },
  tabs: { display: "flex", flexWrap: "wrap", gap: 4, padding: "10px 10px 0" },
  tab: {
    flex: "1 0 auto",
    border: "1.5px solid transparent",
    background: "transparent",
    borderRadius: 4,
    padding: "6px 8px",
    cursor: "pointer",
    color: INK,
    fontWeight: 600,
    fontSize: 12.5,
  },
  tabActive: {
    flex: "1 0 auto",
    border: `1.5px solid ${INK}`,
    background: "#fff",
    borderRadius: 4,
    padding: "6px 8px",
    cursor: "pointer",
    color: ACCENT,
    fontWeight: 700,
    fontSize: 12.5,
    boxShadow: "-3px 3px 0 rgba(0,103,168,0.3)",
  },
  search: {
    margin: 10,
    padding: "7px 10px",
    border: `1.5px solid ${INK}`,
    borderRadius: 4,
    fontSize: 13,
  },
  grid: {
    flex: 1,
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    alignContent: "start",
    gap: 8,
    padding: "0 10px 16px",
  },
  section: {
    gridColumn: "1 / -1",
    margin: "4px 0 0",
    fontFamily: `'${FONT.mono}', monospace`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: ACCENT,
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "10px 4px 8px",
    border: `1px solid rgba(18,20,32,0.2)`,
    borderRadius: 8,
    background: "#fff",
    cursor: "grab",
    minWidth: 0,
  },
  tileIcon: { width: 32, height: 32, display: "block" },
  tileLabel: {
    fontSize: 10.5,
    lineHeight: 1.2,
    color: INK,
    textAlign: "center",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  groupTile: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    minHeight: 46,
    padding: "6px 8px",
    borderWidth: 1.5,
    borderRadius: 2,
    cursor: "grab",
    minWidth: 0,
  },
  templateCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    textAlign: "left",
    padding: "10px 12px",
    border: `1.5px solid ${INK}`,
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    boxShadow: "-4px 4px 0 rgba(0,103,168,0.3)",
  },
  note: { gridColumn: "1 / -1", margin: 0, fontSize: 12, color: "rgba(18,20,32,0.65)" },
} satisfies Record<string, React.CSSProperties>;
