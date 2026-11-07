"use client";

import {
  memo,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  ViewTransition,
} from "react";

import { AUTO_FLOW, DiagramEngine, type FlowDef, type Stage } from "@/components/content/diagram/engine";

export type DiagramAnimation = "ambient" | "walkthrough" | "off";

type DiagramViewerProps = {
  html: string;
  alt: string;
  caption?: string | null;
  width?: number | null;
  animation: DiagramAnimation;
  flows: FlowDef[];
  /** Cover mode: cap the frame at PEEK_HEIGHT (diagram kept at readable size) with a fade and a "Show full diagram" toggle. */
  peek?: boolean;
  /** Names the frame for a shared-element view transition (list cover → post cover). */
  transitionName?: string;
};

/** Height of a collapsed cover diagram: about half the screen, within readable bounds. */
export const PEEK_HEIGHT = "clamp(24rem, 50svh, 32rem)";

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true, // Server: render without motion.
  );
}

function useInView(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

/**
 * The SVG host never re-renders after mount: React re-applies
 * dangerouslySetInnerHTML on re-render (e.g. each walkthrough step), which
 * would wipe the engine's classes and in-flight dots.
 */
const SvgHost = memo(function SvgHost({
  html,
  hostRef,
  className,
  role,
  label,
}: {
  html: string;
  hostRef: Ref<HTMLDivElement>;
  className: string;
  role?: string;
  label?: string;
}) {
  return (
    <div ref={hostRef} role={role} aria-label={label} className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
});

// ── controls ──

// Chips that look pressable: a tone of the accent that deepens on hover,
// sinks 1px when pressed, and dims (with a not-allowed cursor) when disabled.
const ctrlBase =
  " inline-flex h-9 items-center justify-center gap-1.5 px-3 text-sm font-semibold leading-none transition-colors duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40";
// Solid, high-contrast variant for the cover's expand/collapse toggle.
const ctrlSolid = `${ctrlBase} h-11 px-5 text-[0.9375rem] bg-[color:var(--color-xiketic)] text-[color:var(--color-ghost-white)] shadow-[0_6px_20px_rgba(10,14,30,0.18)] hover:bg-[color:var(--color-tufts-blue)]`;
const ctrl = `${ctrlBase} bg-[#dff1fd] text-ink hover:bg-[#c9e8fb] active:bg-[#b4def8] disabled:hover:bg-[#dff1fd]`;
/** Selected pill/tab. */
const ctrlOn = `${ctrlBase} bg-[color:var(--color-xiketic)] text-on-accent`;

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`${ctrl} w-9 px-0`}>
      {children}
    </button>
  );
}

const icon = {
  expand: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  ),
  pause: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  play: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
};

/**
 * Wires a DiagramEngine to an SVG container and returns the controls
 * (flow pills, walkthrough stepper / pause). Used by the inline figure and
 * the lightbox independently.
 */
