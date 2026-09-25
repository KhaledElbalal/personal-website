// Connector presets + the arrow util that tags exported arrows so the blog
// can animate them (components/content/DiagramViewer.tsx reads data-sd-flow).
import {
  ArrowShapeUtil,
  DefaultColorStyle,
  DefaultDashStyle,
  type Editor,
  type SvgExportContext,
  type TLArrowShape,
  type TLDefaultColorStyle,
  type TLDefaultDashStyle,
} from "tldraw";

import { arrowEnds, arrowLabel, autoFailCount } from "./behavior";

export type FlowKind = "request" | "async" | "response";

export const FLOWS: Record<
  FlowKind,
  { label: string; hint: string; color: TLDefaultColorStyle; dash: TLDefaultDashStyle }
> = {
  request: { label: "Request", hint: "Sync call on the request path", color: "blue", dash: "solid" },
  async: { label: "Async", hint: "Queue / event / fire-and-forget", color: "black", dash: "dashed" },
  response: { label: "Response", hint: "Reply, callback or retry path", color: "grey", dash: "dotted" },
};

export function flowOf(props: { color: string; dash: string }): FlowKind | "plain" {
  if (props.dash === "dashed") return "async";
  if (props.dash === "dotted") return "response";
  if (props.color === "blue") return "request";
  return "plain";
}

/**
 * Apply a connector preset: restyles selected arrows, and makes it the style
 * for the next arrow drawn. With no arrows selected, switches to the arrow tool.
 */
export function applyFlow(editor: Editor, kind: FlowKind) {
  const { color, dash } = FLOWS[kind];
  const arrows = editor.getSelectedShapes().filter((s): s is TLArrowShape => s.type === "arrow");
  if (arrows.length) {
    editor.updateShapes(arrows.map((a) => ({ id: a.id, type: "arrow" as const, props: { color, dash } })));
  }
  editor.setStyleForNextShapes(DefaultColorStyle, color);
  editor.setStyleForNextShapes(DefaultDashStyle, dash);
  if (!arrows.length) editor.setCurrentTool("arrow");
}

/**
 * Default arrow, but its export carries what the blog animation needs:
 * id, kind, endpoints, label and auto-detected retry count.
 */
export class FlowArrowShapeUtil extends ArrowShapeUtil {
  override toSvg(shape: TLArrowShape, ctx: SvgExportContext) {
    const kind = flowOf(shape.props);
    const { from, to } = arrowEnds(this.editor, shape);
    const label = arrowLabel(this.editor, shape);
    const fails = autoFailCount(kind, label);
    return (
      <g
        data-sd-arrow={shape.id}
        data-sd-flow={kind}
        data-sd-from={from}
        data-sd-to={to}
        data-sd-label={label || undefined}
        data-sd-fails={fails || undefined}
      >
        {super.toSvg(shape, ctx)}
      </g>
    );
  }
}

// Arrow label sizes matched to the card labels (14px Space Mono). tldraw's
// defaults are larger, which squishes labels on short connectors.
const LABEL_FONT_SIZES = { s: 13, m: 15, l: 19, xl: 24 } as const;

export const SiteArrowShapeUtil = FlowArrowShapeUtil.configure({
  getCustomDisplayValues: (_editor, shape) => ({
    labelFontSize: LABEL_FONT_SIZES[shape.props.size],
  }),
});
