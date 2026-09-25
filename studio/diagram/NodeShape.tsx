// "Node" card — the site's EducationCard chrome (8px radius, 1.5px ink
// border, -6/6 blue offset shadow, Space Mono label) wrapped around an icon.
// The same SVG renders on the canvas and in exports, so the blog shows
// exactly what was drawn.
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  SVGContainer,
  T,
  type TLResizeInfo,
  type TLShape,
  resizeBox,
  useEditor,
  useValue,
} from "tldraw";

import { resolveRole } from "./behavior";
import { CARD_SHADOW, FONT, INK, MUTED, SITE_FONT_FACES } from "./theme";

export const NODE_TYPE = "sd-node";

declare module "tldraw" {
  export interface TLGlobalShapePropsMap {
    [NODE_TYPE]: {
      w: number;
      h: number;
      label: string;
      sublabel: string;
      iconBody: string;
      iconViewBox: string;
      iconColor: string;
    };
  }
}

export type NodeShape = TLShape<typeof NODE_TYPE>;

const PAD = 16;
const ICON = 40;
const LABEL_SIZE = 14;
const LABEL_LINE = 18;
const SUB_SIZE = 11.5;
const SUB_LINE = 15;
const RADIUS = 8;
const SHADOW = 6;
const STROKE = 1.5;

const lines = (s: string) => (s ? s.split("\n") : []);

// Greedy word-wrap to the card width. Space Mono is monospaced (0.612em
// advance), so label widths are exact; Poppins sub-labels use an average.
const MONO_ADVANCE = 0.612;
const BODY_ADVANCE = 0.56;
function wrap(text: string, width: number, fontSize: number, advance: number) {
  const max = Math.max(4, Math.floor((width - 2 * 12) / (fontSize * advance)));
  const out: string[] = [];
  for (const para of lines(text)) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (!line) line = word;
      else if (line.length + 1 + word.length <= max) line += ` ${word}`;
      else {
        out.push(line);
        line = word;
      }
      while (line.length > max) {
        out.push(line.slice(0, max));
        line = line.slice(max);
      }
    }
    out.push(line);
  }
  return out;
}

/** Vertical layout, shared by the canvas, the export, and the geometry. */
function layout(p: NodeShape["props"]) {
  const hasIcon = Boolean(p.iconBody);
  const labelLines = p.label ? wrap(p.label, p.w, LABEL_SIZE, MONO_ADVANCE) : [];
  const subLines = p.sublabel ? wrap(p.sublabel, p.w, SUB_SIZE, BODY_ADVANCE) : [];
  const content =
    (hasIcon ? ICON : 0) +
    (hasIcon && labelLines.length ? 10 : 0) +
    labelLines.length * LABEL_LINE +
    (subLines.length ? 4 + subLines.length * SUB_LINE : 0);
  const h = Math.max(p.h, content + PAD * 2);
  const top = (h - content) / 2;
  const labelTop = top + (hasIcon ? ICON + (labelLines.length ? 10 : 0) : 0);
  const subTop = labelTop + labelLines.length * LABEL_LINE + 4;
  return { h, hasIcon, labelLines, subLines, top, labelTop, subTop };
}

