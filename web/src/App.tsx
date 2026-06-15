import { useEffect, useMemo, useState } from "react";
import type { Filters, ScrapeOutput, TabId } from "./types";
import { FilterPanel } from "./components/FilterPanel";
import { RestaurantMap } from "./components/RestaurantMap";
import { DetailDrawer } from "./components/DetailDrawer";
import { ListView } from "./components/ListView";
import { useShortlist } from "./hooks/useShortlist";
import {
  DEFAULT_FILTERS,
  collectFilterOptions,
  filterRestaurants,
} from "./utils/filters";

function App() {
  const [data, setData] = useState<ScrapeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [detailOpen, setDetailOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { shortlist, toggle, isSaved, count: shortlistCount } = useShortlist();

  useEffect(() => {
    fetch("/montreal_michelin.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load data (${response.status})`);
        }
        return response.json() as Promise<ScrapeOutput>;
      })
      .then(setData)
      .catch((fetchError: Error) => setError(fetchError.message));
  }, []);

  const restaurants = useMemo(() => data?.restaurants ?? [], [data]);
  const filtered = useMemo(
    () => filterRestaurants(restaurants, filters, shortlist),
    [restaurants, filters, shortlist],
  );
  const filterOptions = useMemo(
    () => collectFilterOptions(restaurants),
    [restaurants],
  );

  const visibleSelectedId =
    selectedId && filtered.some((r) => r.id === selectedId) ? selectedId : null;

  const selectedRestaurant =
    filtered.find((r) => r.id === visibleSelectedId) ??
    restaurants.find((r) => r.id === visibleSelectedId) ??
    null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  const showDetail = detailOpen && selectedRestaurant !== null;

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8 text-center text-michelin-red">
        <h1 className="text-xl font-semibold">Could not load restaurants</h1>
        <p className="mt-2 text-michelin-gray">{error}</p>
        <p className="mt-4 text-sm text-michelin-muted">
          Run <code className="rounded bg-michelin-surface px-1">python -m scraper.main</code> first.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-michelin-surface text-michelin-gray">
        <div className="text-center">
          <div className="mx-auto mb-3 h-1 w-16 bg-michelin-red" />
          <p>Loading Montréal restaurants…</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-michelin-surface">
      <header className="shrink-0 border-b border-michelin-border-light bg-white">
        <div className="h-1 bg-michelin-red" />
        <div className="flex items-end justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-michelin-red">
              MICHELIN Guide
            </p>
            <h1 className="truncate text-xl font-bold tracking-tight text-michelin-black md:text-2xl">
              The Brain Station Montreal Trip
            </h1>
            <p className="text-sm text-michelin-gray">
              {filtered.length} of {restaurants.length} restaurants
              {shortlistCount > 0 && (
                <span className="text-michelin-red"> · ★ {shortlistCount} saved</span>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <nav className="flex gap-1 rounded-lg border border-michelin-border bg-michelin-surface p-1">
              {(["map", "list"] as TabId[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? "bg-white text-michelin-black shadow-sm"
                      : "text-michelin-gray hover:text-michelin-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="rounded-lg border border-michelin-border bg-white px-3 py-2 text-sm font-medium text-michelin-black md:hidden"
            >
              Filters
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-michelin-border-light md:block">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            options={filterOptions}
            shortlistCount={shortlistCount}
          />
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col">
          {activeTab === "map" ? (
            <div className="min-h-0 flex-1 p-2 md:p-4">
              <RestaurantMap
                restaurants={filtered}
                selectedId={visibleSelectedId}
                shortlist={shortlist}
                onSelect={handleSelect}
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ListView
                restaurants={filtered}
                selectedId={visibleSelectedId}
                isSaved={isSaved}
                onSelect={handleSelect}
                onToggleSave={toggle}
              />
            </div>
          )}

          {showDetail && selectedRestaurant && (
            <DetailDrawer
              restaurant={selectedRestaurant}
              saved={isSaved(selectedRestaurant.id)}
              onToggleSave={toggle}
              onClose={() => setDetailOpen(false)}
            />
          )}
        </main>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[1100] md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 top-16 flex flex-col rounded-t-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-michelin-border-light px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-michelin-muted">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg px-2 py-1 text-michelin-muted"
              >
                Done
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                options={filterOptions}
                shortlistCount={shortlistCount}
              />
            </div>
          </div>
        </div>
      )}

      <footer className="shrink-0 border-t border-michelin-border-light bg-white px-4 py-2 text-center text-xs text-michelin-muted">
        Data from{" "}
        <a
          href="https://guide.michelin.com/ca/en/quebec/montreal_2433514/restaurants"
          target="_blank"
          rel="noopener noreferrer"
          className="text-michelin-red hover:underline"
        >
          MICHELIN Guide
        </a>
      </footer>
    </div>
  );
}

export default App;
