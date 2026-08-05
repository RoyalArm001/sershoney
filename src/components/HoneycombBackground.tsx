"use client";

import { useEffect, useState } from "react";
import { HoneycombOutline } from "@/components/HoneycombOutline";

function usePreferLiteHoneycomb() {
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 767px), (prefers-reduced-motion: reduce), (pointer: coarse)",
    );
    const sync = () => setLite(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return lite;
}

export function HoneycombBackground() {
  const lite = usePreferLiteHoneycomb();

  return (
    <div
      className="site-page-honeycomb pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--background-base)]"
      aria-hidden
      data-honeycomb-mode={lite ? "lite" : "full"}
    >
      <div className="site-bg-glow site-bg-glow-a" />
      <div className="site-bg-glow site-bg-glow-b" />
      {!lite ? <div className="site-bg-glow site-bg-glow-c" /> : null}
      <div className="site-bg-veil" />
      <HoneycombOutline mode={lite ? "lite" : "full"} />
      {!lite ? <div className="site-bg-sheen" /> : null}
      <div className="site-bg-vignette" />
    </div>
  );
}
