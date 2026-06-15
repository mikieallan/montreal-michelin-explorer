import { MAP_LEGEND } from "../utils/labels";

function LegendDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function MapLegend() {
  return (
    <div className="absolute bottom-3 right-3 z-[500] rounded-lg border border-michelin-border-light bg-white/95 px-3 py-2.5 shadow-md backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-michelin-muted">
        Map legend
      </p>
      <ul className="space-y-1.5">
        {MAP_LEGEND.map(({ color, label, detail }) => (
          <li key={label} className="flex items-start gap-2">
            <LegendDot color={color} />
            <span className="leading-tight">
              <span className="block text-xs font-medium text-michelin-black">
                {label}
              </span>
              <span className="block text-[10px] text-michelin-muted">
                {detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
