"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { HoneycombOutline } from "@/components/HoneycombOutline";

const INTRO_DURATION_MS = 6700;
const REDUCED_MOTION_DURATION_MS = 700;

export function SiteIntro() {
  const [visible, setVisible] = useState(true);
  const restoreScrollRef = useRef<(() => void) | null>(null);

  const finishIntro = useCallback(() => {
    restoreScrollRef.current?.();
    setVisible(false);
  }, []);

  useLayoutEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion
      ? REDUCED_MOTION_DURATION_MS
      : INTRO_DURATION_MS;

    const restoreScroll = () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };

    restoreScrollRef.current = restoreScroll;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const fallbackTimer = window.setTimeout(finishIntro, duration + 250);

    return () => {
      window.clearTimeout(fallbackTimer);
      restoreScroll();
      restoreScrollRef.current = null;
    };
  }, [finishIntro]);

  if (!visible) return null;

  return (
    <div
      data-site-intro
      aria-label="Sers Honey"
      className="site-intro fixed inset-0 z-[100] grid min-h-svh place-items-center overflow-hidden bg-[var(--intro-bg)] px-5"
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target) finishIntro();
      }}
    >
      <div
        aria-hidden
        className="site-intro-honeycomb absolute inset-0"
      >
        <HoneycombOutline />
      </div>
      <div className="relative z-10 flex w-full max-w-[48rem] flex-col items-center">
        <div className="site-intro-logo w-[min(88vw,46rem)] max-w-full drop-shadow-[0_18px_42px_rgba(218,163,43,0.22)]">
          <BrandLogo priority className="w-full" />
        </div>

        <span
          aria-hidden
          className="site-intro-line mt-5 block h-px w-[min(42vw,11rem)] origin-center bg-[linear-gradient(90deg,transparent,var(--gold-soft),transparent)]"
        />
      </div>
    </div>
  );
}
