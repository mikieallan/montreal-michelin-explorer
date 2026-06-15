from __future__ import annotations

import hashlib
import os
import time
from pathlib import Path
from typing import Optional

import httpx

BASE_URL = "https://guide.michelin.com"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-CA,en;q=0.9",
}

CACHE_DIR = Path(__file__).resolve().parent / ".cache"
PLAYWRIGHT_BROWSERS = (
    Path(__file__).resolve().parent.parent / ".playwright-browsers"
)


def _cache_path(url: str) -> Path:
    digest = hashlib.sha256(url.encode()).hexdigest()[:24]
    return CACHE_DIR / f"{digest}.html"


def _is_blocked(html: str) -> bool:
    if len(html) < 5000:
        return "Request blocked" in html or "403 ERROR" in html
    return False


class Fetcher:
    def __init__(
        self,
        *,
        use_cache: bool = True,
        delay_seconds: float = 1.5,
        playwright_for_details: bool = True,
    ) -> None:
        self.use_cache = use_cache
        self.delay_seconds = delay_seconds
        self.playwright_for_details = playwright_for_details
        self._client = httpx.Client(
            headers=DEFAULT_HEADERS,
            follow_redirects=True,
            timeout=45.0,
        )
        self._playwright = None
        self._browser = None
        CACHE_DIR.mkdir(parents=True, exist_ok=True)

    def close(self) -> None:
        self._client.close()
        if self._browser:
            self._browser.close()
        if self._playwright:
            self._playwright.stop()

    def __enter__(self) -> Fetcher:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def _read_cache(self, url: str) -> Optional[str]:
        if not self.use_cache:
            return None
        path = _cache_path(url)
        if path.exists():
            return path.read_text(encoding="utf-8")
        return None

    def _write_cache(self, url: str, html: str) -> None:
        if self.use_cache:
            _cache_path(url).write_text(html, encoding="utf-8")

    def fetch_list(self, url: str) -> str:
        cached = self._read_cache(url)
        if cached and not _is_blocked(cached):
            return cached
        time.sleep(self.delay_seconds)
        response = self._client.get(url)
        response.raise_for_status()
        html = response.text
        if _is_blocked(html):
            raise RuntimeError(f"Blocked when fetching list page: {url}")
        self._write_cache(url, html)
        return html

    def fetch_detail(self, url: str) -> str:
        cached = self._read_cache(url)
        if cached and not _is_blocked(cached) and len(cached) > 10000:
            return cached

        if self.playwright_for_details:
            html = self._fetch_with_playwright(url)
        else:
            time.sleep(self.delay_seconds)
            response = self._client.get(url)
            response.raise_for_status()
            html = response.text

        if _is_blocked(html) or len(html) < 10000:
            raise RuntimeError(f"Failed to fetch detail page: {url}")

        self._write_cache(url, html)
        time.sleep(self.delay_seconds)
        return html

    def _fetch_with_playwright(self, url: str) -> str:
        if PLAYWRIGHT_BROWSERS.exists():
            os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(PLAYWRIGHT_BROWSERS)

        from playwright.sync_api import sync_playwright

        if self._playwright is None:
            self._playwright = sync_playwright().start()
            self._browser = self._playwright.chromium.launch(headless=True)

        assert self._browser is not None
        page = self._browser.new_page(user_agent=USER_AGENT)
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(1500)
            return page.content()
        finally:
            page.close()


def absolute_michelin_url(path_or_url: str) -> str:
    if path_or_url.startswith("http"):
        return path_or_url
    if not path_or_url.startswith("/"):
        path_or_url = "/" + path_or_url
    return BASE_URL + path_or_url


def slug_from_path(path: str) -> str:
    path = path.split("?")[0].rstrip("/")
    return path.split("/restaurant/")[-1]
