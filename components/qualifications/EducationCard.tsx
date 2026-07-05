import { Tag } from "@/components/ui";

type EducationCardProps = {
  title: string;
  subtitle?: string;
  tags?: string[];
  metricValue?: string;
  metricLabel?: string;
  dateRange?: string;
  className?: string;
};

export function EducationCard({
  title,
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
      <div>
        <h3 className="m-0 font-mono text-[22px] font-bold text-[color:var(--color-xiketic)]">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-2 font-body text-[15px] leading-[1.6] text-muted">
            {subtitle}
          </p>
        ) : null}
        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {tags.map((t) => (
              <Tag key={t} size="chip">
                {t}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>
      <div className="sm:text-right">
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
    </div>
  );
}
