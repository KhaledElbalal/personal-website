import type { HTMLAttributes } from "react";

type WordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "mark" | "lockup";
  tone?: "light" | "dark";
  name?: string;
};

export function Wordmark({
  variant = "mark",
  tone = "light",
  name = "KHALED\nELBALAL",
  className = "",
  ...rest
}: WordmarkProps) {
  if (variant === "lockup") {
    const [line1, line2] = name.toUpperCase().split("\n");
    return (
      <span
        aria-label={name.replace("\n", " ")}
        className={`relative inline-block whitespace-nowrap text-center font-logo font-extrabold leading-[1.2] tracking-[0.04em] text-[color:var(--color-xiketic)] ${className}`}
        {...rest}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-[-0.15em] top-[0.41em] h-[1.57em] bg-accent-bright"
        />
        <span className="relative">{line1}</span>
        {line2 ? (
          <>
            <br />
            <span className="relative">{line2}</span>
          </>
        ) : null}
      </span>
    );
  }

  const dark = tone === "dark";
  return (
    <span
      aria-label="Khaled Elbalal"
      className={`inline-flex items-center whitespace-nowrap font-mono font-bold leading-none ${dark ? "text-on-accent" : "text-[color:var(--color-xiketic)]"} ${className}`}
      {...rest}
    >
      <span aria-hidden="true" className={dark ? "text-accent-bright" : "text-accent"}>
        [
      </span>
      <span>K</span>
      <span
        aria-hidden="true"
        className="ml-[0.14em] inline-block h-[0.88em] w-[0.22em] animate-caret-blink bg-accent-bright"
      />
      <span aria-hidden="true" className={dark ? "text-accent-bright" : "text-accent"}>
        ]
      </span>
    </span>
  );
}