function NodeSvg({ shape }: { shape: NodeShape }) {
  const p = shape.props;
  const l = layout(p);
  const cx = p.w / 2;
  return (
    <g>
      <rect x={-SHADOW} y={SHADOW} width={p.w} height={l.h} rx={RADIUS} fill={CARD_SHADOW} />
      <rect
        x={STROKE / 2}
        y={STROKE / 2}
        width={p.w - STROKE}
        height={l.h - STROKE}
        rx={RADIUS}
        fill="#ffffff"
        stroke={INK}
        strokeWidth={STROKE}
      />
      {l.hasIcon ? (
        <svg
          x={cx - ICON / 2}
          y={l.top}
          width={ICON}
          height={ICON}
          viewBox={p.iconViewBox}
          color={p.iconColor}
          style={{ color: p.iconColor }}
          dangerouslySetInnerHTML={{ __html: p.iconBody }}
        />
      ) : null}
      {l.labelLines.map((line, i) => (
        <text
          key={`l${i}`}
          x={cx}
          y={l.labelTop + i * LABEL_LINE + LABEL_SIZE}
          textAnchor="middle"
          fontFamily={`'${FONT.mono}', monospace`}
          fontWeight={700}
          fontSize={LABEL_SIZE}
          fill={INK}
        >
          {line}
        </text>
      ))}
      {l.subLines.map((line, i) => (
        <text
          key={`s${i}`}
          x={cx}
          y={l.subTop + i * SUB_LINE + SUB_SIZE}
          textAnchor="middle"
          fontFamily={`'${FONT.body}', sans-serif`}
          fontSize={SUB_SIZE}
          fill={MUTED}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function NodeEditor({ shape }: { shape: NodeShape }) {
  const editor = useEditor();
  const update = (props: Partial<NodeShape["props"]>) =>
    editor.updateShape<NodeShape>({ id: shape.id, type: NODE_TYPE, props });
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const field: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: `1.5px solid ${INK}`,
    borderRadius: 4,
    padding: "4px 6px",
    background: "#fff",
    color: INK,
    textAlign: "center",
    resize: "none",
  };
  return (
    <HTMLContainer
      style={{
        pointerEvents: "all",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 6,
        padding: 10,
        boxSizing: "border-box",
        width: shape.props.w,
        height: layout(shape.props).h,
        background: "rgba(255,255,255,0.92)",
        borderRadius: RADIUS,
      }}
      onPointerDown={stop}
      onKeyDown={(e) => {
        if (e.key === "Escape" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
          editor.complete();
        }
        e.stopPropagation();
      }}
    >
      <textarea
        autoFocus
        aria-label="Label"
        placeholder="Label"
        rows={Math.max(1, lines(shape.props.label).length)}
        value={shape.props.label}
        onChange={(e) => update({ label: e.target.value })}
        style={{ ...field, fontFamily: `'${FONT.mono}', monospace`, fontWeight: 700, fontSize: 13 }}
      />
      <textarea
        aria-label="Sub-label"
        placeholder="Sub-label (optional)"
        rows={Math.max(1, lines(shape.props.sublabel).length)}
        value={shape.props.sublabel}
        onChange={(e) => update({ sublabel: e.target.value })}
        style={{ ...field, fontFamily: `'${FONT.body}', sans-serif`, fontSize: 11 }}
      />
    </HTMLContainer>
  );
}

function NodeComponent({ shape }: { shape: NodeShape }) {
  const editor = useEditor();
  const isEditing = useValue("editing", () => editor.getEditingShapeId() === shape.id, [
    editor,
    shape.id,
  ]);
  return (
    <>
      <SVGContainer style={{ overflow: "visible" }}>
        <NodeSvg shape={shape} />
      </SVGContainer>
      {isEditing ? <NodeEditor shape={shape} /> : null}
    </>
  );
}

export class NodeShapeUtil extends ShapeUtil<NodeShape> {
  static override type = NODE_TYPE;
  static override props = {
    w: T.number,
    h: T.number,
    label: T.string,
    sublabel: T.string,
    iconBody: T.string,
    iconViewBox: T.string,
    iconColor: T.string,
  };

  getDefaultProps(): NodeShape["props"] {
    return {
      w: 150,
      h: 110,
      label: "Service",
      sublabel: "",
      iconBody: "",
      iconViewBox: "0 0 24 24",
      iconColor: INK,
    };
  }

  override canEdit() {
    return true;
  }

  override getFontFaces() {
    return SITE_FONT_FACES;
  }

  override getText(shape: NodeShape) {
    return [shape.props.label, shape.props.sublabel].filter(Boolean).join("\n");
  }

  getGeometry(shape: NodeShape) {
    return new Rectangle2d({ width: shape.props.w, height: layout(shape.props).h, isFilled: true });
  }

  override onResize(shape: NodeShape, info: TLResizeInfo<NodeShape>) {
    const next = resizeBox(shape, info, { minWidth: 90, minHeight: 60 });
    return next;
  }

  component(shape: NodeShape) {
    return <NodeComponent shape={shape} />;
  }

  override toSvg(shape: NodeShape) {
    // Tagged for the blog animation (roles, hover-trace, card pop).
    return (
      <g
        data-sd-node={shape.id}
        data-sd-role={resolveRole(this.editor, shape)}
        data-sd-label={shape.props.label.split("\n")[0] || undefined}
        data-sd-w={shape.props.w}
        data-sd-h={layout(shape.props).h}
      >
        <NodeSvg shape={shape} />
      </g>
    );
  }

  getIndicatorPath(shape: NodeShape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, layout(shape.props).h, RADIUS);
    return path;
  }
}
