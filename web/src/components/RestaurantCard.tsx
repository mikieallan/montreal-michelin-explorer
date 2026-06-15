import type { Restaurant } from "../types";
import { GOOD_FOR_LABELS } from "../utils/labels";
import { DistinctionBadge } from "./DistinctionBadge";
import { StarButton } from "./StarButton";

interface RestaurantCardProps {
  restaurant: Restaurant;
  selected: boolean;
  saved: boolean;
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
}

export function RestaurantCard({
  restaurant,
  selected,
  saved,
  onSelect,
  onToggleSave,
}: RestaurantCardProps) {
  return (
    <div
      className={`w-full rounded-lg border bg-white p-3 transition hover:border-michelin-black ${
        selected
          ? "border-michelin-red ring-2 ring-michelin-red/20"
          : "border-michelin-border-light"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(restaurant.id)}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="font-semibold text-michelin-black">{restaurant.name}</h3>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          <StarButton
            saved={saved}
            onToggle={() => onToggleSave(restaurant.id)}
          />
          <DistinctionBadge restaurant={restaurant} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSelect(restaurant.id)}
        className="mt-1 w-full text-left"
      >
        <p className="text-sm text-michelin-gray">
          {restaurant.price ?? "—"} · {restaurant.cuisine ?? "Cuisine N/A"}
        </p>
        {restaurant.address && (
          <p className="mt-1 line-clamp-2 text-xs text-michelin-muted">
            {restaurant.address}
          </p>
        )}
        {restaurant.good_for.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {restaurant.good_for.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-michelin-red-light px-1.5 py-0.5 text-[10px] font-medium text-michelin-red"
              >
                {GOOD_FOR_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
        )}
        {!restaurant.in_montreal_city && (
          <span className="mt-2 inline-block rounded bg-michelin-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-michelin-muted">
            Suburb
          </span>
        )}
      </button>
    </div>
  );
}
