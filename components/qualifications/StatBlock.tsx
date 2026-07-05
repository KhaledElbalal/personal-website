type StatBlockProps = {
  value: string;
  label: string;
  className?: string;
};

export function StatBlock({ value, label, className = "" }: StatBlockProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="font-mono text-[32px] font-bold leading-none text-accent">
        {value}
      </div>
      <div className="mt-1.5 font-mono text-xs text-muted">{label}</div>
    </div>
  );
}
