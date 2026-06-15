from __future__ import annotations

import re
from typing import Iterable

from bs4 import BeautifulSoup, Tag

from scraper.fetch import absolute_michelin_url, slug_from_path
from scraper.models import ListEntry

LIST_BASE = (
    "https://guide.michelin.com/ca/en/quebec/montreal_2433514/restaurants"
)


def list_page_urls() -> list[str]:
    return [LIST_BASE, f"{LIST_BASE}/page/2"]


def parse_price_cuisine(text: str) -> tuple[str | None, str | None]:
    match = re.search(r"(\$+)\s*[·•]\s*(.+)$", text.strip())
    if not match:
        return None, None
    return match.group(1), match.group(2).strip()


def _distinction_hint(card: Tag) -> str | None:
    for node in card.select("[data-dtm-distinction]"):
        value = (node.get("data-dtm-distinction") or "").strip()
        if value:
            return value
    return None


def _map_pin_name(card: Tag) -> str | None:
    value = (card.get("data-map-pin-name") or "").strip()
    return value or None


def parse_list_page(html: str, *, allowed_prefix: str | None = None) -> list[ListEntry]:
    soup = BeautifulSoup(html, "lxml")
    entries: list[ListEntry] = []
    seen: set[str] = set()

    for card in soup.select(".js-restaurant__list_item"):
        link = card.select_one("h3 a[href*='/restaurant/']")
        if not link:
            link = card.find("a", href=lambda h: h and "/restaurant/" in h)
        if not link:
            continue

        path = link["href"].split("?")[0]
        if allowed_prefix and not path.startswith(allowed_prefix):
            continue

        slug = slug_from_path(path)
        if slug in seen:
            continue
        seen.add(slug)

        name = link.get_text(strip=True)
        lat = _to_float(card.get("data-lat"))
        lng = _to_float(card.get("data-lng"))

        price, cuisine = None, None
        footer = card.select_one(".card__menu-footer, .card__menu-content--desc")
        if footer:
            price, cuisine = parse_price_cuisine(footer.get_text(" ", strip=True))

        entries.append(
            ListEntry(
                id=slug,
                name=name,
                michelin_path=path,
                lat=lat,
                lng=lng,
                price=price,
                cuisine=cuisine,
                distinction_hint=_distinction_hint(card),
                map_pin_name=_map_pin_name(card),
            )
        )

    return entries


def _to_float(value: str | None) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def collect_list_entries(html_pages: Iterable[str]) -> list[ListEntry]:
    allowed_prefix = "/ca/en/quebec/"
    merged: dict[str, ListEntry] = {}
    for html in html_pages:
        for entry in parse_list_page(html, allowed_prefix=allowed_prefix):
            merged[entry.id] = entry
    return list(merged.values())
