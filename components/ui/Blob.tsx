"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type BlobProps = {
  size?: number;
  variant?: "ball" | "cluster";
  interactive?: "none" | "follow";
  strength?: number;
  className?: string;
};

export function Blob({
  size = 560,
  variant = "ball",
  interactive = "none",
  strength = 48,
  className = "",
}: BlobProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || interactive === "none") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const s = strength;
    let raf = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2 - x);
      const dy = e.clientY - (r.top + r.height / 2 - y);
      tx = Math.max(-s, Math.min(s, dx * 0.08));
      ty = Math.max(-s, Math.min(s, dy * 0.08));
    };

    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      el.style.transform = "";
    };
  }, [interactive, strength]);

  const style = {
    "--blob-size": `min(${size}px, 80vw)`,
    willChange: interactive === "none" ? undefined : "transform",
  } as CSSProperties;

  if (variant === "cluster") {
    return (
      <div
        ref={ref}
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
      ref={ref}
      aria-hidden="true"
      style={style}
      className={`pointer-events-none aspect-square w-[var(--blob-size)] rounded-full [background:var(--blob-gradient)] ${className}`}
    />
  );
}
