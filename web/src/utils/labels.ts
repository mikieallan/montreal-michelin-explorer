import type { DayHours, Distinction } from "../types";

export const MICHELIN = {
  red: "#BD2332",
  redDark: "#BA0B2F",
  redLight: "#FBE4E7",
  gold: "#BA8B00",
  black: "#191919",
  ink: "#222222",
  gray: "#4D4D4D",
  muted: "#888888",
  border: "#CCCCCC",
  borderLight: "#E0E0E0",
  surface: "#F6F6F6",
  green: "#00AB6C",
  white: "#FFFFFF",
} as const;

export const DISTINCTION_LABELS: Record<Distinction, string> = {
  three_stars: "3 Stars",
  two_stars: "2 Stars",
  one_star: "1 Star",
  bib_gourmand: "Bib Gourmand",
  selected: "Selected",
};

export const DISTINCTION_COLORS: Record<Distinction, string> = {
  three_stars: MICHELIN.gold,
  two_stars: MICHELIN.gold,
  one_star: MICHELIN.gold,
  bib_gourmand: MICHELIN.red,
  selected: MICHELIN.gray,
};

export const GOOD_FOR_LABELS: Record<string, string> = {
  solo_dining: "Solo dining",
  groups: "Groups",
  family_friendly: "Family friendly",
  date_night: "Date night",
  farm_to_table: "Farm-to-table",
  counter_dining: "Counter dining",
  outdoor_dining: "Outdoor dining",
  iconic: "Iconic",
  chefs_table: "Chef's table",
  eat_like_a_local: "Eat like a local",
  inspectors_favorite: "Inspectors favorite",
};

export const DIET_LABELS: Record<string, string> = {
  vegan_options: "Vegan options",
  vegetarian_options: "Vegetarian options",
  halal_options: "Halal options",
  kosher_options: "Kosher options",
};

export const SERVICE_LABELS: Record<string, string> = {
  wheelchair_access: "Wheelchair access",
  terrace: "Terrace",
  brunch: "Brunch",
};

export const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function formatHours(hours: DayHours[]): string {
  if (!hours.length) return "Hours not listed on Michelin";

  const lines = [...hours]
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    .map((entry) => {
      const day = DAY_LABELS[entry.day]?.slice(0, 3) ?? entry.day.slice(0, 3);
      if (entry.closed || !entry.slots?.length) return `${day}: closed`;
      const slots = entry.slots
        .map((slot) => `${slot.open}–${slot.close}`)
        .join(", ");
      return `${day}: ${slots}`;
    });

  return lines.join(" · ");
}

export function pinColorForRestaurant(restaurant: {
  distinction: Distinction;
  star_count: number;
  is_bib_gourmand: boolean;
  is_green_star?: boolean;
}): string {
  if (
    restaurant.is_green_star &&
    restaurant.star_count === 0 &&
    !restaurant.is_bib_gourmand
  ) {
    return MICHELIN.green;
  }
  if (restaurant.star_count > 0) return MICHELIN.gold;
  if (restaurant.is_bib_gourmand) return MICHELIN.red;
  return MICHELIN.gray;
}

export const MAP_LEGEND = [
  { color: MICHELIN.gold, label: "Michelin Star", detail: "1, 2, or 3 stars" },
  {
    color: MICHELIN.red,
    label: "Bib Gourmand",
    detail: "Good quality, good value",
  },
  { color: MICHELIN.gray, label: "Selected", detail: "Recommended restaurant" },
  { color: MICHELIN.green, label: "Green Star", detail: "Sustainability" },
] as const;
