"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";

/** Page-level crossfade between routes, driven by the browser's View
 * Transitions API (see the `.page-*` / `.slide-*` rules in globals.css).
 * Keyed by pathname so each route is a distinct element to swap; unrelated
 * updates on a page don't animate. Shared elements (the title morph) and the
 * anchored header are handled outside this boundary. */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition
      key={pathname}
      enter={{ "nav-forward": "slide-in-fwd", "nav-back": "slide-in-back", default: "page-in" }}
      exit={{ "nav-forward": "slide-out-fwd", "nav-back": "slide-out-back", default: "page-out" }}
      default="none"
    >
      <div className="flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
