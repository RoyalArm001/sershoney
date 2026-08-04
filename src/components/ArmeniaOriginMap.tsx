import type { Lang } from "@/lib/i18n";

type ArmeniaOriginMapProps = {
  lang: Lang;
};

const labels: Record<
  Lang,
  {
    eyebrow: string;
    village: string;
    region: string;
    country: string;
    mapLabel: string;
    capital: string;
    regionName: string;
    route: string;
  }
> = {
  hy: {
    eyebrow: "Մեղրի ծննդավայրը",
    village: "Սերս գյուղ",
    region: "Վայք · Վայոց ձոր · Հայաստան",
    country: "Հայաստանի Հանրապետություն",
    mapLabel: "Բացել Սերս գյուղը քարտեզում",
    capital: "Երևան",
    regionName: "Վայոց ձոր",
    route: "Երևան → Սերս",
  },
  en: {
    eyebrow: "Origin of our honey",
    village: "Sers village",
    region: "Vayk · Vayots Dzor · Armenia",
    country: "Republic of Armenia",
    mapLabel: "Open Sers village on the map",
    capital: "Yerevan",
    regionName: "Vayots Dzor",
    route: "Yerevan → Sers",
  },
  ru: {
    eyebrow: "Родина нашего мёда",
    village: "село Серс",
    region: "Вайк · Вайоц-Дзор · Армения",
    country: "Республика Армения",
    mapLabel: "Открыть село Серс на карте",
    capital: "Ереван",
    regionName: "Вайоц-Дзор",
    route: "Ереван → Серс",
  },
};

// Natural Earth 1:50m boundary, projected locally; Sers: 39.5577 N, 45.4745 E.
const ARMENIA_PATH =
  "M154.9 260.7 L151.3 254.9 L133.5 235.9 L116.9 221.3 L105.5 215.3 L94.1 216.0 L76.3 218.9 L69.8 217.7 L54.3 211.3 L41.4 203.8 L43.1 200.6 L45.9 198.4 L42.6 188.6 L35.4 172.8 L36.2 167.8 L33.9 161.0 L31.4 155.8 L41.5 143.5 L46.2 133.6 L47.2 123.9 L44.5 113.9 L37.8 95.7 L33.7 90.4 L26.0 85.5 L19.6 77.4 L18.0 71.7 L23.4 70.6 L39.2 70.4 L54.4 68.5 L66.4 64.7 L83.7 61.6 L90.8 58.8 L99.2 57.4 L124.5 60.4 L133.9 58.1 L162.4 57.7 L163.2 56.5 L159.3 52.7 L159.3 51.2 L176.3 48.8 L178.9 47.0 L181.1 53.1 L187.5 59.8 L194.4 62.6 L198.2 66.3 L198.3 69.1 L186.0 72.6 L185.2 74.3 L186.0 76.0 L189.7 76.8 L206.9 85.3 L216.8 85.5 L221.9 88.1 L224.5 93.1 L232.7 100.0 L239.3 106.8 L239.7 109.1 L238.4 112.5 L220.1 125.6 L217.8 130.1 L217.5 134.9 L225.6 149.1 L237.4 164.7 L254.5 176.5 L278.1 189.3 L278.4 197.2 L274.7 206.7 L271.5 213.1 L270.0 217.4 L267.1 219.3 L243.7 218.9 L240.1 220.4 L238.6 222.2 L238.5 223.8 L246.9 226.7 L260.1 236.8 L267.7 246.6 L275.6 250.9 L284.4 258.7 L291.5 265.9 L302.6 275.4 L314.9 272.3 L331.4 280.7 L332.0 286.4 L331.0 291.4 L320.7 297.0 L319.4 299.3 L319.4 301.2 L320.7 303.9 L326.8 308.5 L334.0 315.2 L342.0 325.3 L338.4 328.3 L330.9 328.7 L325.1 327.5 L323.0 329.5 L323.1 332.8 L330.7 340.5 L332.2 346.1 L331.9 355.7 L332.3 368.0 L314.5 367.2 L299.3 373.0 L293.6 371.9 L289.7 361.5 L286.5 353.0 L276.8 331.4 L279.4 322.6 L274.0 317.4 L261.0 308.3 L257.7 304.4 L259.5 299.2 L260.8 289.7 L259.6 281.9 L256.1 279.6 L249.6 279.5 L241.7 281.4 L225.8 288.8 L214.8 284.1 L208.4 279.3 L204.8 275.2 L196.5 278.6 L194.5 277.0 L194.1 267.0 L191.6 261.7 L186.6 255.4 L182.0 252.4 L165.1 258.6 L154.9 260.7 Z M181.2 82.5 L181.7 78.9 L180.9 75.6 L178.2 74.6 L174.8 75.5 L174.5 79.1 L175.6 82.5 L179.0 84.0 L181.2 82.5 Z M235.6 137.8 L231.7 140.1 L228.1 139.1 L228.1 133.5 L230.7 131.3 L233.8 131.4 L236.7 133.4 L235.6 137.8 Z";

