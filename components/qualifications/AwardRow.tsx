type AwardRowProps = {
  title: string;
  date: string;
  className?: string;
};

export function AwardRow({ title, date, className = "" }: AwardRowProps) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3.5 border-t border-black/10 py-4 ${className}`}
    >
      <span className="font-mono text-[15px] font-bold text-black">{title}</span>
      <span className="font-mono text-xs text-muted">{date}</span>
    </div>
  );
}
