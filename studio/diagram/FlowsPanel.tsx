// Flows tab: record walkthrough scenarios by clicking arrows in order, with
// optional per-step notes and failure counts. Also the "Behaves as" override.
import { useEffect, useRef, useState } from "react";
import { type Editor, type TLArrowShape, type TLShapeId, useValue } from "tldraw";

import {
  arrowEnds,
  arrowLabel,
  type Flow,
  type FlowStep,
  getFlows,
  type RoleSetting,
  resolveRole,
  roleSetting,
  setFlows,
  setRole,
} from "./behavior";
import { ACCENT, FONT, INK } from "./theme";

const MUTED = "rgba(18,20,32,0.65)";

function nodeLabel(editor: Editor, id?: TLShapeId) {
  const shape = id ? editor.getShape(id) : undefined;
  const label = (shape?.props as { label?: string } | undefined)?.label;
  return label?.split("\n")[0] || (shape ? shape.type : "?");
}

export function describeArrow(editor: Editor, arrowId: TLShapeId) {
  const arrow = editor.getShape<TLArrowShape>(arrowId);
  if (!arrow) return { title: "(deleted arrow)", label: "" };
  const { from, to } = arrowEnds(editor, arrow);
  return { title: `${nodeLabel(editor, from)} → ${nodeLabel(editor, to)}`, label: arrowLabel(editor, arrow) };
}

const newId = () => Math.random().toString(36).slice(2, 10);

