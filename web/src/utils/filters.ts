import type { Distinction, Filters, Restaurant } from "../types";

export const ALL_DISTINCTIONS: Distinction[] = [
  "three_stars",
  "two_stars",
  "one_star",
  "bib_gourmand",
  "selected",
];

export const PRICE_OPTIONS = [
  { level: 1, label: "$" },
  { level: 2, label: "$$" },
  { level: 3, label: "$$$" },
  { level: 4, label: "$$$$" },
] as const;

export const DEFAULT_FILTERS: Filters = {
  search: "",
  distinctions: [],
  prices: [],
  cuisines: [],
  goodFor: [],
  diets: [],
  openDays: [],
  servesLunch: false,
  servesDinner: false,
  onlineBooking: false,
  services: [],
  greenStar: false,
  inMontrealCityOnly: false,
  shortlistOnly: false,
};

function matchesDistinction(
  restaurant: Restaurant,
  selected: Distinction[],
): boolean {
  if (!selected.length) return true;
  if (selected.includes("selected") && restaurant.distinction === "selected") {
    return true;
  }
  return selected.includes(restaurant.distinction);
}

function matchesArrayFilter(values: string[], selected: string[]): boolean {
  if (!selected.length) return true;
  return selected.some((item) => values.includes(item));
}

function matchesOpenDays(restaurant: Restaurant, selected: string[]): boolean {
  if (!selected.length) return true;
  if (restaurant.open_days.length) {
    return selected.some((day) => restaurant.open_days.includes(day));
  }
  return selected.some((day) =>
    restaurant.hours.some(
      (entry) => entry.day === day && !entry.closed && entry.slots.length > 0,
    ),
  );
}

export function filterRestaurants(
  restaurants: Restaurant[],
  filters: Filters,
  shortlist: Set<string>,
): Restaurant[] {
  const query = filters.search.trim().toLowerCase();

  return restaurants.filter((restaurant) => {
    if (filters.shortlistOnly && !shortlist.has(restaurant.id)) return false;

    if (filters.inMontrealCityOnly && !restaurant.in_montreal_city) return false;

    if (query) {
      const haystack =
        `${restaurant.name} ${restaurant.cuisine ?? ""} ${restaurant.address ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (!matchesDistinction(restaurant, filters.distinctions)) return false;

    if (
      filters.prices.length &&
      !filters.prices.includes(restaurant.price_level)
    ) {
      return false;
    }

    if (
      filters.cuisines.length &&
      (!restaurant.cuisine || !filters.cuisines.includes(restaurant.cuisine))
    ) {
      return false;
    }

    if (!matchesArrayFilter(restaurant.good_for, filters.goodFor)) return false;
    if (!matchesArrayFilter(restaurant.special_diets, filters.diets)) return false;
    if (!matchesArrayFilter(restaurant.services, filters.services)) return false;
    if (!matchesOpenDays(restaurant, filters.openDays)) return false;

    if (filters.servesLunch && !restaurant.serves_lunch) return false;
    if (filters.servesDinner && !restaurant.serves_dinner) return false;
    if (filters.onlineBooking && !restaurant.online_booking) return false;
    if (filters.greenStar && !restaurant.is_green_star) return false;

    return true;
  });
}

export function collectFilterOptions(restaurants: Restaurant[]) {
  const cuisines = new Set<string>();
  const goodFor = new Set<string>();
  const diets = new Set<string>();
  const services = new Set<string>();

  for (const restaurant of restaurants) {
    if (restaurant.cuisine) cuisines.add(restaurant.cuisine);
    restaurant.good_for.forEach((tag) => goodFor.add(tag));
    restaurant.special_diets.forEach((tag) => diets.add(tag));
    restaurant.services.forEach((tag) => services.add(tag));
  }

  return {
    cuisines: [...cuisines].sort(),
    goodFor: [...goodFor].sort(),
    diets: [...diets].sort(),
    services: [...services].sort(),
  };
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.distinctions.length > 0 ||
    filters.prices.length > 0 ||
    filters.cuisines.length > 0 ||
    filters.goodFor.length > 0 ||
    filters.diets.length > 0 ||
    filters.openDays.length > 0 ||
    filters.services.length > 0 ||
    filters.servesLunch ||
    filters.servesDinner ||
    filters.onlineBooking ||
    filters.greenStar ||
    filters.inMontrealCityOnly ||
    filters.shortlistOnly
  );
}
