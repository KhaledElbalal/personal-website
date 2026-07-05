import type { ReactNode } from "react";

type SkillTileProps = {
  children?: ReactNode;
  description?: string;
  items?: string[];
  path?: string;
  className?: string;
};

export function SkillTile({
  children = "Competitive Programmer",
  description,
  items = [],
  path = "~/",
  className = "",
}: SkillTileProps) {
  return (
    <div
      className={`flex min-h-[300px] flex-col overflow-hidden rounded-[8px] bg-[color:var(--color-xiketic)] transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[-6px_6px_0_rgba(0,103,168,0.35)] ${className}`}
    >
      <div className="flex flex-none items-center gap-1.5 bg-white/[0.08] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        <span className="ml-2 font-mono text-[11px] text-white/70">
          khaled@dev: {path}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="font-mono text-[13px] font-bold text-accent-bright">
          <span className="text-white/60">$</span> whoami
        </div>
        <div className="mt-2.5 font-mono text-lg font-bold leading-tight text-on-accent">
          {children}
        </div>
        {description ? (
          <p className="mt-3 font-body text-[13.5px] leading-[1.55] text-white/75">
            {description}
          </p>
        ) : null}
        {items.length > 0 ? (
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <div className="font-mono text-[13px] font-bold text-accent-bright">
              <span className="text-white/60">$</span> ls skills/
            </div>
            <div className="flex flex-wrap gap-x-[1.6em] gap-y-0.5 font-mono text-[13px] leading-[1.6] text-on-accent">
              {items.map((item, i) => (
                <span key={item} className="whitespace-nowrap">
                  {item}
                  {i === items.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="ml-[0.18em] inline-block h-[0.88em] w-[0.22em] animate-caret-blink bg-accent-bright align-[-0.1em]"
                    />
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
