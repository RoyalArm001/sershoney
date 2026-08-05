"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import type { LocaleCopy } from "@/content/locales";
import { BrandLogo } from "@/components/BrandLogo";
import { PostsGallery } from "@/components/PostsGallery";
import { ArmeniaOriginMap } from "@/components/ArmeniaOriginMap";
import { BusinessContact } from "@/components/BusinessContact";
import { CustomerOrderWatcher } from "@/components/CustomerOrderWatcher";
import { SocialLinks } from "@/components/SocialLinks";
import { BusinessCards } from "@/components/BusinessCards";
import { HoneySafety } from "@/components/HoneySafety";

type Props = {
  lang: Lang;
  copy: LocaleCopy;
};

export function HomePage({ lang, copy }: Props) {
  const reduceMotion = useReducedMotion();
  const softSpring = { type: "spring", stiffness: 210, damping: 20, mass: 0.7 } as const;

  return (
    <>
      <CustomerOrderWatcher lang={lang} />
      <Header lang={lang} labels={copy.nav} />

      <main id="top" className="min-w-0 overflow-x-clip">
        <section
          className="relative isolate flex min-h-[min(52rem,92svh)] items-center overflow-hidden px-[clamp(1rem,3vw,2.5rem)] pb-[clamp(2rem,7svh,3.5rem)] pt-[clamp(5.5rem,11svh,7rem)] lg:items-end"
        >
          <div className="mx-auto grid w-full max-w-[1540px] items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,46rem)_minmax(19rem,1fr)] lg:gap-[clamp(2rem,5vw,6rem)]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full min-w-0 max-w-[46rem] pb-[max(env(safe-area-inset-bottom),0px)] lg:self-end"
            >
              <h1 className="mb-5 w-[min(86vw,31rem)] max-w-full drop-shadow-[0_18px_34px_rgba(0,0,0,0.34)] sm:w-[34rem] lg:w-[38rem]">
                <BrandLogo className="w-full" />
              </h1>
              <p className="mb-4 max-w-[19ch] text-balance text-[1.2rem] font-medium leading-snug sm:text-[1.35rem] lg:text-[1.55rem]">
                {copy.hero.subtitle}
              </p>
              <p className="mb-7 max-w-[40ch] text-pretty text-[0.98rem] text-[var(--muted)] sm:text-base">{copy.hero.lead}</p>
              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <motion.a
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.015 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  transition={softSpring}
                  href={`/${lang}#products`}
                  className="button-ink inline-flex min-h-12 items-center justify-center rounded-sm bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-5 text-center font-semibold shadow-[0_16px_34px_rgba(201,162,39,0.18)]"
                >
                  {copy.hero.browse}
                </motion.a>
                <motion.a
                  whileHover={reduceMotion ? undefined : { y: -2, borderColor: "rgba(224,197,106,0.65)" }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  transition={softSpring}
                  href={`/${lang}#about`}
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[var(--line)] bg-[var(--surface)] px-5 text-center"
                >
                  {copy.hero.learnMore}
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[21rem] justify-self-center sm:max-w-[24rem] lg:max-w-[28rem] lg:self-center lg:justify-self-end"
            >
              <ArmeniaOriginMap lang={lang} />
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-8 right-[clamp(1.25rem,3vw,2.5rem)] hidden items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--muted)] md:flex"
            style={{ writingMode: "vertical-rl" }}
          >
            {copy.hero.scroll}
            <span className="mt-2 block h-12 w-px bg-gradient-to-b from-[var(--gold)] to-transparent" />
          </motion.div>
        </section>

        <section id="about" className="overflow-x-clip px-[clamp(1rem,3vw,2.5rem)] py-[clamp(4.5rem,8vw,7rem)]">
          <div className="mx-auto grid w-full max-w-[1240px] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <Reveal>
              <p className="mb-3 text-sm uppercase tracking-[0.14em] text-[var(--gold)]">
                {copy.sections.aboutEyebrow}
              </p>
              <h2
                className="mb-4 break-words text-balance text-[2.15rem] font-semibold leading-tight sm:text-[2.75rem] lg:text-[3.4rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {copy.sections.aboutTitle}
              </h2>
              <p className="text-pretty text-[var(--muted)]">{copy.sections.aboutBody}</p>
              <ul className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-1">
                {copy.facts.map((item) => (
                  <li key={item.label} className="rounded-sm border border-[var(--line)] bg-[var(--surface)] p-4">
                    <strong className="block text-[var(--gold-soft)]">{item.label}</strong>
                    <span className="text-[var(--muted)]">{item.value}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.12} className="overflow-hidden rounded-sm border border-[var(--line)] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.015 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto aspect-[4/3] w-full max-w-[31rem] sm:aspect-[4/5] lg:max-w-none"
              >
                <Image
                  src="/images/hero-jar.jpg"
                  alt={copy.sections.aboutTitle}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={72}
                />
              </motion.div>
            </Reveal>
          </div>
        </section>

        <section id="quality" className="overflow-x-clip px-[clamp(1rem,3vw,2.5rem)] py-[clamp(4.5rem,8vw,7rem)]">
          <div className="mx-auto w-full max-w-[1240px]">
            <Reveal className="mx-auto mb-10 max-w-xl text-center">
              <p className="mb-3 text-sm uppercase tracking-[0.14em] text-[var(--gold)]">
                {copy.sections.qualityEyebrow}
              </p>
              <h2
                className="break-words text-balance text-[2.15rem] font-semibold leading-tight sm:text-[2.75rem] lg:text-[3.4rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {copy.sections.qualityTitle}
              </h2>
            </Reveal>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {copy.values.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.08}>
                  <motion.li
                    whileHover={reduceMotion ? undefined : { y: -3 }}
                    transition={softSpring}
                    className="group h-full rounded-sm border border-[var(--line)] bg-[var(--surface)] p-5 text-center"
                  >
                    <motion.span
                      whileHover={reduceMotion ? undefined : { rotate: 5, scale: 1.045 }}
                      transition={softSpring}
                      className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--line)] text-[var(--gold)] transition group-hover:border-[var(--gold)]"
                    >
                      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none">
                        {i === 0 && (
                          <path d="M24 8c-4 6-10 10-10 18a10 10 0 0020 0c0-8-6-12-10-18z" stroke="currentColor" strokeWidth="1.5" />
                        )}
                        {i === 1 && (
                          <path d="M8 34l8-14 6 8 8-16 10 22H8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        )}
                        {i === 2 && (
                          <>
                            <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M24 14v10l6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </>
                        )}
                        {i === 3 && (
                          <>
                            <path d="M24 10c2 4 8 6 8 12a8 8 0 11-16 0c0-6 6-8 8-12z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M16 34h16M18 38h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </>
                        )}
                        {i === 4 && (
                          <path d="M24 8l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9l3-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        )}
                      </svg>
                    </motion.span>
                    <h3 className="mb-2 font-semibold text-[var(--gold-soft)]">{item.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.text}</p>
                  </motion.li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
        <HoneySafety lang={lang} />

        <section id="products" className="overflow-x-clip px-[clamp(1rem,3vw,2.5rem)] py-[clamp(4.5rem,8vw,7rem)]">
          <div className="mx-auto w-full max-w-[1240px]">
            <Reveal className="mx-auto mb-8 max-w-xl text-center">
              <p className="mb-3 text-sm uppercase tracking-[0.14em] text-[var(--gold)]">
                {copy.sections.productsEyebrow}
              </p>
              <h2
                className="mb-3 break-words text-balance text-[2.15rem] font-semibold leading-tight sm:text-[2.75rem] lg:text-[3.4rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {copy.sections.productsTitle}
              </h2>
              <p className="text-[var(--muted)]">{copy.sections.productsLead}</p>
            </Reveal>

            <Reveal className="mb-8 overflow-hidden rounded-sm border border-[var(--line)] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
              <div className="relative mx-auto aspect-[16/10] w-full max-w-[48rem] sm:aspect-[3/2] lg:max-w-none">
                <Image
                  src="/images/product-sizes-sers-v2.jpg"
                  alt={copy.sections.productsTitle}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1240px) 100vw, 1240px"
                  quality={70}
                />
              </div>
            </Reveal>

            <ul className="grid gap-4 md:grid-cols-3">
              {copy.sizes.map((size, i) => (
                <Reveal key={size.weight} delay={i * 0.1}>
                  <motion.li
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    transition={softSpring}
                    className={`relative flex h-full min-h-[11.5rem] flex-col justify-between overflow-hidden border px-5 py-6 ${
                      size.featured
                        ? "theme-featured-card border-[var(--gold)] shadow-[0_18px_45px_rgba(201,162,39,0.12)]"
                        : "border-[var(--line)] bg-[var(--surface)]"
                    }`}
                  >
                    {size.featured && (
                      <span className="mb-3 inline-flex max-w-full rounded-sm border border-[rgba(201,162,39,0.38)] px-2 py-1 text-[0.68rem] uppercase tracking-wide text-[var(--gold)]">
                        {copy.featuredBadge}
                      </span>
                    )}
                    <div>
                      <span
                        className="mb-2 block text-4xl font-semibold text-[var(--gold-soft)] sm:text-5xl"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {size.weight}
                      </span>
                      <span className="mb-2 block text-lg font-semibold text-[var(--ink)]">{size.name}</span>
                      <p className="m-0 text-sm text-[var(--muted)]">{size.text}</p>
                    </div>
                    <span className="mt-5 block h-px w-12 bg-[var(--gold)]/50" />
                  </motion.li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <PostsGallery
          eyebrow={copy.sections.postsEyebrow}
          title={copy.sections.postsTitle}
          lead={copy.sections.postsLead}
          cta={copy.sections.postsCta}
        />

        <section id="gifts" className="overflow-x-clip px-[clamp(1rem,3vw,2.5rem)] py-[clamp(4.5rem,8vw,7rem)]">
          <div className="mx-auto grid w-full max-w-[1240px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <Reveal className="overflow-hidden rounded-sm border border-[var(--line)] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[31rem] sm:aspect-[4/5] lg:max-w-none">
                <Image
                  src="/images/gift-box.jpg"
                  alt={copy.sections.giftsTitle}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={72}
                />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mb-3 text-sm uppercase tracking-[0.14em] text-[var(--gold)]">{copy.sections.giftsEyebrow}</p>
              <h2
                className="mb-4 break-words text-balance text-[2.15rem] font-semibold leading-tight sm:text-[2.75rem] lg:text-[3.4rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {copy.sections.giftsTitle}
              </h2>
              <p className="mb-7 text-pretty text-[var(--muted)]">{copy.sections.giftsBody}</p>
              <dl className="mb-7">
                <dt className="mb-3 font-semibold text-[var(--gold-soft)]">{copy.nutritionTitle}</dt>
                <dd className="m-0 grid gap-3 sm:grid-cols-2">
                  {copy.nutrition.map((row) => (
                    <span
                      key={row.label}
                      className="flex justify-between border-b border-[rgba(201,162,39,0.18)] pb-2 text-sm text-[var(--muted)]"
                    >
                      {row.label} <b className="font-semibold text-[var(--ink)]">{row.value}</b>
                    </span>
                  ))}
                </dd>
              </dl>
              <motion.a
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.012 }}
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                transition={softSpring}
                href={`/${lang}/order`}
                className="button-ink inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-5 text-center font-semibold shadow-[0_16px_34px_rgba(201,162,39,0.16)] sm:w-auto"
              >
                {copy.ctaGift}
              </motion.a>
            </Reveal>
          </div>
        </section>
        <BusinessCards lang={lang} />
      </main>

      <footer className="border-t border-[var(--line)] px-[clamp(1.25rem,3vw,2.5rem)] py-10 text-center">
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
