import type { HTMLAttributes, ReactNode } from "react";

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  size?: "micro" | "chip" | "outline";
};

const variants = {
  micro:
    "inline-flex h-[22px] min-w-[78px] items-center justify-center whitespace-pre-line rounded-[4px] bg-tag px-1.5 text-center indent-[0.52em] font-mono text-[6px] font-bold leading-[1.1] tracking-[0.52em] text-tag-fg",
  chip: "inline-flex h-[41px] items-center whitespace-nowrap rounded-[4px] bg-accent px-4 indent-[0.35em] font-mono text-xs font-bold uppercase leading-none tracking-[0.35em] text-on-accent",
  outline:
    "inline-flex h-[26px] items-center whitespace-nowrap rounded-[4px] border-[1.5px] border-accent bg-transparent px-3 indent-[0.2em] font-mono text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-accent",
} as const;

export function Tag({
  children = "ML\nPROJECT",
  size = "micro",
  className = "",
  ...rest
}: TagProps) {
  return (
    <span className={`${variants[size]} ${className}`} {...rest}>
      {children}
    </span>
  );
}
