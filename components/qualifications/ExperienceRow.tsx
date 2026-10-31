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
      className={`reveal grid grid-cols-1 gap-x-10 gap-y-3 py-8 first:pt-0 sm:grid-cols-[170px_minmax(0,1fr)] lg:grid-cols-[170px_minmax(0,5fr)_minmax(0,6fr)] ${className}`}
    >
      <div className="text-sm">
        <div className="font-semibold tabular-nums text-[color:var(--accent-text)]">
          {dateRange}
        </div>
        {location ? <div className="mt-1 text-muted">{location}</div> : null}
      </div>
      <div>
        <h3 className="m-0 text-[length:var(--step-row)] font-semibold leading-tight text-black">
          {title}
        </h3>
        {company ? <p className="m-0 mt-1 text-[1.0625rem] text-ink">{company}</p> : null}
      </div>
        {bullets.length > 0 ? (
          <ul className="flex max-w-[60ch] list-none flex-col gap-2.5 p-0 sm:col-start-2 lg:col-start-3 lg:row-start-1">
            {bullets.map((b) => (
              <li key={b} className="text-[1.0625rem] leading-relaxed text-ink">
                {b}
              </li>
            ))}
          </ul>
        ) : null}
    </div>
  );
}