function useDiagramStage({
  html,
  flows,
  animation,
  active,
}: {
  html: string;
  flows: FlowDef[];
  animation: DiagramAnimation;
  active: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DiagramEngine | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInView(containerRef);

  // Flow choices come from props (no DOM needed): recorded flows whose arrows
  // exist in this export, else a single automatic overview.
  const options = useMemo(() => {
    const valid = flows.filter((f) => f.steps.some((s) => html.includes(`data-sd-arrow="${s.arrowId}"`)));
    return valid.length ? valid.map((f) => ({ id: f.id, name: f.name })) : [{ id: AUTO_FLOW, name: "Overview" }];
  }, [flows, html]);
  const defaultFlow = flows.find((f) => f.isDefault && options.some((o) => o.id === f.id))?.id ?? options[0].id;
  const hasArrows = html.includes("data-sd-arrow=");

  const [flowId, setFlowId] = useState(defaultFlow);
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState<{ index: number; total: number; caption: string } | null>(null);
  const stageAbort = useRef<AbortController | null>(null);

  // One engine per rendered SVG; hover-trace is always on.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const engine = new DiagramEngine(el, flows);
    engine.enableHoverTrace();
    engineRef.current = engine;
    return () => {
      stageAbort.current?.abort();
      engine.destroy();
      engineRef.current = null;
    };
  }, [html, flows]);

  const ambient = animation === "ambient" && hasArrows && !reducedMotion;
  // Ambient loop: only while on screen, playing, and not superseded (lightbox open).
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !ambient || !playing || !inView || !active) return;
    const ac = new AbortController();
    engine.setAnts(true);
    void engine.runAmbient(flowId, ac.signal);
    return () => {
      ac.abort();
      engine.setAnts(false);
      engine.clearChips();
    };
  }, [ambient, playing, inView, active, flowId, html]);

  const walkthrough = animation === "walkthrough" && hasArrows;
  const goTo = useCallback(
    (index: number, flow = flowId) => {
      const engine = engineRef.current;
      if (!engine) return;
      stageAbort.current?.abort();
      const stages: Stage[] = engine.stages(flow);
      if (!stages.length || index < 0) {
        engine.highlight(null);
        engine.setAnts(false);
        setStep(null);
        return;
      }
      const i = Math.min(index, stages.length - 1);
      engine.highlight(stages[i]);
      setStep({ index: i, total: stages.length, caption: engine.caption(stages[i]) });
      if (!reducedMotion) {
        engine.setAnts(true);
        const ac = new AbortController();
        stageAbort.current = ac;
        void engine.playStage(stages[i], ac.signal);
      }
    },
    [flowId, reducedMotion],
  );

  const pickFlow = (id: string) => {
    setFlowId(id);
    if (step) goTo(0, id);
  };

  const controls =
    animation === "off" || !hasArrows ? null : (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {options.length > 1 ? (
            <div role="group" aria-label="Flows" className="flex flex-wrap gap-2">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={o.id === flowId}
                  onClick={() => pickFlow(o.id)}
                  className={o.id === flowId ? ctrlOn : ctrl}
                >
                  {o.name}
                </button>
              ))}
            </div>
          ) : null}
          <span className="flex-1" />
          {walkthrough ? (
            step ? (
              <div className="flex items-center gap-2">
                <button type="button" className={ctrl} onClick={() => goTo(step.index - 1)} disabled={step.index === 0}>
                  ← Prev
                </button>
                <span className="font-body text-sm font-semibold text-muted" aria-live="polite">
                  {step.index + 1}/{step.total}
                </span>
                <button
                  type="button"
                  className={ctrl}
                  onClick={() => goTo(step.index + 1)}
                  disabled={step.index >= step.total - 1}
                >
                  Next →
                </button>
                <button type="button" className={ctrl} onClick={() => goTo(-1)}>
                  Reset
                </button>
              </div>
            ) : (
              <button type="button" className={ctrl} onClick={() => goTo(0)}>
                ▶ Step through
              </button>
            )
          ) : ambient ? (
            <IconButton
              label={playing ? "Pause flow animation" : "Play flow animation"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? icon.pause : icon.play}
            </IconButton>
          ) : null}
        </div>
        {step ? (
          <p className="m-0 font-body text-[13px] text-ink" aria-live="polite">
            <span className="font-bold text-[color:var(--accent-text)]">{step.index + 1}.</span> {step.caption}
          </p>
        ) : null}
      </div>
    );

  return { containerRef, controls };
}

