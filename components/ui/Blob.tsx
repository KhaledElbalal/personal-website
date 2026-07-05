import type { CSSProperties } from "react";

type BlobProps = {
  size?: number;
  variant?: "ball" | "cluster";
  className?: string;
};

export function Blob({ size = 560, variant = "ball", className = "" }: BlobProps) {
  const style = { "--blob-size": `min(${size}px, 80vw)` } as CSSProperties;

  if (variant === "cluster") {
    return (
      <div
        aria-hidden="true"
        style={style}
        className={`pointer-events-none relative h-[calc(var(--blob-size)*0.9612)] w-[var(--blob-size)] ${className}`}
      >
        <span className="absolute left-[35.03%] top-0 aspect-square w-[64.97%] rounded-full [background:var(--blob-gradient-faint)]" />
        <span className="absolute left-[31.12%] top-[36.52%] aspect-square w-[61.05%] rounded-full [background:var(--blob-gradient-faint)]" />
        <span className="absolute left-[0.26%] top-[9.34%] aspect-square w-[64.97%] rounded-full [background:var(--blob-gradient-faint)]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`pointer-events-none aspect-square w-[var(--blob-size)] rounded-full [background:var(--blob-gradient)] ${className}`}
    />
  );
}
