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
      className={`reveal grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 py-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-6 ${className}`}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary external issuer logos
        <img
          src={logo}
          alt={logoAlt}
          width={72}
          height={72}
          loading="lazy"
          className="h-14 w-14 bg-section object-contain sm:h-[72px] sm:w-[72px]"
        />
      ) : (
        <div aria-hidden="true" className="h-14 w-14 bg-section sm:h-[72px] sm:w-[72px]" />
      )}
      <div>
        <div className="text-[1.0625rem] font-medium text-black">{name}</div>
        {issuer ? <div className="mt-1 text-sm text-muted">{issuer}</div> : null}
      </div>
      <span className="text-sm tabular-nums text-muted">{date}</span>
    </div>
  );
}
