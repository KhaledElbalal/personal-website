import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  type Editor,
  Tldraw,
  createShapeId,
  getSnapshot,
  loadSnapshot,
} from "tldraw";
import "tldraw/tldraw.css";

import { type DiagramExport, exportDiagram } from "./exportSvg";
import { type IconItem, type IconPackId, loadPack, toNodeIcon } from "./icons/catalog";
import { NODE_TYPE, NodeShapeUtil } from "./NodeShape";
import { ACCENT, FONT, INK, SITE_THEME } from "./theme";

const SHAPE_UTILS = [NodeShapeUtil];
const THEMES = { default: SITE_THEME };
const DRAG_MIME = "application/x-sd-icon";
const MAX_RESULTS = 180;

const PACKS: { id: IconPackId; label: string }[] = [
  { id: "system", label: "System" },
  { id: "brands", label: "Tech" },
  { id: "aws", label: "AWS" },
];

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
          loadSnapshot(ed.store, { document: JSON.parse(snapshot) });
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
      setEditor(ed);
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

  const addIcon = useCallback(
    (item: IconItem, screenPoint?: { x: number; y: number }) => {
      if (!editor) return;
      const icon = toNodeIcon(item);
      const w = 150;
      const center = screenPoint
        ? editor.screenToPage(screenPoint)
        : editor.getViewportPageBounds().center;
      const id = createShapeId();
      editor.createShape({
        id,
        type: NODE_TYPE,
        x: center.x - w / 2,
        y: center.y - 55,
        props: {
          w,
          label: item.name,
          iconBody: icon.body,
          iconViewBox: icon.viewBox,
          iconColor: icon.color,
        },
      });
      editor.select(id);
    },
    [editor],
  );

  const itemsRef = useRef(new Map<string, IconItem>());

  return (
    <div style={styles.root}>
      {/* tldraw's HTML text reads these vars rather than the theme fonts. */}
      <style>{`.tl-container{--tl-font-mono:'${FONT.mono}',monospace;--tl-font-sans:'${FONT.sans}',sans-serif;--tl-font-serif:'${FONT.body}',sans-serif;--tl-font-draw:'${FONT.body}',sans-serif}`}</style>
      <header style={styles.bar}>
        <strong style={{ fontFamily: `'${FONT.mono}', monospace`, color: INK }}>
          <span style={{ color: ACCENT }}>##</span> Diagram
        </strong>
        <span style={styles.hint}>
          Drag icons in · double-click a card to edit its label · ⌘S to save
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" style={styles.ghost} onClick={close}>
          Close
        </button>
        <button type="button" style={styles.primary} onClick={save} disabled={!editor || saving}>
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
      </header>
      <div style={styles.body}>
        <IconPalette onPick={(item) => addIcon(item)} itemsRef={itemsRef} />
        <div
          style={styles.canvas}
          onDragOverCapture={(e) => {
            if (e.dataTransfer.types.includes(DRAG_MIME)) {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }
          }}
          onDropCapture={(e) => {
            const id = e.dataTransfer.getData(DRAG_MIME);
            if (!id) return;
            e.preventDefault();
            e.stopPropagation();
            const item = itemsRef.current.get(id);
            if (item) addIcon(item, { x: e.clientX, y: e.clientY });
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

function IconPalette({
  onPick,
  itemsRef,
}: {
  onPick: (item: IconItem) => void;
  itemsRef: React.RefObject<Map<string, IconItem>>;
}) {
  const [pack, setPack] = useState<IconPackId>("system");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<IconItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setItems(null);
    setError(null);
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

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
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
  }, [items, query]);

  return (
    <aside style={styles.palette}>
      <style>{"[data-sd-tile] svg{width:100%;height:100%;display:block}"}</style>
      <div role="tablist" style={styles.tabs}>
        {PACKS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pack === p.id}
            style={pack === p.id ? styles.tabActive : styles.tab}
            onClick={() => setPack(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
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
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_MIME, item.id);
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
        ))}
        {items && filtered.length === MAX_RESULTS ? (
          <p style={styles.note}>Showing first {MAX_RESULTS} — refine your search.</p>
        ) : null}
      </div>
    </aside>
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
    gap: 12,
    padding: "10px 16px",
    borderBottom: `1.5px solid ${INK}`,
    fontSize: 14,
  },
  hint: { color: "rgba(18,20,32,0.65)", fontSize: 12 },
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
    width: 272,
    display: "flex",
    flexDirection: "column",
    borderRight: `1.5px solid ${INK}`,
    background: "#f7f7f7",
    minHeight: 0,
  },
  tabs: { display: "flex", gap: 4, padding: "10px 10px 0" },
  tab: {
    flex: 1,
    border: "1.5px solid transparent",
    background: "transparent",
    borderRadius: 4,
    padding: "6px 0",
    cursor: "pointer",
    color: INK,
    fontWeight: 600,
  },
  tabActive: {
    flex: 1,
    border: `1.5px solid ${INK}`,
    background: "#fff",
    borderRadius: 4,
    padding: "6px 0",
    cursor: "pointer",
    color: ACCENT,
    fontWeight: 700,
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
  note: { gridColumn: "1 / -1", fontSize: 12, color: "rgba(18,20,32,0.65)" },
} satisfies Record<string, React.CSSProperties>;
