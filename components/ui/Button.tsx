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

const base =
  "inline-flex h-[35px] items-center justify-center whitespace-nowrap rounded-[4px] px-[14px] font-mono text-base font-bold leading-none no-underline transition duration-100 hover:brightness-105 active:translate-y-px";

const variants = {
  primary: "bg-accent text-on-accent",
  neutral: "bg-placeholder text-black",
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
