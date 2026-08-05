"use client";

import { motion } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import type { LocaleCopy } from "@/content/locales";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { OrderForm } from "@/components/OrderForm";
import { OrderHistory } from "@/components/OrderHistory";
import { CustomerOrderWatcher } from "@/components/CustomerOrderWatcher";
import { BrandLogo } from "@/components/BrandLogo";
import { BusinessContact } from "@/components/BusinessContact";
import { SocialLinks } from "@/components/SocialLinks";

type Props = {
  lang: Lang;
  copy: LocaleCopy;
};

export function OrderPage({ lang, copy }: Props) {
  return (
    <>
      <CustomerOrderWatcher lang={lang} />
      <Header lang={lang} labels={copy.nav} />

      <main className="min-h-[100svh] min-w-0 overflow-x-clip px-4 pb-[clamp(4rem,9svh,7rem)] pt-[clamp(5.5rem,11svh,7rem)] sm:px-6">
        <Reveal className="theme-order-panel mx-auto w-full min-w-0 max-w-[760px] overflow-hidden rounded-sm border border-[var(--line)] p-[clamp(1.25rem,3.5vw,2.75rem)] text-center shadow-[0_24px_80px_var(--shadow-color)]">
          <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[var(--gold)] sm:text-sm">
            {copy.sections.contactEyebrow}
          </p>
          <h1
            className="mx-auto mb-2 max-w-[15ch] break-words text-balance text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-[1.08] sm:max-w-[22ch]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {copy.sections.contactTitle}
          </h1>
          <p className="mx-auto max-w-[42rem] text-pretty text-sm text-[var(--muted)] sm:text-base">
            {copy.sections.contactLead}
          </p>
          <BusinessContact className="mx-auto mt-4" lang={lang} />
          <OrderForm lang={lang} copy={copy.form} />
          <motion.a
            whileHover={{ y: -2 }}
            href={`/${lang}`}
            className="mt-6 inline-flex text-sm text-[var(--muted)] transition hover:text-[var(--gold-soft)]"
          >
            ← Sers Honey
          </motion.a>
        </Reveal>
        <OrderHistory lang={lang} />
      </main>

      <footer className="border-t border-[var(--line)] px-4 py-10 text-center sm:px-6">
        <BrandLogo className="mx-auto w-[9.5rem]" />
        <p className="mt-2 text-[var(--gold)]">{copy.footerLine}</p>
        <BusinessContact className="mx-auto mt-4" lang={lang} />
        <SocialLinks className="mt-5" />
        <a
          href={`/${lang}/partnership`}
          className="mt-5 inline-flex text-sm text-[var(--gold-soft)] underline-offset-4 transition hover:text-[var(--ink)] hover:underline"
        >
          {lang === "hy"
            ? "Համագործակցել Sers Honey-ի հետ"
            : lang === "ru"
              ? "Сотрудничать с Sers Honey"
              : "Partner with Sers Honey"}
        </a>
        <p className="mt-6 text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} Sers Honey · {copy.footerMeta}
        </p>
      </footer>
    </>
  );
}
