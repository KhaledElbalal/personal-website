"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, NavLink, Wordmark } from "@/components/ui";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Qualifications", href: "/qualifications" },
  { label: "Blog", href: "/blog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Tabs read left to right: moving right slides the page left, and back.
  const indexOf = (path: string) =>
    NAV.findIndex((n) => (n.href === "/" ? path === "/" : path.startsWith(n.href)));
  const directionTo = (href: string) => {
    const from = indexOf(pathname);
    const to = indexOf(href);
    if (from < 0 || to < 0 || from === to) return undefined;
    return [to > from ? "nav-forward" : "nav-back"];
  };

  // Navigating (incl. back/forward) closes the overlay.
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  // While the overlay is up: lock page scroll, Escape closes it, and growing
  // past md (where the overlay doesn't exist) closes it too.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50 bg-page"
      // Named so view transitions keep the bar fixed while the page swaps.
      style={{ viewTransitionName: "site-header" }}
    >
      {/* relative z-10: the bar (wordmark + toggle) stays above the overlay. */}
      <div
        className="page-margin relative z-10 flex h-[4.5rem] items-center justify-between md:h-20"
      >
        <Link
          href="/"
          transitionTypes={directionTo("/")}
          aria-label="Khaled Ibrahim — home"
          className="text-[28px] md:text-[32px]"
        >
          <Wordmark />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              active={isActive(item.href)}
              transitionTypes={directionTo(item.href)}
              morph
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="#contact">Contact</Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span className="relative block h-4 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 h-0.5 w-6 bg-ink transition-all duration-200 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-6 bg-ink transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 bg-ink transition-all duration-200 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile: full-screen overlay under the bar rather than a panel that
          pushes the page down. Kept mounted so it can fade; `invisible`
          removes it from focus order and the a11y tree while closed. */}
      <nav
        id="mobile-nav"
        aria-label="Primary"
        className={`fixed inset-0 flex flex-col bg-page px-6 pb-10 pt-[calc(4.5rem+2rem)] transition-[opacity,visibility] duration-200 sm:px-10 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-7">
          {NAV.map((item, i) => (
            <li
              key={item.href}
              className={`transition-[opacity,translate] duration-300 ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
            >
              <NavLink
                href={item.href}
                active={isActive(item.href)}
                transitionTypes={directionTo(item.href)}
                onClick={() => setOpen(false)}
                className="text-[2rem]!"
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <Button href="#contact" onClick={() => setOpen(false)}>
            Contact
          </Button>
        </div>
      </nav>
    </header>
  );
}
