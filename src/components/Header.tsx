"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { BrandLogo } from "@/components/BrandLogo";

type HeaderLabels = {
  about: string;
  products: string;
  gifts: string;
  quality: string;
  contact: string;
  menuLabel: string;
};

type HeaderProps = {
  lang: Lang;
  labels: HeaderLabels;
};

const langs: Lang[] = ["hy", "en", "ru"];

export function Header({ lang, labels }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const links = [
    { href: `/${lang}#about`, label: labels.about, cta: false },
    { href: `/${lang}#products`, label: labels.products, cta: false },
    { href: `/${lang}#gifts`, label: labels.gifts, cta: false },
    { href: `/${lang}#quality`, label: labels.quality, cta: false },
    { href: `/${lang}/order`, label: labels.contact, cta: true },
  ];

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const next = window.scrollY > 24;
        setScrolled((prev) => (prev === next ? prev : next));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable: HTMLElement[] = Array.from(
        menuRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []
      );
      if (toggleRef.current) focusable.unshift(toggleRef.current);

      if (focusable.length === 0) return;

      const currentIndex =
        document.activeElement instanceof HTMLElement
          ? focusable.indexOf(document.activeElement)
          : -1;
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusable.length - 1
          : currentIndex - 1
        : currentIndex === focusable.length - 1
          ? 0
          : currentIndex + 1;

      event.preventDefault();
      focusable[nextIndex]?.focus();
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash ?? "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const cleanPath = pathname.replace(/^\/(hy|en|ru)/, "");
  const pathSuffix = cleanPath || "";
  const languageHref = (target: Lang) => `/${target}${pathSuffix}${hash}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex h-[4.5rem] items-center justify-between px-[clamp(1rem,3vw,2.5rem)] transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--line)] bg-[var(--header-bg)]"
          : "border-b border-transparent"
      }`}
    >
      <a
        href={`/${lang}#top`}
        className="z-20 flex min-w-0 items-center"
        aria-label="Sers Honey"
      >
        <BrandLogo
          priority
          className="w-[7.75rem] sm:w-[8.75rem]"
        />
      </a>

      <button
        ref={toggleRef}
        type="button"
        className="mobile-nav-toggle fixed z-50 flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-sm border border-[var(--gold)] bg-[var(--control-bg)] shadow-[0_10px_28px_var(--shadow-color)]"
        aria-label={labels.menuLabel}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={`block h-0.5 w-5 rounded-full bg-[var(--gold-soft)] transition ${open ? "translate-y-[4px] rotate-45" : ""}`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-[var(--gold-soft)] transition ${open ? "-translate-y-[4px] -rotate-45" : ""}`}
        />
      </button>

      <nav className="hidden items-center gap-6 xl:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`text-[0.92rem] text-[var(--muted)] transition duration-300 hover:text-[var(--gold-soft)] ${
              link.cta
                ? "button-ink-hover border border-[var(--gold)] px-4 py-2 text-[var(--gold-soft)] hover:bg-[var(--gold)]"
                : "relative after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-0 after:bg-[var(--gold-soft)] after:transition-[width] after:duration-300 hover:after:w-full"
            }`}
          >
            {link.label}
          </a>
        ))}
        <div className="ml-2 flex items-center gap-1 border border-[var(--line)] p-1">
          {langs.map((item) => (
            <a
              key={item}
              href={languageHref(item)}
              className={`px-2 py-1 text-xs uppercase tracking-wide transition ${
                lang === item
                  ? "button-ink bg-[var(--gold)]"
                  : "text-[var(--muted)] hover:text-[var(--gold-soft)]"
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.nav
            ref={menuRef}
            id="mobile-navigation"
            aria-label={labels.menuLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-nav-panel fixed inset-0 z-40 flex min-h-dvh overflow-y-auto overscroll-contain bg-[var(--menu-bg)] px-[max(1rem,env(safe-area-inset-left))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(env(safe-area-inset-top)+4.25rem))] xl:hidden"
          >
            <div className="mobile-nav-content m-auto flex w-full max-w-[30rem] flex-col gap-2.5">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * i }}
                  className={`mobile-nav-link flex min-h-12 items-center justify-center rounded-sm border px-4 py-2.5 text-center text-base leading-snug text-[var(--ink)] sm:text-lg ${
                    link.cta
                      ? "button-ink border-[var(--gold)] bg-[var(--gold)] font-semibold"
                      : "border-[var(--line)] bg-[var(--surface)]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mobile-nav-languages mt-2 grid grid-cols-3 gap-2">
                {langs.map((item) => (
                  <a
                    key={item}
                    href={languageHref(item)}
                    className={`flex min-h-11 items-center justify-center rounded-sm border px-3 py-2 text-center text-xs uppercase ${
                      lang === item
                        ? "button-ink border-[var(--gold)] bg-[var(--gold)]"
                        : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
