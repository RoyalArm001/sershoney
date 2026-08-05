import type { CSSProperties } from "react";

type HoneycombOutlineProps = {
  className?: string;
  /** `lite` = fewer cells, base layer only (Android-friendly). */
  mode?: "full" | "lite";
};

const RADIUS = 70;
const HEX_WIDTH = Math.sqrt(3) * RADIUS;
const HALF_WIDTH = HEX_WIDTH / 2;
const ROW_STEP = RADIUS * 1.5;

function buildCells(columns: number, rows: number) {
  const originColumn = (columns - 1) / 2;
  const originRow = (rows - 1) / 2;
  const maxDistance = Math.hypot(originColumn, originRow);

  return Array.from({ length: columns * rows }, (_, index) => {
    const gridColumn = index % columns;
    const gridRow = Math.floor(index / columns);
    const column = gridColumn - 1;
    const row = gridRow - 1;
    const centerX = 91 + column * HEX_WIDTH + (row % 2 === 0 ? 0 : HALF_WIDTH);
    const centerY = row * ROW_STEP;
    const distance = Math.hypot(gridColumn - originColumn, gridRow - originRow);

    return {
      forwardDelay: distance * 0.16,
      id: index,
      path: hexPath(centerX, centerY),
      reverseDelay: (maxDistance - distance) * 0.16,
    };
  });
}

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

const FULL_CELLS = buildCells(10, 12);
const LITE_CELLS = buildCells(5, 6);

function OutlinePaths({
  cells,
  className,
  animatedBase = false,
}: {
  cells: typeof FULL_CELLS;
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

export function HoneycombOutline({
  className = "",
  mode = "full",
}: HoneycombOutlineProps) {
  const cells = mode === "lite" ? LITE_CELLS : FULL_CELLS;
  const showWaves = mode === "full";

  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1024 1024"
    >
      <g className="honeycomb-outline-base">
        <OutlinePaths
          cells={cells}
          className="honeycomb-outline-base-path"
          animatedBase
        />
      </g>
      {showWaves ? (
        <>
          <g className="honeycomb-outline-wave honeycomb-outline-wave-first">
            <OutlinePaths cells={cells} className="honeycomb-outline-wave-path" />
          </g>
          <g className="honeycomb-outline-wave honeycomb-outline-wave-second">
            <OutlinePaths cells={cells} className="honeycomb-outline-wave-path" />
          </g>
        </>
      ) : null}
    </svg>
  );
}
