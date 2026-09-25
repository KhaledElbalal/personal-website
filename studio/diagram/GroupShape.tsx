// Boundary frame (VPC, subnet, AZ, security group…) in AWS's architecture-
// diagram convention: coloured outline, optional corner icon, label in the
// header. Frame-like, so shapes dropped inside move with it.
import {
  BaseFrameLikeShapeUtil,
  HTMLContainer,
  SVGContainer,
  T,
  type TLShape,
  useEditor,
  useValue,
} from "tldraw";

import { FONT, SITE_FONT_FACES } from "./theme";

export const GROUP_TYPE = "sd-group";

declare module "tldraw" {
  export interface TLGlobalShapePropsMap {
    [GROUP_TYPE]: {
      w: number;
      h: number;
      label: string;
      stroke: string;
      fill: string;
      dashed: boolean;
      iconBody: string;
      iconViewBox: string;
      iconColor: string;
    };
  }
}

export type GroupShape = TLShape<typeof GROUP_TYPE>;

const ICON = 24;
const HEADER = 32;
const LABEL_SIZE = 13;
const STROKE = 1.5;

function GroupSvg({ shape }: { shape: GroupShape }) {
  const p = shape.props;
  const hasIcon = Boolean(p.iconBody);
  const textX = hasIcon ? ICON + 10 : 12;
  return (
    <g>
      <rect
        x={STROKE / 2}
        y={STROKE / 2}
        width={p.w - STROKE}
        height={p.h - STROKE}
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth={STROKE}
        strokeDasharray={p.dashed ? "6 5" : undefined}
      />
      {hasIcon ? (
        <svg
          x={0}
          y={0}
          width={ICON}
          height={ICON}
          viewBox={p.iconViewBox}
          color={p.iconColor}
          style={{ color: p.iconColor }}
          dangerouslySetInnerHTML={{ __html: p.iconBody }}
        />
      ) : null}
      {p.label ? (
        <text
          x={textX}
          y={HEADER / 2 + LABEL_SIZE / 2 - 5}
          fontFamily={`'${FONT.mono}', monospace`}
          fontWeight={700}
          fontSize={LABEL_SIZE}
          fill={p.stroke}
        >
          {p.label}
        </text>
      ) : null}
    </g>
  );
}

function GroupLabelEditor({ shape }: { shape: GroupShape }) {
  const editor = useEditor();
  const hasIcon = Boolean(shape.props.iconBody);
  return (
    <HTMLContainer
      style={{ pointerEvents: "all", width: shape.props.w, height: HEADER }}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") editor.complete();
        e.stopPropagation();
      }}
    >
      <input
        autoFocus
        aria-label="Group label"
        value={shape.props.label}
        onChange={(e) =>
          editor.updateShape<GroupShape>({
            id: shape.id,
            type: GROUP_TYPE,
            props: { label: e.target.value },
          })
        }
        style={{
          position: "absolute",
          left: hasIcon ? ICON + 6 : 6,
          top: 2,
          width: Math.max(120, shape.props.w - ICON - 16),
          border: `1.5px solid ${shape.props.stroke}`,
          borderRadius: 4,
          padding: "2px 6px",
          fontFamily: `'${FONT.mono}', monospace`,
          fontWeight: 700,
          fontSize: LABEL_SIZE,
          color: shape.props.stroke,
          background: "#fff",
        }}
      />
    </HTMLContainer>
  );
}

function GroupComponent({ shape }: { shape: GroupShape }) {
  const editor = useEditor();
  const isEditing = useValue("editing", () => editor.getEditingShapeId() === shape.id, [
    editor,
    shape.id,
  ]);
  return (
    <>
      <SVGContainer>
        <GroupSvg shape={shape} />
      </SVGContainer>
      {isEditing ? <GroupLabelEditor shape={shape} /> : null}
    </>
  );
}

export class GroupShapeUtil extends BaseFrameLikeShapeUtil<GroupShape> {
  static override type = GROUP_TYPE;
  static override props = {
    w: T.number,
    h: T.number,
    label: T.string,
    stroke: T.string,
    fill: T.string,
    dashed: T.boolean,
    iconBody: T.string,
    iconViewBox: T.string,
    iconColor: T.string,
  };

  getDefaultProps(): GroupShape["props"] {
    return {
      w: 420,
      h: 280,
      label: "Group",
      stroke: "#121420",
      fill: "transparent",
      dashed: true,
      iconBody: "",
      iconViewBox: "0 0 24 24",
      iconColor: "#121420",
    };
  }

  // Cards' offset shadows sit outside their bounds — don't clip children.
  override getClipPath() {
    return undefined;
  }

  override canEdit() {
    return true;
  }

  override getFontFaces() {
    return SITE_FONT_FACES;
  }

  override getText(shape: GroupShape) {
    return shape.props.label;
  }

  component(shape: GroupShape) {
    return <GroupComponent shape={shape} />;
  }

  override toSvg(shape: GroupShape) {
    return <GroupSvg shape={shape} />;
  }

  getIndicatorPath(shape: GroupShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
