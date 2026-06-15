from __future__ import annotations

from typing import Callable

from bs4 import BeautifulSoup

from scraper.fetch import Fetcher, absolute_michelin_url
from scraper.list_parser import list_page_urls, parse_list_page

GOOD_FOR_FILTERS = {
    "solo-dining",
    "groups",
    "family-friendly",
    "date-night",
    "farm-to-table",
    "outdoor-dining",
    "iconic",
    "chefs-table",
    "eat-like-a-local",
    "inspectors-favorite",
}

DIET_FILTERS = {
    "vegan",
    "vegetarian-options",
    "halal",
    "koshel",
}

SERVICE_FILTERS = {
    "disabled_access",
    "terrace",
    "brunch",
}

DAY_FILTERS = {
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
}

GOOD_FOR_SLUGS: dict[str, str] = {
    "solo-dining": "solo_dining",
    "groups": "groups",
    "family-friendly": "family_friendly",
    "date-night": "date_night",
    "farm-to-table": "farm_to_table",
    "counter": "counter_dining",
    "outdoor-dining": "outdoor_dining",
    "iconic": "iconic",
    "chefs-table": "chefs_table",
    "eat-like-a-local": "eat_like_a_local",
    "inspectors-favorite": "inspectors_favorite",
}

DIET_SLUGS: dict[str, str] = {
    "vegan": "vegan_options",
    "vegetarian-options": "vegetarian_options",
    "halal": "halal_options",
    "koshel": "kosher_options",
}

SERVICE_SLUGS: dict[str, str] = {
    "disabled_access": "wheelchair_access",
    "terrace": "terrace",
    "brunch": "brunch",
}


def _parse_filter_inputs(html: str) -> list[dict[str, str]]:
    soup = BeautifulSoup(html, "lxml")
    filters: list[dict[str, str]] = []
    for inp in soup.select('input[data-type="filters"]'):
        url = inp.get("data-url")
        value = inp.get("value")
        name = inp.get("name")
        if not url or not value or not name:
            continue
        filters.append({"name": name, "value": value, "url": url})
    return filters


def _restaurant_ids_from_filter_page(html: str) -> set[str]:
    ids: set[str] = set()
    for entry in parse_list_page(html):
        ids.add(entry.id)
    return ids


def collect_filter_metadata(
    fetcher: Fetcher,
    *,
    progress: Callable[[str], None] | None = None,
) -> dict[str, dict[str, set[str] | bool]]:
    list_html = fetcher.fetch_list(list_page_urls()[0])
    filters = _parse_filter_inputs(list_html)

    metadata: dict[str, dict[str, set[str] | bool]] = {}

    def ensure(restaurant_id: str) -> dict[str, set[str] | bool]:
        if restaurant_id not in metadata:
            metadata[restaurant_id] = {
                "good_for": set(),
                "special_diets": set(),
                "services": set(),
                "open_days": set(),
                "serves_lunch": False,
                "serves_dinner": False,
                "online_booking": False,
            }
        return metadata[restaurant_id]

    total = len(filters)
    for index, filt in enumerate(filters, start=1):
        name = filt["name"]
        value = filt["value"]
        url_path = filt["url"]

        if progress:
            progress(f"[filters {index}/{total}] {name}={value}")

        if name == "tagThematics" and value not in GOOD_FOR_FILTERS:
            continue
        if name == "diet" and value not in DIET_FILTERS:
            continue
        if name == "services" and value not in SERVICE_FILTERS and value != "counter":
            continue
        if name == "days" and value not in DAY_FILTERS:
            continue
        if name == "providers" and value not in {"lunch", "dinner", "opentable", "resy"}:
            continue
        if name in {"awards", "prices", "cuisines"}:
            continue

        url = absolute_michelin_url(url_path)
        html = fetcher.fetch_list(url)
        restaurant_ids = _restaurant_ids_from_filter_page(html)

        page = 2
        while True:
            page_url = absolute_michelin_url(f"{url_path}/page/{page}")
            try:
                page_html = fetcher.fetch_list(page_url)
            except Exception:
                break
            page_ids = _restaurant_ids_from_filter_page(page_html)
            if not page_ids:
                break
            restaurant_ids |= page_ids
            page += 1

        for restaurant_id in restaurant_ids:
            meta = ensure(restaurant_id)
            if name == "tagThematics":
                slug = GOOD_FOR_SLUGS.get(value)
                if slug:
                    meta["good_for"].add(slug)  # type: ignore[union-attr]
            elif name == "diet":
                slug = DIET_SLUGS.get(value)
                if slug:
                    meta["special_diets"].add(slug)  # type: ignore[union-attr]
            elif name == "services":
                slug = SERVICE_SLUGS.get(value)
                if slug:
                    meta["services"].add(slug)  # type: ignore[union-attr]
                if value == "counter":
                    meta["good_for"].add("counter_dining")  # type: ignore[union-attr]
            elif name == "days":
                meta["open_days"].add(value)  # type: ignore[union-attr]
            elif name == "providers":
                if value == "lunch":
                    meta["serves_lunch"] = True
                elif value == "dinner":
                    meta["serves_dinner"] = True
                elif value in {"opentable", "resy"}:
                    meta["online_booking"] = True

    return metadata


def merge_metadata(restaurant_id: str, meta: dict[str, set[str] | bool] | None) -> dict:
    if not meta:
        return {
            "good_for_extra": [],
            "special_diets": [],
            "services": [],
            "open_days": [],
            "serves_lunch": False,
            "serves_dinner": False,
            "online_booking_filter": False,
        }
    return {
        "good_for_extra": sorted(meta.get("good_for", set())),  # type: ignore[arg-type]
        "special_diets": sorted(meta.get("special_diets", set())),  # type: ignore[arg-type]
        "services": sorted(meta.get("services", set())),  # type: ignore[arg-type]
        "open_days": sorted(meta.get("open_days", set())),  # type: ignore[arg-type]
        "serves_lunch": bool(meta.get("serves_lunch")),
        "serves_dinner": bool(meta.get("serves_dinner")),
        "online_booking_filter": bool(meta.get("online_booking")),
    }
