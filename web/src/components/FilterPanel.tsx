import { useState, type ReactNode } from "react";
import type { Distinction, Filters } from "../types";
import {
  ALL_DISTINCTIONS,
  DEFAULT_FILTERS,
  hasActiveFilters,
  PRICE_OPTIONS,
} from "../utils/filters";
import {
  DAY_LABELS,
  DIET_LABELS,
  DISTINCTION_LABELS,
  GOOD_FOR_LABELS,
  SERVICE_LABELS,
} from "../utils/labels";

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  options: {
    cuisines: string[];
    goodFor: string[];
    diets: string[];
    services: string[];
  };
  shortlistCount: number;
}

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function FilterGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-michelin-border-light py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-michelin-muted"
      >
        {title}
        <span className="text-michelin-gray">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  variant = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  variant?: "default" | "red";
}) {
  const base =
    "rounded-md px-2.5 py-1 text-xs font-medium transition border min-h-[32px]";
  const inactive =
    "michelin-filter-btn border-michelin-border bg-white text-michelin-gray";
  const activeDefault =
    "border-michelin-black bg-michelin-black text-white";
  const activeRed =
    "border-michelin-red bg-michelin-red text-white";

  const className = active
    ? `${base} ${variant === "red" ? activeRed : activeDefault}`
    : `${base} ${inactive}`;

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function FilterPanel({
  filters,
  onChange,
  options,
  shortlistCount,
}: FilterPanelProps) {
  const setDistinction = (distinction: Distinction) => {
    onChange({
      ...filters,
      distinctions: toggleValue(filters.distinctions, distinction),
    });
  };

  const setPrice = (level: number) => {
    onChange({
      ...filters,
      prices: toggleValue(filters.prices, level),
    });
  };

  const days = Object.keys(DAY_LABELS);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-michelin-border-light p-4">
        <input
          type="search"
          placeholder="Search name or cuisine…"
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          className="w-full rounded-lg border border-michelin-border bg-white px-3 py-2.5 text-sm text-michelin-black outline-none placeholder:text-michelin-muted focus:border-michelin-black focus:ring-2 focus:ring-michelin-red/20"
        />
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="mt-2 text-xs text-michelin-gray underline-offset-2 hover:text-michelin-red hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <FilterGroup title="My shortlist">
          <Chip
            active={filters.shortlistOnly}
            onClick={() =>
              onChange({ ...filters, shortlistOnly: !filters.shortlistOnly })
            }
            variant="red"
          >
            ★ Saved only ({shortlistCount})
          </Chip>
        </FilterGroup>

        {options.goodFor.length > 0 && (
          <FilterGroup title="Good for">
            {options.goodFor.map((tag) => (
              <Chip
                key={tag}
                active={filters.goodFor.includes(tag)}
                onClick={() =>
                  onChange({
                    ...filters,
                    goodFor: toggleValue(filters.goodFor, tag),
                  })
                }
                variant="red"
              >
                {GOOD_FOR_LABELS[tag] ?? tag}
              </Chip>
            ))}
          </FilterGroup>
        )}

        <FilterGroup title="Distinction" defaultOpen={false}>
          {ALL_DISTINCTIONS.map((distinction) => (
            <Chip
              key={distinction}
              active={filters.distinctions.includes(distinction)}
              onClick={() => setDistinction(distinction)}
            >
              {DISTINCTION_LABELS[distinction]}
            </Chip>
          ))}
          <Chip
            active={filters.greenStar}
            onClick={() =>
              onChange({ ...filters, greenStar: !filters.greenStar })
            }
          >
            Green Star
          </Chip>
        </FilterGroup>

        <FilterGroup title="Price" defaultOpen={false}>
          {PRICE_OPTIONS.map(({ level, label }) => (
            <Chip
              key={level}
              active={filters.prices.includes(level)}
              onClick={() => setPrice(level)}
              variant="red"
            >
              {label}
            </Chip>
          ))}
        </FilterGroup>

        {options.cuisines.length > 0 && (
          <FilterGroup title="Cuisine" defaultOpen={false}>
            {options.cuisines.map((cuisine) => (
              <Chip
                key={cuisine}
                active={filters.cuisines.includes(cuisine)}
                onClick={() =>
                  onChange({
                    ...filters,
                    cuisines: toggleValue(filters.cuisines, cuisine),
                  })
                }
              >
                {cuisine}
              </Chip>
            ))}
          </FilterGroup>
        )}

        {options.diets.length > 0 && (
          <FilterGroup title="Dietary" defaultOpen={false}>
            {options.diets.map((tag) => (
              <Chip
                key={tag}
                active={filters.diets.includes(tag)}
                onClick={() =>
                  onChange({
                    ...filters,
                    diets: toggleValue(filters.diets, tag),
                  })
                }
              >
                {DIET_LABELS[tag] ?? tag}
              </Chip>
            ))}
          </FilterGroup>
        )}

        <FilterGroup title="Availability" defaultOpen={false}>
          {days.map((day) => (
            <Chip
              key={day}
              active={filters.openDays.includes(day)}
              onClick={() =>
                onChange({
                  ...filters,
                  openDays: toggleValue(filters.openDays, day),
                })
              }
            >
              {DAY_LABELS[day]?.slice(0, 3) ?? day}
            </Chip>
          ))}
          <Chip
            active={filters.servesLunch}
            onClick={() =>
              onChange({ ...filters, servesLunch: !filters.servesLunch })
            }
          >
            Lunch
          </Chip>
          <Chip
            active={filters.servesDinner}
            onClick={() =>
              onChange({ ...filters, servesDinner: !filters.servesDinner })
            }
          >
            Dinner
          </Chip>
          <Chip
            active={filters.onlineBooking}
            onClick={() =>
              onChange({ ...filters, onlineBooking: !filters.onlineBooking })
            }
          >
            Online booking
          </Chip>
        </FilterGroup>

        {options.services.length > 0 && (
          <FilterGroup title="Services" defaultOpen={false}>
            {options.services.map((tag) => (
              <Chip
                key={tag}
                active={filters.services.includes(tag)}
                onClick={() =>
                  onChange({
                    ...filters,
                    services: toggleValue(filters.services, tag),
                  })
                }
              >
                {SERVICE_LABELS[tag] ?? tag}
              </Chip>
            ))}
          </FilterGroup>
        )}

        <FilterGroup title="Area" defaultOpen={false}>
          <Chip
            active={filters.inMontrealCityOnly}
            onClick={() =>
              onChange({
                ...filters,
                inMontrealCityOnly: !filters.inMontrealCityOnly,
              })
            }
          >
            Central Montréal only
          </Chip>
        </FilterGroup>
      </div>
    </div>
  );
}
