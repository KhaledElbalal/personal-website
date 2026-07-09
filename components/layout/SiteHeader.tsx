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
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-page transition-shadow duration-200 ${
        scrolled ? "shadow-[0_4px_16px_rgba(18,20,32,0.12)]" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-[height] duration-200 sm:px-10 ${
          scrolled ? "h-[60px] md:h-[64px]" : "h-[76px] md:h-[95px]"
        }`}
      >
        <Link
          href="/"
          aria-label="Khaled Elbalal — home"
          className={`transition-[font-size] duration-200 ${
            scrolled ? "text-[24px] md:text-[28px]" : "text-[26px] md:text-[40px]"
          }`}
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
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="#contact">Contact Me</Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] md:hidden"
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

      <nav
        id="mobile-nav"
        aria-label="Primary"
        className={`${open ? "block" : "hidden"} border-t border-black/10 px-6 pb-5 pt-3 md:hidden`}
      >
        <ul className="flex flex-col gap-4">
          {NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                active={isActive(item.href)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li className="pt-1">
            <Button href="#contact" onClick={() => setOpen(false)}>
              Contact Me
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
