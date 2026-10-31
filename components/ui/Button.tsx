import type { HTMLAttributes, ReactNode } from "react";

type ButtonProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  variant?: "primary" | "neutral";
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

// One shape site-wide: flat, square-cornered, 44px tall.
const base =
  "press inline-flex h-11 items-center justify-center whitespace-nowrap px-5 font-body text-[1.0625rem] font-semibold leading-none no-underline";

const variants = {
  primary: "bg-ink text-on-accent hover:bg-[color:var(--accent-text)]",
  neutral: "bg-placeholder text-black hover:bg-accent-soft",
} as const;

export function Button({
  children = "Contact Me",
  variant = "primary",
  href,
  target,
  rel,
  type = "button",
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} className={cls} {...rest}>
      {children}
    </button>
  );
}
