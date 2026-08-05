"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";

const COPY: Record<Lang, { eyebrow: string; title: string; lead: string; front: string; back: string }> = {
  hy: {
    eyebrow: "Մեր այցեքարտերը",
    title: "Սերս Honey-ը միշտ ձեզ հետ է",
    lead: "Սկանավորեք QR կոդը, պահպանեք կոնտակտը և պատվիրեք բնական մեղրը մեկ հպումով։",
    front: "Կոնտակտային այցեքարտ",
    back: "Sers Honey այցեքարտ",
  },
  en: {
    eyebrow: "Our business cards",
    title: "Keep Sers Honey close",
    lead: "Scan the QR code, save our contact, and order natural honey in one tap.",
    front: "Contact business card",
    back: "Sers Honey business card",
  },
  ru: {
    eyebrow: "Наши визитки",
    title: "Sers Honey всегда рядом",
    lead: "Сканируйте QR-код, сохраните контакт и закажите натуральный мёд в одно касание.",
    front: "Контактная визитка",
    back: "Визитка Sers Honey",
  },
};

function Card({
  src,
  alt,
  side,
}: {
  src: string;
  alt: string;
  side: "left" | "right";
}) {
  const reduceMotion = useReducedMotion();
  const isLeft = side === "left";

  return (
    <motion.div
      className={`relative w-[min(78vw,34rem)] shrink-0 [perspective:1200px] sm:w-[min(84vw,34rem)] ${
        isLeft
          ? "z-20"
          : "z-10 -mt-[10%] ml-[10%] lg:ml-0 lg:mt-14 lg:-ml-40"
      }`}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: isLeft ? -100 : 100,
              y: isLeft ? 20 : 70,
              rotateY: isLeft ? -22 : 22,
              rotateZ: isLeft ? -5 : 5,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: isLeft ? -8 : 8,
        rotateZ: 0,
      }}
      viewport={{ once: true, amount: 0.26 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -14,
              rotateY: 0,
              rotateX: isLeft ? 3 : -3,
              scale: 1.025,
            }
      }
    >
      <div className="absolute inset-x-[9%] bottom-[-11%] h-[25%] rounded-full bg-[rgba(201,162,39,0.35)] blur-3xl" />
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] border border-[rgba(224,197,106,0.55)] bg-black shadow-[0_28px_65px_rgba(0,0,0,0.5)] [transform-style:preserve-3d]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 768px) 84vw, 48vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,225,140,0.12)_47%,transparent_62%)] opacity-70" />
      </div>
    </motion.div>
  );
}

export function BusinessCards({ lang }: { lang: Lang }) {
  const copy = COPY[lang];

  return (
    <section className="overflow-hidden px-[clamp(1rem,3vw,2.5rem)] py-[clamp(4.5rem,9vw,8rem)]">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--gold)]">{copy.eyebrow}</p>
          <h2
            className="mt-3 text-balance text-[clamp(2.15rem,4vw,3.5rem)] font-semibold leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[43rem] text-[var(--muted)]">{copy.lead}</p>
        </Reveal>

        <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center justify-center pb-8 lg:min-h-[25rem] lg:flex-row lg:pb-0">
          <Card
            src="/images/sers-honey-contact-card.webp"
            alt={copy.front}
            side="left"
          />
          <Card
            src="/images/sers-honey-brand-card.webp"
            alt={copy.back}
            side="right"
          />
        </div>
      </div>
    </section>
  );
}
