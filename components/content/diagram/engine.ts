// Runtime for Studio diagram exports. Reads the data-sd-* tags written by
// studio/diagram (flows.tsx, NodeShape.tsx, behavior.ts) and drives:
// per-kind arrow motion, queue buildup, retries/failures, fan-out bursts,
// card pop, hover-trace and walkthrough highlighting.
import { animate } from "motion";

export type FlowKind = "request" | "async" | "response" | "plain";
export type FlowDef = {
  id: string;
  name: string;
  steps: { arrowId: string; note?: string; fails?: number }[];
  isDefault?: boolean;
};

type NodeInfo = {
  id: string;
  el: SVGGElement;
  role: "queue" | "fanout" | "plain";
  label: string;
  w: number;
  h: number;
  chips: SVGCircleElement[];
};

type ArrowInfo = {
  id: string;
  el: SVGGElement;
  kind: FlowKind;
  from?: string;
  to?: string;
  label: string;
  /** Auto-detected failure path ("3 retries" → DLQ). */
  autoFails: number;
  body: SVGPathElement | null;
  length: number;
};

export type Step = { arrow: ArrowInfo; note?: string; fails: number };
/** One walkthrough beat — several steps when a fan-out bursts. */
export type Stage = Step[];

export const AUTO_FLOW = "auto";

const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS: Record<FlowKind, string> = {
  request: "#0067a8",
  async: "#121420",
  response: "#8a8f98",
  plain: "#0067a8",
};
const FAIL = "#DD344C";
const MAX_CHIPS = 6;

// ── small async helpers (all abortable) ──

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (clearTimeout(t), resolve()), { once: true });
  });

function tween(duration: number, onUpdate: (t: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const controls = animate(0, 1, { duration, ease: "easeInOut", onUpdate, onComplete: () => resolve() });
    signal.addEventListener("abort", () => (controls.stop(), resolve()), { once: true });
  });
}

function waapi(el: Element, keyframes: Keyframe[], opts: KeyframeAnimationOptions, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const a = el.animate(keyframes, opts);
    a.onfinish = () => resolve();
    signal.addEventListener("abort", () => (a.cancel(), resolve()), { once: true });
  });
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

export class DiagramEngine {
  readonly nodes = new Map<string, NodeInfo>();
  readonly arrows = new Map<string, ArrowInfo>();
  private readonly order: ArrowInfo[] = [];
  private baseFocus: Set<string> | null = null;
  private readonly cleanups: (() => void)[] = [];

