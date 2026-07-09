export type TimelineEntry = {
  hash: string;
  text: string;
  ref?: string;
  date?: string;
  detail?: string;
};

const DEFAULT_ENTRIES: TimelineEntry[] = [
  {
    hash: "e7a2f1",
    text: "feat: graduate with SymplifAI — BSc Data Science, honors",
    ref: "HEAD",
    date: "Jul 2025",
    detail:
      "Led a 6-member AutoML graduation project — benchmarked across 97 datasets, deployed on Azure — nominated for the Dell EMPOWER Hackathon representing Cairo University.",
  },
  {
    hash: "c41b09",
    text: "feat: join Cegedim as Software Engineer",
    date: "Oct 2024",
    detail:
      "Rewrote a pipeline processing 100M+ FHIR records (12h → under 2h) and ship backend features across a Java + Spring multi-service architecture.",
  },
  {
    hash: "9d03aa",
    text: "feat: intern at Cegedim",
    date: "Aug 2024",
    detail:
      "Custom NiFi processor outperformed the proposed Spark solution — adopted as the basis of an internal product.",
  },
  {
    hash: "77c2e4",
    text: "tag: ECPC Finalist",
    ref: "contest",
    date: "Aug 2024",
    detail: "Reached the Egyptian Collegiate Programming Contest finals.",
  },
  {
    hash: "4f8d12",
    text: "feat: intern at Nestlé — H2R team",
    date: "Jul 2023",
    detail:
      "Framed the H2R contact-center problem as semantic text similarity and built a custom AI-powered application.",
  },
  {
    hash: "b2e871",
    text: "tag: Codeforces Specialist",
    ref: "contest",
    date: "Mar 2023",
    detail: "Steady contest grind alongside coursework.",
  },
  {
    hash: "1a44c7",
    text: "feat: enroll at Cairo University — Data Science",
    date: "Oct 2021",
    detail:
      "BSc Computers & Information, Faculty of Computers & Artificial Intelligence — GPA 3.76 / 4.0.",
  },
  {
    hash: "0c19ef",
    text: "init: junior web developer at Syncore",
    date: "Sep 2019",
    detail:
      "Part-time through high school and first year of university — Agile client work, clean and documented code.",
  },
];

type TimelineProps = {
  entries?: TimelineEntry[];
  command?: string;
  className?: string;
};

export function Timeline({
  entries = DEFAULT_ENTRIES,
  command = "git log --oneline",
  className = "",
}: TimelineProps) {
  return (
    <div className={className}>
      <div className="mb-4 font-mono text-[13px] font-bold text-accent">
        <span className="text-muted">$</span> {command}{" "}
        <span className="font-normal text-muted">
          # hover a commit to git show it
        </span>
      </div>
      <ul className="m-0 list-none p-0">
        {entries.map((e) => (
          <li
            key={e.hash}
            className="group border-t border-black/[0.12] px-1 py-3.5 last:border-b"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex-none font-mono text-[13px] text-muted">
                {e.hash}
              </span>
              <span className="min-w-0 font-mono text-sm font-bold text-black transition-colors duration-150 group-hover:text-accent">
                {e.text}
              </span>
              {e.ref ? (
                <span className="flex-none font-mono text-[12.5px] font-bold text-accent">
                  ({e.ref})
                </span>
              ) : null}
              {e.date ? (
                <span className="ml-auto flex-none whitespace-nowrap font-mono text-xs text-muted">
                  {e.date}
                </span>
              ) : null}
            </div>
            {e.detail ? (
              <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:mt-2.5 group-hover:max-h-24 group-hover:opacity-100">
                <p className="m-0 max-w-[760px] font-body text-[13.5px] leading-[1.55] text-muted">
                  {e.detail}
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
