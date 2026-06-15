import type { Restaurant } from "../types";
import { RestaurantCard } from "./RestaurantCard";

interface ListViewProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  isSaved: (id: string) => boolean;
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
}

export function ListView({
  restaurants,
  selectedId,
  isSaved,
  onSelect,
  onToggleSave,
}: ListViewProps) {
  if (!restaurants.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-michelin-muted">
        No restaurants match your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          selected={restaurant.id === selectedId}
          saved={isSaved(restaurant.id)}
          onSelect={onSelect}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
