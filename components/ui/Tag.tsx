import type { HTMLAttributes, ReactNode } from "react";

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  size?: "micro" | "chip" | "outline";
};

// One flat chip: a tone step of the accent, sentence case, readable size.
// The old three sizes collapse into it; `size` stays so call sites compile.
const chip =
  "inline-flex h-8 items-center whitespace-nowrap bg-[color:#dff1fd] px-3 text-sm font-medium leading-none text-[color:var(--color-xiketic)]";

export function Tag({
  children = "ML project",
  size: _size,
  className = "",
  ...rest
}: TagProps) {
  void _size;
  return (
    <span className={`${chip} ${className}`} {...rest}>
      {children}
    </span>
  );
}
