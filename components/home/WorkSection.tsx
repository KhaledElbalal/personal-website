import Link from "next/link";

import { WorkLedger, type LedgerRow } from "@/components/home/WorkLedger";

export function WorkSection({ rows }: { rows: LedgerRow[] }) {
  return (
    <section aria-labelledby="work-heading" className="page-margin py-24 md:py-40">
      <div className="reveal mb-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 md:mb-12 md:w-[62%]">
        <h2 id="work-heading" className="text-[length:var(--step-lead)] font-semibold text-black">
          Selected work
        </h2>
        <Link
          href="/projects"
          className="text-[1.0625rem] font-medium underline decoration-2 underline-offset-4 hover:text-[color:var(--accent-text)]"
        >
          All projects
        </Link>
      </div>
      {rows.length ? (
        <WorkLedger rows={rows} />
      ) : (
        <p className="text-[1.0625rem] text-ink">
          More work coming soon.
        </p>
      )}
    </section>
  );
}
