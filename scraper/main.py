from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from scraper.detail_parser import parse_detail_page
from scraper.fetch import Fetcher, absolute_michelin_url
from scraper.filter_metadata import collect_filter_metadata, merge_metadata
from scraper.list_parser import collect_list_entries, list_page_urls
from scraper.models import ScrapeOutput

DEFAULT_OUTPUT = Path("data/montreal_michelin.json")
LIST_SOURCE = (
    "https://guide.michelin.com/ca/en/quebec/montreal_2433514/restaurants"
)


def run_scrape(
    *,
    output: Path,
    use_cache: bool = True,
    limit: int | None = None,
    delay: float = 1.0,
    skip_filters: bool = False,
) -> ScrapeOutput:
    with Fetcher(use_cache=use_cache, delay_seconds=delay) as fetcher:
        filter_map: dict = {}
        if not skip_filters:
            print("Collecting filter metadata from list pages…", file=sys.stderr)
            filter_map = collect_filter_metadata(
                fetcher,
                progress=lambda msg: print(msg, file=sys.stderr),
            )

        list_html = [fetcher.fetch_list(url) for url in list_page_urls()]
        entries = collect_list_entries(list_html)
        if limit is not None:
            entries = entries[:limit]

        restaurants = []
        for index, entry in enumerate(entries, start=1):
            url = absolute_michelin_url(entry.michelin_path)
            print(f"[{index}/{len(entries)}] {entry.name}", file=sys.stderr)
            html = fetcher.fetch_detail(url)
            meta = merge_metadata(entry.id, filter_map.get(entry.id))
            restaurants.append(parse_detail_page(html, entry, filter_meta=meta))

    scraped_at = datetime.now(timezone.utc).isoformat()
    payload = ScrapeOutput(
        source_url=LIST_SOURCE,
        restaurant_count=len(restaurants),
        scraped_at=scraped_at,
        restaurants=restaurants,
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload.model_dump(mode="json"), indent=2, ensure_ascii=False)
        + "\n",
        encoding="utf-8",
    )

    public_copy = Path("web/public/montreal_michelin.json")
    public_copy.parent.mkdir(parents=True, exist_ok=True)
    public_copy.write_text(output.read_text(encoding="utf-8"), encoding="utf-8")

    return payload


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape Montreal Michelin Guide restaurants."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output JSON path",
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Ignore cached HTML responses",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Scrape only the first N restaurants (smoke test)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Delay between detail page fetches in seconds",
    )
    parser.add_argument(
        "--skip-filters",
        action="store_true",
        help="Skip list-page filter metadata collection",
    )
    args = parser.parse_args()

    payload = run_scrape(
        output=args.output,
        use_cache=not args.refresh,
        limit=args.limit,
        delay=args.delay,
        skip_filters=args.skip_filters,
    )
    print(
        f"Wrote {payload.restaurant_count} restaurants to {args.output}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
