import type { Lang } from "@/lib/i18n";
import {
  BUSINESS_LOCATION,
  BUSINESS_PHONE,
  BUSINESS_PHONE_DISPLAY,
} from "@/lib/seo";

type BusinessContactProps = {
  lang: Lang;
  className?: string;
};

const phoneLabels: Record<Lang, string> = {
  hy: "Հեռախոս",
  en: "Phone",
  ru: "Телефон",
};

export function BusinessContact({ lang, className = "" }: BusinessContactProps) {
  return (
    <address
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm not-italic text-[var(--muted)] ${className}`}
    >
      <span>{BUSINESS_LOCATION[lang].full}</span>
      <span aria-hidden className="text-[var(--line)]">
        ·
      </span>
      <a
        aria-label={`${phoneLabels[lang]}: ${BUSINESS_PHONE_DISPLAY}`}
        className="font-semibold text-[var(--gold-soft)] underline decoration-[rgba(224,197,106,0.38)] underline-offset-4 transition hover:text-[var(--ink)] hover:decoration-[var(--gold-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-soft)]"
        href={`tel:${BUSINESS_PHONE}`}
      >
        {BUSINESS_PHONE_DISPLAY}
      </a>
    </address>
  );
}
