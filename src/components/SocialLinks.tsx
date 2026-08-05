"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/seo";

const [instagramUrl, facebookUrl] = SOCIAL_LINKS;

export function SocialLinks({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="Social media"
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <motion.a
        href={instagramUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Sers Honey on Instagram"
        whileHover={reduceMotion ? undefined : { y: -2, scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] text-[var(--gold-soft)] transition hover:border-[var(--gold)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-soft)]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.35" cy="6.65" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      </motion.a>

      <motion.a
        href={facebookUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Sers Honey on Facebook"
        whileHover={reduceMotion ? undefined : { y: -2, scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] text-[var(--gold-soft)] transition hover:border-[var(--gold)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-soft)]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
        >
          <path d="M13.7 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.1H7.8V13h2.7v8h3.2Z" />
        </svg>
      </motion.a>
    </nav>
  );
}
