"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { SOCIAL_LINKS } from "@/lib/seo";

const POSTS = [
  { src: "/images/posts/post-jar-hero.jpg", alt: "Sers Honey jar" },
  { src: "/images/posts/post-sizes.jpg", alt: "Sers Honey sizes" },
  { src: "/images/posts/post-gift.jpg", alt: "Sers Honey gift" },
  { src: "/images/posts/post-detail.jpg", alt: "Sers Honey detail" },
] as const;

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
};

export function PostsGallery({ eyebrow, title, lead, cta }: Props) {
  const reduceMotion = useReducedMotion();
  const softSpring = { type: "spring", stiffness: 210, damping: 20, mass: 0.7 } as const;
  const instagramUrl = SOCIAL_LINKS[0] || "https://www.instagram.com/";

  return (
    <section id="posts" className="overflow-x-clip px-[clamp(1rem,3vw,2.5rem)] py-[clamp(3rem,6vw,4.5rem)]">
      <div className="mx-auto w-full max-w-[720px]">
        <Reveal className="mx-auto mb-6 max-w-lg text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--gold)] sm:text-sm">{eyebrow}</p>
          <h2
            className="mb-2 break-words text-balance text-[1.75rem] font-semibold leading-tight sm:text-[2.15rem]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <p className="text-sm text-[var(--muted)]">{lead}</p>
        </Reveal>

        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {POSTS.map((post, i) => (
            <Reveal key={post.src} delay={i * 0.05}>
              <motion.a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={softSpring}
                className="group relative block overflow-hidden border border-[var(--line)] bg-[var(--frame-bg)]"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={post.src}
                    alt={post.alt}
                    fill
                    className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 720px) 22vw, 160px"
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(201,162,39,0.15)] transition group-hover:ring-[rgba(201,162,39,0.4)]" />
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-5 flex justify-center">
          <motion.a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            transition={softSpring}
            className="inline-flex min-h-10 items-center justify-center border border-[var(--line)] px-4 text-xs uppercase tracking-[0.12em] text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
          >
            {cta}
          </motion.a>
        </Reveal>
      </div>
    </section>
  );
}