  private svg: Element | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly recorded: FlowDef[],
  ) {
    this.scan();
  }

  /**
   * (Re)read the SVG. React may re-insert the markup after hydration (the
   * browser's serialisation differs from the server string), which swaps the
   * elements out from under us — so every entry point checks freshness.
   */
  private fresh() {
    if (this.root.firstElementChild !== this.svg) this.scan();
    return this;
  }

  private scan() {
    const root = this.root;
    this.svg = root.firstElementChild;
    this.nodes.clear();
    this.arrows.clear();
    this.order.length = 0;
    for (const el of root.querySelectorAll<SVGGElement>("[data-sd-node]")) {
      const id = el.dataset.sdNode!;
      el.style.transformBox = "fill-box";
      el.style.transformOrigin = "center";
      this.nodes.set(id, {
        id,
        el,
        role: (el.dataset.sdRole as NodeInfo["role"]) ?? "plain",
        label: el.dataset.sdLabel ?? "",
        w: Number(el.dataset.sdW) || 150,
        h: Number(el.dataset.sdH) || 110,
        chips: [],
      });
    }
    for (const el of root.querySelectorAll<SVGGElement>("[data-sd-arrow]")) {
      const info = this.readArrow(el);
      this.arrows.set(info.id, info);
      this.order.push(info);
    }
  }

  private readArrow(el: SVGGElement): ArrowInfo {
    // The arrow body is the longest visible path (heads are short; the label
    // cut-out lives in a clipPath/mask and must be ignored).
    let body: SVGPathElement | null = null;
    let length = 0;
    for (const path of el.querySelectorAll("path")) {
      if (path.closest("clipPath, mask, defs, marker")) continue;
      try {
        const len = path.getTotalLength();
        if (len > length) [body, length] = [path, len];
      } catch {
        // Degenerate path — ignore.
      }
    }
    return {
      id: el.dataset.sdArrow!,
      el,
      kind: (el.dataset.sdFlow as FlowKind) ?? "plain",
      from: el.dataset.sdFrom || undefined,
      to: el.dataset.sdTo || undefined,
      label: el.dataset.sdLabel ?? "",
      autoFails: Number(el.dataset.sdFails) || 0,
      body: length > 8 ? body : null,
      length,
    };
  }

  get isEmpty() {
    return this.fresh().order.length === 0;
  }

  // ── flows ──

  /** Recorded flows (pills), or a single automatic overview. */
  flowOptions(): { id: string; name: string }[] {
    const valid = this.recorded.filter((f) => f.steps.some((s) => this.arrows.has(s.arrowId)));
    return valid.length ? valid.map((f) => ({ id: f.id, name: f.name })) : [{ id: AUTO_FLOW, name: "Overview" }];
  }

  defaultFlowId() {
    const options = this.flowOptions();
    const preferred = this.recorded.find((f) => f.isDefault && options.some((o) => o.id === f.id));
    return preferred?.id ?? options[0].id;
  }

  stages(flowId: string): Stage[] {
    this.fresh();
    const flow = this.recorded.find((f) => f.id === flowId);
    const steps: Step[] = flow
      ? flow.steps
          .filter((s) => this.arrows.has(s.arrowId))
          .map((s) => ({ arrow: this.arrows.get(s.arrowId)!, note: s.note, fails: s.fails ?? 0 }))
      : this.autoOrder().map((arrow) => ({ arrow, fails: 0 }));
    return this.groupFanouts(steps);
  }

  /** BFS from entry nodes (no incoming arrows) along outgoing arrows. */
  private autoOrder(): ArrowInfo[] {
    const incoming = new Set(this.order.map((a) => a.to).filter(Boolean));
    const byFrom = new Map<string, ArrowInfo[]>();
    for (const a of this.order) if (a.from) byFrom.set(a.from, [...(byFrom.get(a.from) ?? []), a]);
    const sources = [...new Set(this.order.map((a) => a.from).filter((f): f is string => Boolean(f) && !incoming.has(f)))];
    const seen = new Set<string>();
    const out: ArrowInfo[] = [];
    const queue = [...sources];
    const visitedNodes = new Set(queue);
    while (queue.length) {
      const node = queue.shift()!;
      for (const a of byFrom.get(node) ?? []) {
        if (seen.has(a.id)) continue;
        seen.add(a.id);
        out.push(a);
        if (a.to && !visitedNodes.has(a.to)) {
          visitedNodes.add(a.to);
          queue.push(a.to);
        }
      }
    }
    // Cycles without an entry point, or unbound arrows: keep drawing order.
    for (const a of this.order) if (!seen.has(a.id)) out.push(a);
    return out;
  }

  /** A fan-out node's outgoing hops play together as one stage. */
  private groupFanouts(steps: Step[]): Stage[] {
    const stages: Stage[] = [];
    const used = new Set<number>();
    steps.forEach((step, i) => {
      if (used.has(i)) return;
      used.add(i);
      const from = step.arrow.from ? this.nodes.get(step.arrow.from) : undefined;
      if (from?.role !== "fanout" || step.fails) return void stages.push([step]);
      const burst = [step];
      steps.forEach((other, j) => {
        if (!used.has(j) && other.arrow.from === from.id && !other.fails) {
          used.add(j);
          burst.push(other);
        }
      });
      stages.push(burst);
    });
    return stages;
  }

  caption(stage: Stage) {
    const name = (id?: string) => (id && this.nodes.get(id)?.label) || "…";
    const first = stage[0];
    const note = first.note?.trim();
    if (stage.length > 1) {
      return note || `${name(first.arrow.from)} fans out → ${stage.map((s) => name(s.arrow.to)).join(", ")}`;
    }
    const hop = `${name(first.arrow.from)} → ${name(first.arrow.to)}`;
    if (note) return `${hop}: ${note}`;
    const fails = first.fails || first.arrow.autoFails;
    const label = first.arrow.label ? `: ${first.arrow.label}` : "";
    return fails && !first.arrow.autoFails ? `${hop}${label} (fails ×${fails}, then succeeds)` : `${hop}${label}`;
  }

  // ── focus (walkthrough highlight + hover-trace) ──

  private applyFocus(ids: Set<string> | null) {
    this.fresh();
    this.root.classList.toggle("sd-focus", Boolean(ids));
    for (const n of this.nodes.values()) n.el.classList.toggle("sd-on", Boolean(ids?.has(n.id)));
    for (const a of this.arrows.values()) a.el.classList.toggle("sd-on", Boolean(ids?.has(a.id)));
  }

  highlight(stage: Stage | null) {
    if (!stage) {
      this.baseFocus = null;
    } else {
      const ids = new Set<string>();
      for (const { arrow } of stage) {
        ids.add(arrow.id);
        if (arrow.from) ids.add(arrow.from);
        if (arrow.to) ids.add(arrow.to);
      }
      this.baseFocus = ids;
    }
    this.applyFocus(this.baseFocus);
  }

  /** Hovering a card highlights it, its arrows and its neighbours. */
  enableHoverTrace() {
    const over = (e: PointerEvent) => {
      this.fresh();
      const el = (e.target as Element | null)?.closest?.("[data-sd-node]") as SVGGElement | null;
      if (!el) return this.applyFocus(this.baseFocus);
      const id = el.dataset.sdNode!;
      const ids = new Set([id]);
      for (const a of this.arrows.values()) {
        if (a.from === id || a.to === id) {
          ids.add(a.id);
          if (a.from) ids.add(a.from);
          if (a.to) ids.add(a.to);
        }
      }
      this.applyFocus(ids);
    };
    const leave = () => this.applyFocus(this.baseFocus);
    this.root.addEventListener("pointerover", over);
    this.root.addEventListener("pointerleave", leave);
    this.cleanups.push(() => {
      this.root.removeEventListener("pointerover", over);
      this.root.removeEventListener("pointerleave", leave);
    });
  }

  /** Async arrows get continuously flowing "marching ants". */
  setAnts(on: boolean) {
    this.fresh();
    this.root.classList.toggle("sd-ants", on);
    if (!on) return;
    for (const a of this.arrows.values()) {
      if (a.kind !== "async" || !a.body) continue;
      const dash = (a.body.getAttribute("stroke-dasharray") ?? "")
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => n > 0)
        .reduce((sum, n) => sum + n, 0);
      if (dash) a.body.style.setProperty("--sd-dash", `-${dash * 2}px`);
    }
  }

  // ── motion ──

  clearChips() {
    for (const n of this.nodes.values()) {
      for (const c of n.chips) c.remove();
      n.chips = [];
    }
  }

  async playStage(stage: Stage, signal: AbortSignal) {
    await Promise.all(stage.map((step) => this.playStep(step, signal)));
  }

  private async playStep(step: Step, signal: AbortSignal) {
    const arrow = this.fresh().arrows.get(step.arrow.id) ?? step.arrow;
    const from = arrow.from ? this.nodes.get(arrow.from) : undefined;
    const to = arrow.to ? this.nodes.get(arrow.to) : undefined;

    if (from?.role === "queue") await this.takeChip(from, signal);

    if (arrow.autoFails) {
      // Failure path: the source retries N times, then the message moves on (e.g. to the DLQ).
      if (from) await this.retries(from, arrow.autoFails, signal);
      await this.travel(arrow, FAIL, 1, signal);
    } else {
      for (let i = 0; i < step.fails && !signal.aborted; i++) {
        await this.travel(arrow, FAIL, 0.55, signal, true);
      }
      await this.travel(arrow, COLORS[arrow.kind], 1, signal);
    }
    if (signal.aborted) return;

    if (to) {
      if (arrow.kind === "response") void this.ring(to, COLORS.response, signal);
      void this.pop(to, signal);
      if (to.role === "queue" && arrow.kind !== "response") this.addChip(to);
    }
  }

  /** Dot along the arrow body; `until` < 1 stops short (a failed attempt). */
  private async travel(arrow: ArrowInfo, color: string, until: number, signal: AbortSignal, bounce = false) {
    const body = arrow.body;
    if (!body || signal.aborted) return;
    const dot = svgEl("circle", {
      r: arrow.kind === "async" ? 4 : 4.5,
      fill: color,
      stroke: "#ffffff",
      "stroke-width": 1.5,
      "data-sd-dot": "",
    });
    const transform = body.getAttribute("transform");
    if (transform) dot.setAttribute("transform", transform);
    body.parentNode?.appendChild(dot);
    const place = (t: number) => {
      const p = body.getPointAtLength(t * arrow.length);
      dot.setAttribute("cx", String(p.x));
      dot.setAttribute("cy", String(p.y));
    };
    const duration = Math.min(1.6, 0.5 + arrow.length / 400) * until;
    await tween(duration, (t) => place(t * until), signal);
    if (bounce && !signal.aborted) {
      await waapi(dot, [{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 160 }, signal);
      await tween(duration * 0.6, (t) => place(until * (1 - t)), signal);
    }
    dot.remove();
  }

  private pop(node: NodeInfo, signal: AbortSignal) {
    return waapi(
      node.el,
      [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }],
      { duration: 320, easing: "ease-out" },
      signal,
    );
  }

  private async ring(node: NodeInfo, color: string, signal: AbortSignal) {
    const ring = svgEl("rect", {
      x: -3,
      y: -3,
      width: node.w + 6,
      height: node.h + 6,
      rx: 10,
      fill: "none",
      stroke: color,
      "stroke-width": 2,
    });
    node.el.appendChild(ring);
    await waapi(ring, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 600, easing: "ease-out" }, signal);
    ring.remove();
  }

  private async retries(node: NodeInfo, count: number, signal: AbortSignal) {
    for (let i = 0; i < count && !signal.aborted; i++) {
      void this.ring(node, FAIL, signal);
      await waapi(
        node.el,
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(3px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 260 },
        signal,
      );
      await wait(180, signal);
    }
  }

  private addChip(node: NodeInfo) {
    if (node.chips.length >= MAX_CHIPS) return;
    const i = node.chips.length;
    const chip = svgEl("circle", {
      cx: node.w - 12 - i * 11,
      cy: -9,
      r: 4,
      fill: COLORS.async,
      stroke: "#ffffff",
      "stroke-width": 1.5,
    });
    node.el.appendChild(chip);
    node.chips.push(chip);
    chip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  }

  private async takeChip(node: NodeInfo, signal: AbortSignal) {
    const chip = node.chips.pop();
    if (!chip) return;
    await waapi(chip, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }, signal);
    chip.remove();
  }

  /** Loop a flow until aborted. */
  async runAmbient(flowId: string, signal: AbortSignal) {
    while (!signal.aborted) {
      const stages = this.stages(flowId);
      this.clearChips();
      for (const stage of stages) {
        if (signal.aborted) break;
        await this.playStage(stage, signal);
        await wait(120, signal);
      }
      await wait(1100, signal);
    }
  }

  destroy() {
    for (const fn of this.cleanups) fn();
    this.applyFocus(null);
    this.setAnts(false);
    this.clearChips();
    for (const dot of this.root.querySelectorAll("[data-sd-dot]")) dot.remove();
  }
}
