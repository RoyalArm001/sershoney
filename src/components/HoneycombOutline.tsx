import type { CSSProperties } from "react";

type HoneycombOutlineProps = {
  className?: string;
};

const RADIUS = 70;
const HEX_WIDTH = Math.sqrt(3) * RADIUS;
const HALF_WIDTH = HEX_WIDTH / 2;
const ROW_STEP = RADIUS * 1.5;
const CELL_COLUMNS = 10;
const CELL_ROWS = 12;
const WAVE_ORIGIN_COLUMN = (CELL_COLUMNS - 1) / 2;
const WAVE_ORIGIN_ROW = (CELL_ROWS - 1) / 2;
const MAX_WAVE_DISTANCE = Math.hypot(WAVE_ORIGIN_COLUMN, WAVE_ORIGIN_ROW);

function hexPath(centerX: number, centerY: number) {
  const halfRadius = RADIUS / 2;

  return [
    `M ${centerX} ${centerY - RADIUS}`,
    `L ${centerX + HALF_WIDTH} ${centerY - halfRadius}`,
    `L ${centerX + HALF_WIDTH} ${centerY + halfRadius}`,
    `L ${centerX} ${centerY + RADIUS}`,
    `L ${centerX - HALF_WIDTH} ${centerY + halfRadius}`,
    `L ${centerX - HALF_WIDTH} ${centerY - halfRadius}`,
    "Z",
  ].join(" ");
}

const cells = Array.from({ length: CELL_COLUMNS * CELL_ROWS }, (_, index) => {
  const gridColumn = index % CELL_COLUMNS;
  const gridRow = Math.floor(index / CELL_COLUMNS);
  const column = gridColumn - 1;
  const row = gridRow - 1;
  const centerX = 91 + column * HEX_WIDTH + (row % 2 === 0 ? 0 : HALF_WIDTH);
  const centerY = row * ROW_STEP;
  const distance = Math.hypot(
    gridColumn - WAVE_ORIGIN_COLUMN,
    gridRow - WAVE_ORIGIN_ROW,
  );

  return {
    forwardDelay: distance * 0.16,
    id: index,
    path: hexPath(centerX, centerY),
    reverseDelay: (MAX_WAVE_DISTANCE - distance) * 0.16,
  };
});

function OutlinePaths({
  className,
  animatedBase = false,
}: {
  className: string;
  animatedBase?: boolean;
}) {
  return cells.map((cell) => (
    <path
      key={cell.id}
      className={className}
      d={cell.path}
      style={
        {
          "--honeycomb-outline-forward-delay": `${cell.forwardDelay}s`,
          "--honeycomb-outline-reverse-delay": `${cell.reverseDelay}s`,
          ...(animatedBase
            ? { animationDelay: `${cell.forwardDelay * 0.45}s` }
            : null),
        } as CSSProperties
      }
    />
  ));
}

export function HoneycombOutline({ className = "" }: HoneycombOutlineProps) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1024 1024"
    >
      <g className="honeycomb-outline-base">
        <OutlinePaths className="honeycomb-outline-base-path" animatedBase />
      </g>
      <g className="honeycomb-outline-wave honeycomb-outline-wave-first">
        <OutlinePaths className="honeycomb-outline-wave-path" />
      </g>
      <g className="honeycomb-outline-wave honeycomb-outline-wave-second">
        <OutlinePaths className="honeycomb-outline-wave-path" />
      </g>
    </svg>
  );
}
