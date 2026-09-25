// Animation semantics shared by the editor and the export: node roles (auto-
// detected, overridable), arrow endpoints/failures, and recorded flows. The
// blog reads the resulting data-sd-* attributes + the flows JSON
// (components/content/diagram/engine.ts).
import {
  type Editor,
  getArrowBindings,
  renderPlaintextFromRichText,
  type TLArrowShape,
  type TLShape,
  type TLShapeId,
} from "tldraw";

import { flowOf } from "./flows";

export type NodeRole = "queue" | "fanout" | "plain";
export type RoleSetting = "auto" | NodeRole;

export type FlowStep = { arrowId: TLShapeId; note?: string; fails?: number };
export type Flow = { id: string; name: string; steps: FlowStep[]; isDefault?: boolean };

const NODE = "sd-node";

// Icons/labels that read as a queue, broker or stream.
const QUEUE_ICON = /SimpleQueueService|Kinesis|ManagedStreamingforApacheKafka|MQ\b|EventBridge(Default|Custom)EventBus|brands:(apachekafka|rabbitmq|redis|nats|celery-broker)|system:(inbox|radio)/i;
const QUEUE_LABEL = /\b(sqs|queue|dlq|kafka|rabbit(mq)?|redis|broker|kinesis|stream|topic|bus)\b/i;
const FANOUT_ICON = /SimpleNotificationService|EventBridge\b|EventBridge$|system:radio/i;

// ── Node roles ──

export function roleSetting(shape: TLShape): RoleSetting {
  const r = (shape.meta as { role?: RoleSetting }).role;
  return r === "queue" || r === "fanout" || r === "plain" ? r : "auto";
}

export function setRole(editor: Editor, id: TLShapeId, role: RoleSetting) {
  const shape = editor.getShape(id);
  if (!shape) return;
  editor.updateShape({ id, type: shape.type, meta: { ...shape.meta, role } });
}

/** Outgoing arrows (bound at their start to this shape). */
export function outgoingArrows(editor: Editor, id: TLShapeId) {
  return editor
    .getBindingsToShape(id, "arrow")
    .filter((b) => (b.props as { terminal?: string }).terminal === "start")
    .map((b) => editor.getShape<TLArrowShape>(b.fromId))
    .filter((a): a is TLArrowShape => Boolean(a));
}

/** Resolve a node's behaviour: explicit override, else icon/label/graph heuristics. */
export function resolveRole(editor: Editor, shape: TLShape): NodeRole {
  const setting = roleSetting(shape);
  if (setting !== "auto") return setting;
  if (shape.type !== NODE) return "plain";
  const iconId = String((shape.meta as { iconId?: string }).iconId ?? "");
  const label = String((shape.props as { label?: string }).label ?? "");
  const asyncOut = outgoingArrows(editor, shape.id).filter((a) => flowOf(a.props) === "async").length;
  if (FANOUT_ICON.test(iconId) && asyncOut >= 1) return "fanout";
  if (asyncOut >= 2) return "fanout";
  if (QUEUE_ICON.test(iconId) || QUEUE_LABEL.test(label)) return "queue";
  return "plain";
}

// ── Arrows ──

export function arrowEnds(editor: Editor, arrow: TLArrowShape) {
  const b = getArrowBindings(editor, arrow);
  return { from: b.start?.toId, to: b.end?.toId };
}

export function arrowLabel(editor: Editor, arrow: TLArrowShape) {
  return renderPlaintextFromRichText(editor, arrow.props.richText).trim();
}

/**
 * Failure paths animate as N red retries then a hop to the target.
 * Auto: a Response (dotted) arrow whose label mentions retry/DLQ/fail;
 * "3 retries" → 3.
 */
export function autoFailCount(kind: string, label: string) {
  if (kind !== "response" || !/retr|dlq|dead|fail/i.test(label)) return 0;
  const n = Number(label.match(/\d+/)?.[0]);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 5) : 3;
}

// ── Recorded flows (stored on the tldraw document, saved with the snapshot) ──

export function getFlows(editor: Editor): Flow[] {
  const flows = (editor.getDocumentSettings().meta as { flows?: Flow[] }).flows;
  return Array.isArray(flows) ? flows : [];
}

export function setFlows(editor: Editor, flows: Flow[]) {
  const doc = editor.getDocumentSettings();
  editor.updateDocumentSettings({ meta: { ...doc.meta, flows: flows as unknown as never } });
}

/** Flows with steps whose arrows still exist — what the blog receives. */
export function exportFlows(editor: Editor): Flow[] {
  return getFlows(editor)
    .map((f) => ({ ...f, steps: f.steps.filter((s) => editor.getShape(s.arrowId)?.type === "arrow") }))
    .filter((f) => f.steps.length > 0);
}
