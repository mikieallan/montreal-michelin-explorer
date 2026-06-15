# Montreal Michelin Guide — Map Explorer

One-time scrape of all [Michelin-recommended Montreal restaurants](https://guide.michelin.com/ca/en/quebec/montreal_2433514/restaurants), displayed on a map-first explorer with Good For tag filters and a weekend shortlist.

## Quick start

```bash
# 1. Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers playwright install chromium

# 2. One-time scrape (~5–8 min for 63 restaurants)
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers python -m scraper.main

# 3. Web app
cd web && npm install && npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scraper

```bash
python -m scraper.main                  # full scrape → data/montreal_michelin.json
python -m scraper.main --limit 5        # smoke test
python -m scraper.main --skip-filters   # detail pages only
```

The scraper:

1. Reads filter metadata from Michelin list-page filters (Good For tags, dietary, services, open days).
2. Reads both list pages (~63 restaurants).
3. Visits each detail page with Playwright for hours, coordinates, and distinction.
4. Writes JSON to `data/montreal_michelin.json` and `web/public/montreal_michelin.json`.

## Web app

- **Map-first** — full-bleed Leaflet map with distinction-colored pins
- **Good for filters** — solo dining, farm-to-table, groups, etc.
- **Shortlist** — star restaurants, saved in localStorage
- **Mobile** — filter bottom sheet, horizontal restaurant strip

## Deploy on Vercel

Import the repo; root `vercel.json` builds from `web/`. Commit `web/public/montreal_michelin.json` so deploys do not require running the scraper.

## Data fields

| Field | Description |
|-------|-------------|
| `good_for` | Tags: `solo_dining`, `farm_to_table`, `groups`, etc. |
| `distinction` | `three_stars`, `two_stars`, `one_star`, `bib_gourmand`, `selected` |
| `in_montreal_city` | `false` for outer suburbs |

Data is for personal trip planning. [MICHELIN Guide](https://guide.michelin.com/) is the source of truth.