// Natural Earth admin-1 boundary projected into the same view box as ARMENIA_PATH.
const VAYOTS_DZOR_PATH =
  "M238.2 222.9 L238.4 224.8 L241.7 226.3 L252.4 227.4 L255.3 228.8 L257.5 231.3 L262.1 240.8 L260.3 241.8 L258.7 243.7 L253.3 253.1 L252.4 255.1 L252.2 256.6 L254.1 260.2 L254.2 262.3 L253.8 265.1 L251 276 L251.1 276.7 L251.2 277.3 L251.7 278.6 L251.8 278.8 L251.8 278.9 L239.2 282 L236.4 283.1 L228.1 288.5 L227 288.9 L225.9 289.5 L224.7 289.8 L223.5 289.6 L222.4 288.9 L219.2 285.5 L217.4 284.6 L212.5 284.1 L211 283.5 L210 282 L208.7 279.2 L206.2 275.6 L205.5 274.7 L202.8 275.6 L199.8 278.3 L196.1 279.2 L194 277.9 L193.6 276 L194.6 271.1 L194.8 268 L194.4 265.5 L193.3 263.2 L186.5 254.4 L186.8 251.5 L186.8 247 L186.9 246.5 L187.6 244.4 L190 238.8 L194.9 235.7 L199 231.9 L200.3 231 L201.6 230.3 L204.8 229 L205.8 228.8 L213.3 229.2 L216.5 228.6 L219.1 228.6 L226.1 227.4 L227.9 226.9 L231.5 224.9 L232.9 223.6 L234 221.9 L234.4 221.5 L235 220.9 L235.5 220.9 L235.8 221 L236.2 221.3 L236.4 221.6 L236.9 222.3 L237.9 222.9 L238.2 222.9 Z";

// A stylized Yerevan-to-Sers route following the M2 corridor through Vayots Dzor.
const YEREVAN_TO_SERS_PATH =
  "M128.8 195.6 C129.8 207.8 130.3 219.2 132.4 227 C138.6 239.4 149 250.1 161.2 255.8 C171.9 260.3 187 260.5 197.6 258.6 C203.3 257.6 208.1 253.5 213.1 252.9 C218.7 252.2 223 257.5 226.8 262.6 C229 266.5 227.7 274.2 227.6 280.3";

