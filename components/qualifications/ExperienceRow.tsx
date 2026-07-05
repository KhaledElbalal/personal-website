type ExperienceRowProps = {
  dateRange: string;
  location?: string;
  title: string;
  company?: string;
  bullets?: string[];
  className?: string;
};

export function ExperienceRow({
  dateRange,
  location,
  title,
  company,
  bullets = [],
  className = "",
}: ExperienceRowProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-x-10 gap-y-3 border-t border-black/10 py-6 sm:grid-cols-[200px_minmax(0,1fr)] ${className}`}
    >
      <div>
        <div className="font-mono text-sm font-bold text-accent">{dateRange}</div>
        {location ? (
          <div className="mt-1.5 font-mono text-xs text-muted">{location}</div>
        ) : null}
      </div>
      <div>
        <h3 className="m-0 font-mono text-xl font-bold leading-tight text-[color:var(--color-xiketic)]">
          <span className="block sm:inline">{title}</span>
          {company ? (
            <>
              <span aria-hidden="true" className="hidden sm:inline">
                {" — "}
              </span>
              <span className="block sm:inline">{company}</span>
            </>
          ) : null}
        </h3>
        {bullets.length > 0 ? (
          <ul className="mt-3.5 flex list-none flex-col gap-2.5 p-0">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex gap-3 font-body text-[15px] leading-[1.6] text-ink"
              >
                <span aria-hidden="true" className="font-mono font-bold text-accent">
                  »
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
