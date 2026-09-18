"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type BlobProps = {
  size?: number;
  variant?: "ball" | "cluster";
  interactive?: "none" | "follow" | "repel" | "drift" | "parallax";
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
    const phase = Math.random() * Math.PI * 2;
    let raf = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - x;
      const cy = r.top + r.height / 2 - y;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (interactive === "follow") {
        tx = Math.max(-s, Math.min(s, dx * 0.08));
        ty = Math.max(-s, Math.min(s, dy * 0.08));
      } else if (interactive === "repel") {
        const dist = Math.hypot(dx, dy);
        const reach = Math.max(r.width, 420);
        const f = Math.max(0, 1 - dist / reach);
        tx = dist ? (-dx / dist) * s * f : 0;
        ty = dist ? (-dy / dist) * s * f : 0;
      }
    };

    const onScroll = () => {
      ty = Math.max(-s, Math.min(s, -window.scrollY * 0.12));
    };

    const tick = (t: number) => {
      if (interactive === "drift") {
        tx = Math.sin(t * 0.00035 + phase) * s * 0.7;
        ty = Math.cos(t * 0.00027 + phase) * s * 0.7;
      }
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      raf = requestAnimationFrame(tick);
    };

    if (interactive === "follow" || interactive === "repel") {
      window.addEventListener("mousemove", onMove);
    }
    if (interactive === "parallax") {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      el.style.transform = "";
    };
  }, [interactive, strength]);

  const style = {
    "--blob-size": `min(${size}px, 80vw)`,
    willChange: interactive === "none" ? undefined : "transform",
  } as CSSProperties;

  if (variant === "cluster") {
    // The outer element carries the caller's own positioning class (often
    // `absolute ...`) — it must not hardcode a conflicting `relative` here,
    // since Tailwind's utility order lets `.relative` beat a later `.absolute`
    // regardless of className order. The inner wrapper supplies the
    // positioning context for the three ellipses instead.
    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={style}
        className={`pointer-events-none h-[calc(var(--blob-size)*0.9612)] w-[var(--blob-size)] ${className}`}
      >
        <div className="relative h-full w-full">
          <span className="absolute left-[35.03%] top-0 aspect-square w-[64.97%] rounded-full [background:var(--blob-gradient-faint)]" />
          <span className="absolute left-[31.12%] top-[36.52%] aspect-square w-[61.05%] rounded-full [background:var(--blob-gradient-faint)]" />
          <span className="absolute left-[0.26%] top-[9.34%] aspect-square w-[64.97%] rounded-full [background:var(--blob-gradient-faint)]" />
        </div>
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
