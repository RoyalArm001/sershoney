import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  originalColor?: boolean;
  priority?: boolean;
};

const LOGO_SRC = "/brand/sers-honey-wordmark.png";

export function BrandLogo({
  className = "",
  originalColor = false,
  priority = false,
}: BrandLogoProps) {
  if (originalColor) {
    return (
      <Image
        src={LOGO_SRC}
        alt="Sers Honey"
        width={1042}
        height={560}
        priority={priority}
        className={`h-auto object-contain ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label="Sers Honey"
      className={`block aspect-[1042/560] bg-[var(--gold-soft)] ${className}`}
      style={{
        WebkitMaskImage: `url("${LOGO_SRC}")`,
        maskImage: `url("${LOGO_SRC}")`,
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
