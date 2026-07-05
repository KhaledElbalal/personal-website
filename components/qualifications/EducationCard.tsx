import { Tag } from "@/components/ui";

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
      className={`grid grid-cols-1 gap-4 rounded-[8px] border-[1.5px] border-[color:var(--color-xiketic)] p-[30px] shadow-[-6px_6px_0_rgba(0,103,168,0.30)] sm:grid-cols-[minmax(0,1fr)_auto] ${className}`}
    >
      <div className="order-1 sm:col-start-1 sm:row-start-1">
        <h3 className="m-0 font-mono text-[22px] font-bold leading-tight text-[color:var(--color-xiketic)]">
          <span className="block sm:inline">{degree}</span>
          {institution ? (
            <>
              <span aria-hidden="true" className="hidden sm:inline">
                {" — "}
              </span>
              <span className="block sm:inline">{institution}</span>
            </>
          ) : null}
        </h3>
        {subtitle ? (
          <p className="mt-2 font-body text-[15px] leading-[1.6] text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>

      {metricValue || dateRange ? (
        <div className="order-2 sm:col-start-2 sm:row-start-1 sm:text-right">
          {metricValue ? (
            <div className="font-mono text-[32px] font-bold text-accent">
              {metricValue}
              {metricLabel ? (
                <span className="text-base text-muted"> {metricLabel}</span>
              ) : null}
            </div>
          ) : null}
          {dateRange ? (
            <div className="mt-1 font-mono text-xs text-muted">{dateRange}</div>
          ) : null}
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="order-3 flex flex-wrap gap-2.5 sm:col-start-1 sm:row-start-2">
          {tags.map((t) => (
            <Tag key={t} size="chip">
              {t}
            </Tag>
          ))}
        </div>
      ) : null}
    </div>
  );
}