export function ArmeniaOriginMap({ lang }: ArmeniaOriginMapProps) {
  const copy = labels[lang];

  return (
    <a
      aria-label={copy.mapLabel}
      className="origin-map-link group block w-full max-w-[28rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-soft)]"
      href="https://www.google.com/maps?q=39.5577,45.4745"
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex items-center gap-4 sm:gap-6 lg:relative lg:block">
        <svg
          aria-hidden
          className="h-[10.5rem] w-[9rem] shrink-0 overflow-visible sm:h-[12rem] sm:w-[10.25rem] lg:h-auto lg:w-full"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 360 420"
        >
          <g className="origin-map-country">
            <path
              className="origin-map-shape"
              clipRule="evenodd"
              d={ARMENIA_PATH}
              fillRule="evenodd"
            />
            <path
              className="origin-map-country-trace"
              clipRule="evenodd"
              d={ARMENIA_PATH}
              fillRule="evenodd"
              pathLength="1000"
            />
          </g>

          <g className="origin-map-region">
            <path className="origin-map-region-halo" d={VAYOTS_DZOR_PATH} />
            <path className="origin-map-region-shape" d={VAYOTS_DZOR_PATH} />
            <path
              className="origin-map-region-trace"
              d={VAYOTS_DZOR_PATH}
              pathLength="100"
            />
            <text
              className="origin-map-region-label"
              textAnchor="middle"
              x="224"
              y="244"
            >
              {copy.regionName}
            </text>
          </g>

          <g className="origin-map-road">
            <path className="origin-map-road-shadow" d={YEREVAN_TO_SERS_PATH} />
            <path className="origin-map-road-base" d={YEREVAN_TO_SERS_PATH} />
            <path
              className="origin-map-road-flow"
              d={YEREVAN_TO_SERS_PATH}
              pathLength="100"
            />
            <circle className="origin-map-road-runner" r="2.8">
              <animateMotion
                dur="5.4s"
                path={YEREVAN_TO_SERS_PATH}
                repeatCount="indefinite"
              />
            </circle>
          </g>

          <g className="origin-map-capital">
            <circle className="origin-map-capital-halo" cx="128.8" cy="195.6" r="10" />
            <path
              className="origin-map-capital-star"
              d="M0 -5 L1.6 -1.6 L5 0 L1.6 1.6 L0 5 L-1.6 1.6 L-5 0 L-1.6 -1.6 Z"
              transform="translate(128.8 195.6)"
            />
            <text
              className="origin-map-capital-label"
              textAnchor="middle"
              x="128.8"
              y="182"
            >
              {copy.capital}
            </text>
          </g>

          <path className="origin-map-callout" d="M227.6 280.3 C248 270 272 236 296 220" />
          <circle className="origin-map-callout-cap" cx="296" cy="220" r="2" />

          <g className="origin-map-marker">
            <circle className="origin-map-marker-pulse" cx="227.6" cy="280.3" r="16" />
            <circle className="origin-map-marker-ring" cx="227.6" cy="280.3" r="9" />
            <circle className="origin-map-marker-dot" cx="227.6" cy="280.3" r="4.5" />
          </g>
        </svg>

        <div className="min-w-0 border-l border-[rgba(224,197,106,0.45)] pl-4 lg:absolute lg:right-0 lg:top-[24%] lg:w-[13rem] lg:bg-[var(--panel-bg)] lg:py-2 lg:pr-2 lg:backdrop-blur-[2px]">
          <span className="block text-[0.66rem] uppercase text-[var(--gold)] sm:text-[0.7rem]">
            {copy.eyebrow}
          </span>
          <strong className="mt-1 block text-[1.15rem] font-semibold leading-tight text-[var(--gold-soft)] sm:text-[1.3rem]">
            {copy.village}
          </strong>
          <span className="mt-1 block text-xs leading-snug text-[var(--ink)]/85 sm:text-sm">
            {copy.region}
          </span>
          <span className="mt-1.5 block text-[0.68rem] leading-snug text-[var(--muted)] sm:text-xs">
            {copy.country}
          </span>
          <span className="mt-2 flex items-center gap-2 text-[0.66rem] font-semibold text-[var(--gold-soft)] sm:text-[0.7rem]">
            <span
              aria-hidden
              className="h-px w-5 bg-[var(--gold-soft)] shadow-[0_0_7px_rgba(224,197,106,0.7)]"
            />
            {copy.route}
          </span>
        </div>
      </div>
    </a>
  );
}
