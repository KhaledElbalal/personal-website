type AwardRowProps = {
  title: string;
  date: string;
  className?: string;
};

export function AwardRow({ title, date, className = "" }: AwardRowProps) {
  return (
    <div
      className={`reveal grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 py-3 ${className}`}
    >
      <span className="text-[1.0625rem] font-medium text-black">{title}</span>
      <span className="text-sm tabular-nums text-muted">{date}</span>
    </div>
  );
}
