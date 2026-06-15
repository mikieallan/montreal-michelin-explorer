import type { Distinction, Restaurant } from "../types";
import {
  DISTINCTION_COLORS,
  DISTINCTION_LABELS,
  MICHELIN,
} from "../utils/labels";

interface DistinctionBadgeProps {
  restaurant: Restaurant;
  size?: "sm" | "md";
}

export function DistinctionBadge({
  restaurant,
  size = "sm",
}: DistinctionBadgeProps) {
  const distinction = restaurant.distinction;
  const label =
    restaurant.star_count > 0
      ? `${restaurant.star_count} Star${restaurant.star_count > 1 ? "s" : ""}`
      : restaurant.is_bib_gourmand
        ? DISTINCTION_LABELS.bib_gourmand
        : DISTINCTION_LABELS[distinction as Distinction];

  const color = DISTINCTION_COLORS[distinction as Distinction] ?? MICHELIN.gray;
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center rounded font-semibold uppercase tracking-wide text-white ${textSize} ${padding}`}
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
      {restaurant.is_green_star && (
        <span
          className={`inline-flex items-center rounded font-semibold uppercase tracking-wide text-white ${textSize} ${padding}`}
          style={{ backgroundColor: MICHELIN.green }}
        >
          Green
        </span>
      )}
    </span>
  );
}
