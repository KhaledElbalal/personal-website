type Skill = {
  _id: string;
  role: string | null;
  description?: string | null;
  items?: string[] | null;
};

/** What he works on: one big line per discipline on a field of ink. */
export function Capabilities({ skills }: { skills: Skill[] }) {
  return (
    <section
      aria-labelledby="skills-heading"
      className="page-margin bg-[color:var(--color-xiketic)] py-24 text-on-accent md:py-40"
    >
      <h2 id="skills-heading" className="sr-only">
        What I work on
      </h2>
      <ul className="flex flex-col gap-16 md:gap-24">
        {skills.map((s, i) => (
          <li
            key={s._id}
            className="reveal grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-end md:gap-12"
            style={{ "--i": i } as React.CSSProperties}
          >
            <h3 className="text-[length:var(--step-head)] font-bold leading-[0.95] tracking-[-0.03em]">
              {s.role}
            </h3>
            <div className="max-w-[46ch]">
              {s.description ? (
                <p className="text-[1.0625rem] leading-relaxed text-on-accent">
                  {s.description}
                </p>
              ) : null}
              {s.items?.length ? (
                <p className="mt-4 text-[1.0625rem] font-medium leading-relaxed text-accent-bright">
                  {s.items.join(" · ")}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
