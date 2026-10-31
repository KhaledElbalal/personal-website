import type { CSSProperties } from "react";

const JEANS = "var(--color-blue-jeans)";
const MAYA = "var(--color-maya-blue)";
const PALE = "#cfeeff";

function Hl({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <mark className="hl" style={{ backgroundColor: c } as CSSProperties}>
      {children}
    </mark>
  );
}

/**
 * One statement at lead size, then the record in two justified columns on the
 * right. Highlighted words mark the facts a scanning reader wants; the last
 * sentence is the way to the contact field.
 */
export function About({ contactHref }: { contactHref: string }) {
  return (
    <section aria-labelledby="about-heading" className="page-margin py-24 md:py-40">
      <h2 id="about-heading" className="sr-only">
        About
      </h2>
      <p className="reveal text-[length:var(--step-lead)] font-medium leading-[1.18] text-black md:max-w-[38ch]">
        Khaled Ibrahim builds intelligent systems and competes in programming
        contests for sport.
      </p>
      <p className="reveal mt-12 hyphens-auto text-[1.0625rem] leading-[1.6] text-ink md:ml-[44%] md:columns-2 md:gap-8 md:text-justify">
        He graduated in Data Science from <Hl c={JEANS}>Cairo University</Hl>,
        leading a six-person team on <Hl c={MAYA}>SymplifAI</Hl>, an AutoML
        pipeline benchmarked across 97 datasets. Since October 2024 he has
        worked at <Hl c={PALE}>Cegedim</Hl>, where he rewrote a pipeline that
        processes more than <Hl c={JEANS}>100 million FHIR records</Hl>, taking
        it from <Hl c={MAYA}>twelve hours to under two</Hl>. Before that he
        interned at Nestlé on the H2R contact-centre problem and, since 2019,
        has built client websites as a junior developer. He is a{" "}
        <Hl c={PALE}>Codeforces Specialist</Hl> and a finalist at the Egyptian
        Collegiate Programming Contest, and right now he is building Roomba, an
        agentic AI for coding tasks.{" "}
        <a
          href={contactHref}
          className="press font-medium text-black underline decoration-2 underline-offset-4 hover:text-[color:var(--accent-text)]"
        >
          If something hard needs building, write to him.
        </a>
      </p>
    </section>
  );
}
