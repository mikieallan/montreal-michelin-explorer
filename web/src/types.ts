export type Distinction =
  | "three_stars"
  | "two_stars"
  | "one_star"
  | "bib_gourmand"
  | "selected";

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DayHours {
  day: string;
  slots: TimeSlot[];
  closed?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  distinction: Distinction;
  star_count: number;
  is_bib_gourmand: boolean;
  is_green_star: boolean;
  price: string | null;
  price_level: number;
  cuisine: string | null;
  address: string | null;
  city: string | null;
  in_montreal_city: boolean;
  lat: number | null;
  lng: number | null;
  good_for: string[];
  special_diets: string[];
  services: string[];
  open_days: string[];
  serves_lunch: boolean;
  serves_dinner: boolean;
  hours: DayHours[];
  phone: string | null;
  website: string | null;
  michelin_url: string;
  booking_url: string | null;
  online_booking: boolean;
  scraped_at: string;
}

export interface ScrapeOutput {
  source_url: string;
  restaurant_count: number;
  scraped_at: string;
  restaurants: Restaurant[];
}

export interface Filters {
  search: string;
  distinctions: Distinction[];
  prices: number[];
  cuisines: string[];
  goodFor: string[];
  diets: string[];
  openDays: string[];
  servesLunch: boolean;
  servesDinner: boolean;
  onlineBooking: boolean;
  services: string[];
  greenStar: boolean;
  inMontrealCityOnly: boolean;
  shortlistOnly: boolean;
}

export type TabId = "map" | "list";
