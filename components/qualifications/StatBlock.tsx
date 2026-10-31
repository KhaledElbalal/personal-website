type StatBlockProps = {
  value: string;
  label: string;
  className?: string;
};

export function StatBlock({ value, label, className = "" }: StatBlockProps) {
  return (
    <div className={`reveal ${className}`}>
      <div className="text-[length:var(--step-head)] font-bold leading-[0.95] tracking-[-0.03em] text-black">
        {value}
      </div>
      <div className="mt-2 text-[1.0625rem] text-ink">{label}</div>
    </div>
  );
}
