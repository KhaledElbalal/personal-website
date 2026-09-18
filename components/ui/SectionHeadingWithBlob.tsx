import type { ReactNode } from "react";

import { Blob } from "./Blob";
import { SectionHeading } from "./SectionHeading";

type SectionHeadingWithBlobProps = {
  id?: string;
  children?: ReactNode;
  className?: string;
};

/** Section heading with a small follow-blob behind it — Home's About Me /
 * Experience / Recent Work headings and the equivalent showcase demo. */
export function SectionHeadingWithBlob({
  id,
  children,
  className = "",
}: SectionHeadingWithBlobProps) {
  return (
    <div className={`relative mb-10 w-fit ${className}`}>
      <Blob
        size={180}
        interactive="follow"
        className="absolute -left-6 -top-10 z-0"
      />
      <SectionHeading as="h2" id={id} className="relative z-10">
        {children}
      </SectionHeading>
    </div>
  );
}
