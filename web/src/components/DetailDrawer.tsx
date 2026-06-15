import type { Restaurant } from "../types";
import { DistinctionBadge } from "./DistinctionBadge";
import {
  formatHours,
  GOOD_FOR_LABELS,
} from "../utils/labels";
import { StarButton } from "./StarButton";

interface DetailDrawerProps {
  restaurant: Restaurant;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
}

export function DetailDrawer({
  restaurant,
  saved,
  onToggleSave,
  onClose,
}: DetailDrawerProps) {
  return (
    <div className="absolute inset-0 z-[1000] flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-xl border border-michelin-border-light bg-white shadow-xl sm:max-w-lg sm:rounded-xl">
        <div className="h-1 rounded-t-xl bg-michelin-red" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-michelin-black">
                {restaurant.name}
              </h2>
              <div className="mt-2">
                <DistinctionBadge restaurant={restaurant} size="md" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StarButton
                saved={saved}
                onToggle={() => onToggleSave(restaurant.id)}
                size="md"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-michelin-muted hover:bg-michelin-surface hover:text-michelin-black"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {restaurant.good_for.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {restaurant.good_for.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-michelin-red/30 bg-michelin-red-light px-2 py-1 text-xs font-medium text-michelin-red"
                >
                  {GOOD_FOR_LABELS[tag] ?? tag}
                </span>
              ))}
            </div>
          )}

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
                Price & cuisine
              </dt>
              <dd className="mt-0.5 text-michelin-gray">
                {restaurant.price ?? "—"} · {restaurant.cuisine ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
                Address
              </dt>
              <dd className="mt-0.5 text-michelin-gray">
                {restaurant.address ?? "Address not listed"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
                Hours
              </dt>
              <dd className="mt-0.5 text-michelin-gray">
                {formatHours(restaurant.hours)}
              </dd>
            </div>
            {restaurant.phone && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-michelin-muted">
                  Phone
                </dt>
                <dd className="mt-0.5">
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-michelin-red hover:underline"
                  >
                    {restaurant.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={restaurant.michelin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-michelin-red hover:underline"
            >
              View on Michelin Guide →
            </a>
            {restaurant.booking_url && (
              <a
                href={restaurant.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-michelin-red hover:underline"
              >
                Book a table →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
