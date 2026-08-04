import { HoneycombOutline } from "@/components/HoneycombOutline";

export function HoneycombBackground() {
  return (
    <div
      className="site-page-honeycomb pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--background-base)]"
      aria-hidden
    >
      <div className="site-bg-glow site-bg-glow-a" />
      <div className="site-bg-glow site-bg-glow-b" />
      <div className="site-bg-glow site-bg-glow-c" />
      <div className="site-bg-veil" />
      <HoneycombOutline />
      <div className="site-bg-sheen" />
      <div className="site-bg-vignette" />
    </div>
  );
}
