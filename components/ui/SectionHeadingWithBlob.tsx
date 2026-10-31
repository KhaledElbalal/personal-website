import type { ReactNode } from "react";

import { SectionHeading } from "./SectionHeading";

type SectionHeadingWithBlobProps = {
  id?: string;
  children?: ReactNode;
  className?: string;
};

/** Section heading. Kept under its old name (the blob is gone) so the
 * showcase page and any other call site keep compiling. */
export function SectionHeadingWithBlob({
  id,
  children,
  className = "",
}: SectionHeadingWithBlobProps) {
  return (
    <SectionHeading as="h2" id={id} className={className}>
      {children}
    </SectionHeading>
  );
}