export function FlowsPanel({ editor }: { editor: Editor | null }) {
  const flows = useValue("sd-flows", () => (editor ? getFlows(editor) : []), [editor]);
  const [recording, setRecording] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const cancelPreview = useRef<() => void>(() => {});

  const update = (next: Flow[]) => editor && setFlows(editor, next);
  const patchFlow = (id: string, fn: (f: Flow) => Flow) => update(flows.map((f) => (f.id === id ? fn(f) : f)));
  const patchStep = (flowId: string, i: number, patch: Partial<FlowStep>) =>
    patchFlow(flowId, (f) => ({ ...f, steps: f.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  // While recording, each arrow the user clicks becomes the next step.
  const selectedArrow = useValue(
    "sd-selected-arrow",
    () => {
      const s = editor?.getOnlySelectedShape();
      return s?.type === "arrow" ? s.id : null;
    },
    [editor],
  );
  // Guards against appending the same click twice (StrictMode re-runs effects).
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedArrow) handled.current = null;
    if (!editor || !recording || !selectedArrow || handled.current === selectedArrow) return;
    handled.current = selectedArrow;
    const flow = getFlows(editor).find((f) => f.id === recording);
    if (!flow) return;
    setFlows(
      editor,
      getFlows(editor).map((f) =>
        f.id === recording ? { ...f, steps: [...f.steps, { arrowId: selectedArrow }] } : f,
      ),
    );
    // Deselect so the same arrow can be clicked again (e.g. a retry loop).
    editor.selectNone();
  }, [editor, recording, selectedArrow]);

  useEffect(() => () => cancelPreview.current(), []);

  const preview = async (flow: Flow) => {
    if (!editor) return;
    cancelPreview.current();
    let cancelled = false;
    cancelPreview.current = () => {
      cancelled = true;
      setPreviewing(null);
    };
    setRecording(null);
    setPreviewing(flow.id);
    for (const step of flow.steps) {
      if (cancelled || !editor.getShape(step.arrowId)) continue;
      editor.select(step.arrowId);
      await new Promise((r) => setTimeout(r, 750));
    }
    if (!cancelled) {
      editor.selectNone();
      setPreviewing(null);
    }
  };

  if (!editor) return null;

  return (
    <div style={styles.panel}>
      <p style={styles.help}>
        With no flows, the blog walks the diagram automatically from its entry points. Record a
        flow to choose the order, add notes, or show failures. Readers pick flows from pills above
        the diagram.
      </p>
      {flows.map((flow) => {
        const isRec = recording === flow.id;
        return (
          <section key={flow.id} style={{ ...styles.flow, borderColor: isRec ? ACCENT : INK }}>
            <div style={styles.flowHead}>
              <input
                aria-label="Flow name"
                value={flow.name}
                onChange={(e) => patchFlow(flow.id, (f) => ({ ...f, name: e.target.value }))}
                style={styles.name}
              />
              <button
                type="button"
                title={flow.isDefault ? "Default flow" : "Make default"}
                style={{ ...styles.icon, color: flow.isDefault ? ACCENT : MUTED }}
                onClick={() => update(flows.map((f) => ({ ...f, isDefault: f.id === flow.id ? !f.isDefault : false })))}
              >
                {flow.isDefault ? "★" : "☆"}
              </button>
              <button
                type="button"
                title={previewing === flow.id ? "Stop preview" : "Preview on canvas"}
                style={styles.icon}
                disabled={!flow.steps.length}
                onClick={() => (previewing === flow.id ? cancelPreview.current() : void preview(flow))}
              >
                {previewing === flow.id ? "■" : "▶"}
              </button>
              <button
                type="button"
                title="Delete flow"
                style={styles.icon}
                onClick={() => {
                  if (recording === flow.id) setRecording(null);
                  update(flows.filter((f) => f.id !== flow.id));
                }}
              >
                ✕
              </button>
            </div>

            <ol style={styles.steps}>
              {flow.steps.map((step, i) => {
                const d = describeArrow(editor, step.arrowId);
                return (
                  <li key={i} style={styles.step}>
                    <div style={styles.stepHead}>
                      <span style={styles.stepNum}>{i + 1}</span>
                      <span style={styles.stepTitle} title={d.title}>
                        {d.title}
                      </span>
                      <button type="button" title="Move up" style={styles.mini} disabled={i === 0} onClick={() => patchFlow(flow.id, (f) => ({ ...f, steps: swap(f.steps, i, i - 1) }))}>↑</button>
                      <button type="button" title="Move down" style={styles.mini} disabled={i === flow.steps.length - 1} onClick={() => patchFlow(flow.id, (f) => ({ ...f, steps: swap(f.steps, i, i + 1) }))}>↓</button>
                      <button type="button" title="Remove step" style={styles.mini} onClick={() => patchFlow(flow.id, (f) => ({ ...f, steps: f.steps.filter((_, j) => j !== i) }))}>✕</button>
                    </div>
                    <div style={styles.stepBody}>
                      <input
                        aria-label="Step note"
                        placeholder={d.label ? `Note (default: "${d.label}")` : "Note (optional)"}
                        value={step.note ?? ""}
                        onChange={(e) => patchStep(flow.id, i, { note: e.target.value || undefined })}
                        style={styles.note}
                      />
                      <select
                        aria-label="Failures before success"
                        title="Fails N times (red retries) before succeeding"
                        value={step.fails ?? 0}
                        onChange={(e) => patchStep(flow.id, i, { fails: Number(e.target.value) || undefined })}
                        style={styles.fails}
                      >
                        <option value={0}>✓ ok</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            ✗ fails ×{n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                );
              })}
            </ol>

            {isRec ? (
              <div style={styles.recBar}>
                <span style={styles.recDot} /> Click arrows on the canvas in order…
                <button type="button" style={styles.btn} onClick={() => setRecording(null)}>
                  Done
                </button>
              </div>
            ) : (
              <button type="button" style={styles.btn} onClick={() => setRecording(flow.id)}>
                ● Record steps
              </button>
            )}
          </section>
        );
      })}

      <button
        type="button"
        style={styles.add}
        onClick={() => {
          const id = newId();
          update([...flows, { id, name: flows.length ? `Flow ${flows.length + 1}` : "Happy path", steps: [], isDefault: flows.length === 0 }]);
          editor.selectNone();
          setRecording(id);
        }}
      >
        + Record new flow
      </button>
    </div>
  );
}

function swap<T>(list: T[], a: number, b: number) {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Top-bar control shown when one card is selected: override its detected role. */
export function BehavesAs({ editor }: { editor: Editor | null }) {
  const info = useValue(
    "sd-behaves-as",
    () => {
      const s = editor?.getOnlySelectedShape();
      if (!editor || !s || s.type !== "sd-node") return null;
      const setting = roleSetting(s);
      // What auto would pick, ignoring any override.
      const detected = resolveRole(editor, { ...s, meta: { ...s.meta, role: "auto" } });
      return { id: s.id, setting, detected };
    },
    [editor],
  );
  if (!editor || !info) return null;
  const names: Record<string, string> = { queue: "Queue", fanout: "Fan-out", plain: "Plain" };
  return (
    <label style={styles.behaves}>
      Behaves as
      <select
        value={info.setting}
        onChange={(e) => setRole(editor, info.id, e.target.value as RoleSetting)}
        style={styles.fails}
      >
        <option value="auto">Auto ({names[info.detected]})</option>
        <option value="queue">Queue</option>
        <option value="fanout">Fan-out</option>
        <option value="plain">Plain</option>
      </select>
    </label>
  );
}

const styles = {
  panel: { flex: 1, overflowY: "auto", padding: "10px 10px 16px", display: "flex", flexDirection: "column", gap: 10 },
  help: { margin: 0, fontSize: 12, lineHeight: 1.45, color: MUTED },
  flow: { border: `1.5px solid ${INK}`, borderRadius: 8, background: "#fff", padding: 8, display: "flex", flexDirection: "column", gap: 6 },
  flowHead: { display: "flex", alignItems: "center", gap: 4 },
  name: { flex: 1, minWidth: 0, border: "1px solid rgba(18,20,32,0.25)", borderRadius: 4, padding: "4px 6px", fontFamily: `'${FONT.mono}', monospace`, fontWeight: 700, fontSize: 12.5, color: INK },
  icon: { border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: INK, padding: "2px 4px" },
  steps: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 },
  step: { borderTop: "1px solid rgba(18,20,32,0.1)", paddingTop: 6 },
  stepHead: { display: "flex", alignItems: "center", gap: 4 },
  stepNum: { fontFamily: `'${FONT.mono}', monospace`, fontSize: 11, fontWeight: 700, color: ACCENT, width: 16 },
  stepTitle: { flex: 1, minWidth: 0, fontSize: 11.5, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  mini: { border: "none", background: "transparent", cursor: "pointer", fontSize: 11, color: MUTED, padding: "0 3px" },
  stepBody: { display: "flex", gap: 4, marginTop: 4, paddingLeft: 20 },
  note: { flex: 1, minWidth: 0, border: "1px solid rgba(18,20,32,0.25)", borderRadius: 4, padding: "3px 6px", fontSize: 11.5 },
  fails: { border: "1px solid rgba(18,20,32,0.25)", borderRadius: 4, fontSize: 11.5, padding: "2px 4px", background: "#fff", color: INK },
  recBar: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: ACCENT, fontWeight: 600 },
  recDot: { width: 8, height: 8, borderRadius: 999, background: "#DD344C", display: "inline-block" },
  btn: { marginLeft: "auto", alignSelf: "flex-start", border: `1.5px solid ${INK}`, background: "#fff", borderRadius: 4, padding: "3px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", color: INK },
  add: { border: `1.5px dashed ${ACCENT}`, background: "#fff", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 12.5, color: ACCENT, cursor: "pointer" },
  behaves: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: INK },
} satisfies Record<string, React.CSSProperties>;
