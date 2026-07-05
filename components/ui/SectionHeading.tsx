import type { HTMLAttributes, ReactNode } from "react";

type SectionHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children?: ReactNode;
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  children = "About Me",
  as: Tag = "h2",
  className = "",
  ...rest
}: SectionHeadingProps) {
  return (
    <Tag
      className={`m-0 font-mono text-[clamp(1.75rem,6vw,2.5rem)] font-bold leading-none tracking-[-0.01em] text-ink ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