/** Inline diagram: animations, hover-trace, and an enlarge (zoom + pan) lightbox. */
export function DiagramViewer({
  html,
  alt,
  caption,
  width,
  animation,
  flows,
  pager,
  peek = false,
  transitionName,
}: DiagramViewerProps & { pager?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { containerRef, controls } = useDiagramStage({ html, flows, animation, active: !open });

  // Peek: only offer the toggle when the diagram is actually taller than the cap.
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useEffect(() => {
    const el = panelRef.current;
    if (!peek || expanded || !el) return;
    const check = () => setClipped(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [peek, expanded, html]);
  const collapsed = peek && !expanded;

  return (
    <figure className={`${peek ? "my-0" : "my-10"} w-full [contain:inline-size]`}>
      {controls ? <div className="mb-3">{controls}</div> : null}
      <ViewTransition name={transitionName} share="cover-morph" default="none">
        <div className="relative">
          <div
            ref={panelRef}
            id={panelId}
            style={collapsed ? { maxHeight: PEEK_HEIGHT } : undefined}
            className={`bg-section p-4 sm:p-6 ${collapsed ? "overflow-hidden" : "overflow-x-auto"} ${pager ? "pt-16 sm:pt-16" : ""}`}
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Enlarge diagram: ${alt}`}
              className="mx-auto block w-full cursor-zoom-in"
              style={{ maxWidth: width ?? undefined }}
            >
              <SvgHost html={html} hostRef={containerRef} className="sd-diagram" />
            </button>
          </div>
          {collapsed && clipped ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-36 items-end justify-center bg-linear-to-t from-section via-section/90 to-transparent pb-6">
              <button
                type="button"
                aria-expanded={false}
                aria-controls={panelId}
                onClick={() => setExpanded(true)}
                className={`${ctrlSolid} pointer-events-auto`}
              >
                Show full diagram <span aria-hidden="true">↓</span>
              </button>
            </div>
          ) : null}
          <div className="absolute right-3 top-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Enlarge diagram"
              title="Enlarge diagram"
              className={ctrl}
            >
              {icon.expand}
              <span className="hidden sm:inline">Enlarge</span>
            </button>
          </div>
          {/* Pinned top-left so it never moves when pages differ in height. */}
          {pager ? <div className="absolute left-3 top-3 right-14">{pager}</div> : null}
        </div>
      </ViewTransition>
      {peek && expanded ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            aria-expanded
            aria-controls={panelId}
            onClick={() => setExpanded(false)}
            className={ctrlSolid}
          >
            Show less <span aria-hidden="true">↑</span>
          </button>
        </div>
      ) : null}
      {caption ? (
        <figcaption className="mt-3 text-center font-body text-[13px] text-muted">{caption}</figcaption>
      ) : null}
      {open ? (
        <Lightbox
          html={html}
          alt={alt}
          caption={caption}
          width={width}
          animation={animation}
          flows={flows}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </figure>
  );
}

function Lightbox({
  html,
  alt,
  caption,
  width,
  animation,
  flows,
  onClose,
}: DiagramViewerProps & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const naturalWidth = width ?? 900;
  const [zoom, setZoom] = useState(1);
  const { containerRef, controls } = useDiagramStage({ html, flows, animation, active: true });

  const fit = useCallback(() => {
    const box = scrollRef.current;
    if (!box) return;
    setZoom(Math.min(2, (box.clientWidth - 32) / naturalWidth));
  }, [naturalWidth]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    fit();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    // No dialog.close() here: its "close" event unmounts us (and would fire
    // on StrictMode's dev re-run). Unmounting removes the dialog anyway.
    return () => {
      root.style.overflow = prev;
    };
  }, [fit]);

  const stepZoom = (dir: 1 | -1) =>
    setZoom((z) => {
      const next =
        dir > 0 ? ZOOM_STEPS.find((s) => s > z + 0.01) : [...ZOOM_STEPS].reverse().find((s) => s < z - 0.01);
      return next ?? z;
    });

  // Drag to pan (mouse); touch uses native scrolling + pinch.
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={caption ? `Diagram: ${caption}` : "Diagram"}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 backdrop:bg-[rgba(18,20,32,0.6)]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b-[1.5px] border-[color:var(--color-xiketic)] px-4 py-3">
          <p className="m-0 min-w-0 flex-1 truncate font-body text-sm font-bold text-ink">
            <span className="text-[color:var(--accent-text)]">##</span> {caption || "Diagram"}
          </p>
          <IconButton label="Zoom out" onClick={() => stepZoom(-1)}>
            <span className="font-body text-lg leading-none">−</span>
          </IconButton>
          <button type="button" onClick={fit} className={ctrl} title="Fit to screen">
            {Math.round(zoom * 100)}%
          </button>
          <IconButton label="Zoom in" onClick={() => stepZoom(1)}>
            <span className="font-body text-lg leading-none">+</span>
          </IconButton>
          <IconButton label="Close" onClick={() => dialogRef.current?.close()}>
            {icon.close}
          </IconButton>
        </div>
        {controls ? <div className="px-4 py-3">{controls}</div> : null}
        <div
          ref={scrollRef}
          role="region"
          aria-label="Diagram viewport — arrow keys to pan"
          // Focusable so keyboard users can pan (axe: scrollable-region-focusable).
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="flex-1 cursor-grab overflow-auto p-4 active:cursor-grabbing"
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" || !scrollRef.current) return;
            drag.current = {
              x: e.clientX,
              y: e.clientY,
              left: scrollRef.current.scrollLeft,
              top: scrollRef.current.scrollTop,
            };
          }}
          onPointerMove={(e) => {
            const box = scrollRef.current;
            if (!drag.current || !box) return;
            box.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
            box.scrollTop = drag.current.top - (e.clientY - drag.current.y);
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => (drag.current = null)}
        >
          <div className="mx-auto" style={{ width: naturalWidth * zoom }}>
            <SvgHost html={html} hostRef={containerRef} className="sd-diagram" role="img" label={alt} />
          </div>
        </div>
      </div>
    </dialog>
  );
}

export type DiagramPageView = { name: string; html: string; width?: number | null };

/**
 * Multi-page diagram. A segmented pager pinned to the frame's top-left
 * (‹ 01/03 · Page name ›) switches pages; it stays put whatever each page's height.
 */
export function DiagramPages({
  pages,
  ...rest
}: Omit<DiagramViewerProps, "html" | "width"> & { pages: DiagramPageView[] }) {
  const [index, setIndex] = useState(0);
  const page = pages[Math.min(index, pages.length - 1)];
  const go = (i: number) => setIndex((i + pages.length) % pages.length);
  const pad = (n: number) => String(n).padStart(2, "0");

  const arrow = `${ctrl} w-9 px-0 text-base`;
  const pager = (
    <nav
      aria-label="Diagram pages"
      className="inline-flex h-9 max-w-full items-stretch gap-[2px] text-sm font-semibold text-ink"
    >
      <button type="button" aria-label="Previous page" title="Previous page" onClick={() => go(index - 1)} className={arrow}>
        ‹
      </button>
      <span className="flex min-w-0 items-center gap-2 bg-white px-3" aria-live="polite">
        <span className="flex-none text-[color:var(--accent-text)]">
          {pad(index + 1)}
          <span className="text-muted">/{pad(pages.length)}</span>
        </span>
        <span className="truncate">{page.name}</span>
      </span>
      <button type="button" aria-label="Next page" title="Next page" onClick={() => go(index + 1)} className={arrow}>
        ›
      </button>
    </nav>
  );

  return <DiagramViewer key={index} {...rest} html={page.html} width={page.width} pager={pager} />;
}
