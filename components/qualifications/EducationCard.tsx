type EducationCardProps = {
  degree: string;
  institution?: string;
  subtitle?: string;
  tags?: string[];
  metricValue?: string;
  metricLabel?: string;
  dateRange?: string;
  className?: string;
};

/** The degree as a field of ink: the grade is the largest thing in it. */
export function EducationCard({
  degree,
  institution,
  subtitle,
  tags = [],
  metricValue,
  metricLabel,
  dateRange,
  className = "",
}: EducationCardProps) {
  return (
    <div
      className={` reveal grid grid-cols-1 gap-x-10 gap-y-8 bg-[color:var(--color-xiketic)] p-6 text-on-accent md:grid-cols-[minmax(0,1fr)_auto] md:p-10 ${className}`}
    >
      <div>
        <h3 className="m-0 text-[length:var(--step-lead)] font-semibold leading-tight">
          {degree}
          {institution ? (
            <span className="block font-normal text-[color:#b9bccb]">{institution}</span>
          ) : null}
        </h3>
        {subtitle ? (
          <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-on-accent">
            {subtitle}
          </p>
        ) : null}
        {tags.length > 0 ? (
          <p className="mt-6 text-[1.0625rem] font-medium text-accent-bright">
            {tags.join(" · ")}
          </p>
        ) : null}
      </div>

      {metricValue || dateRange ? (
        <div className="md:text-right">
          {metricValue ? (
            <div className="text-[length:var(--step-head)] font-bold leading-[0.95] tracking-[-0.03em] text-accent-bright">
              {metricValue}
              {metricLabel ? (
                <span className="ml-2 text-[1.0625rem] font-normal tracking-normal text-[color:#b9bccb]">
                  {metricLabel}
                </span>
              ) : null}
            </div>
          ) : null}
          {dateRange ? (
            <div className="mt-2 text-sm tabular-nums text-[color:#b9bccb]">
              {dateRange}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
