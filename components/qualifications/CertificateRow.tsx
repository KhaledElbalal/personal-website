type CertificateRowProps = {
  logo?: string;
  logoAlt?: string;
  name: string;
  issuer?: string;
  date: string;
  className?: string;
};

export function CertificateRow({
  logo,
  logoAlt = "",
  name,
  issuer,
  date,
  className = "",
}: CertificateRowProps) {
  return (
    <div
      className={`grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 border-t border-black/10 py-[18px] sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:gap-6 ${className}`}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary external issuer logos
        <img
          src={logo}
          alt={logoAlt}
          className="h-16 w-16 rounded-[4px] bg-section object-contain"
        />
      ) : (
        <div aria-hidden="true" className="h-16 w-16 rounded-[4px] bg-section" />
      )}
      <div>
        <div className="font-mono text-base font-bold text-black">{name}</div>
        {issuer ? (
          <div className="mt-1 font-mono text-[12.5px] text-muted">{issuer}</div>
        ) : null}
      </div>
      <span className="font-mono text-xs text-muted">{date}</span>
    </div>
  );
}
