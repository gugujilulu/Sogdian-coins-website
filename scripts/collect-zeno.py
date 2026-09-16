"""Collect a source-preserving public Zeno category snapshot.

Usage:
    python scripts/collect-zeno.py --category 3106 [--download] [--refresh]

The collector follows ordinary public PHP-session forwarding. It does not log in,
bypass restrictions, or treat observed gallery links as proof of completeness.
Pagination integrity and the source-reported category count are recorded separately
so a repeated first page cannot be mistaken for a finished census.
"""
from __future__ import annotations

import argparse
import hashlib
import http.cookiejar
import json
import re
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "research/zeno"
CACHE.mkdir(exist_ok=True)


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def unique(values):
    return list(dict.fromkeys(values))


def photo_ids(html: str) -> list[str]:
    return unique(re.findall(r"showphoto\.php\?photo=(\d+)", html))


def pagination_urls(html: str, category_id: str, base_url: str) -> list[str]:
    urls = []
    for raw in re.findall(r'href=["\']([^"\']*showgallery\.php[^"\']*page=[^"\']+)["\']', html, re.I):
        absolute = urllib.parse.urljoin(base_url, unescape(raw))
        query = urllib.parse.parse_qs(urllib.parse.urlparse(absolute).query)
        if query.get("cat", [None])[0] == category_id:
            urls.append(absolute)
    return unique(urls)


def page_number(url: str) -> str:
    return urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get("page", ["unknown"])[0]


def source_reported_count(html: str, category_id: str) -> int | None:
    # Zeno breadcrumb/category links commonly render the category total as [N].
    pattern = (
        r"showgallery\.php\?cat="
        + re.escape(category_id)
        + r'[^"\']*["\'][^>]*>.*?</a>\s*<span[^>]*>\s*\[(\d+)\]'
    )
    matches = [int(x) for x in re.findall(pattern, html, re.I | re.S)]
    return max(matches) if matches else None


def expected_scope_count(category_id: str) -> int | None:
    path = ROOT / "research/coverage-scopes.json"
    if not path.exists():
        return None
    for row in json.loads(path.read_text()):
        if str(row.get("categoryId")) == str(category_id):
            return row.get("sourcePhotoCount")
    return None


def breadcrumb(html: str) -> list[dict[str, str]]:
    # Restrict to the navigation area before the photo body to avoid footer repeats.
    head = html[: html.find("showphoto__navbuttons") if "showphoto__navbuttons" in html else 9000]
    rows = []
    for category_id, label in re.findall(
        r'href=["\']https?://www\.zeno\.ru/showgallery\.php\?cat=(\d+)["\'][^>]*>(.*?)</a>',
        head,
        re.I | re.S,
    ):
        rows.append({"categoryId": category_id, "title": clean(label)})
    deduped = []
    seen = set()
    for row in rows:
        key = row["categoryId"]
        if key not in seen:
            deduped.append(row)
            seen.add(key)
    return deduped


def source_fields(html: str) -> dict[str, str]:
    fields = {}
    for label, raw in re.findall(r'<div style="padding: 4px;"><b>([^<]+):</b>\s*(.*?)</div>', html, re.I | re.S):
        fields[clean(label)] = clean(raw)
    return fields


def photo_note(html: str) -> str | None:
    match = re.search(
        r'<div class="box__header">Photo Details</div>(.*?)(?:<div class="box"|</td>)',
        html,
        re.I | re.S,
    )
    if not match:
        return None
    notes = []
    for raw in re.findall(r'<div style="padding: 4px;">(.*?)</div>', match.group(1), re.I | re.S):
        if '<b>' in raw.lower():
            continue
        value = clean(raw)
        if value:
            notes.append(value)
    return ' '.join(notes) or None


def uploader_info(html: str) -> dict[str, str] | None:
    cutoff = html.find('Photo Details')
    head = html[:cutoff] if cutoff >= 0 else html[:9000]
    matches = re.findall(
        r'member\.php\?uid=(\d+)[^>]*>\s*<span[^>]*>([^<]+)</span>',
        head,
        re.I | re.S,
    )
    if not matches:
        return None
    uid, name = matches[-1]
    return {
        'name': clean(name),
        'memberId': uid,
        'profileUrl': f'https://www.zeno.ru/member.php?uid={uid}',
    }


def explicit_square_hole_status(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text).lower()
    if re.search(r"\bsquare[- ]hole(?:d)?\b|\bsquare aperture\b", normalized):
        return "explicit_text_yes"
    if re.search(r"\bwithout (?:a )?hole\b|\bno hole\b", normalized):
        return "explicit_text_no"
    return "unknown"


def make_opener():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))


def fetch(opener, url: str, path: Path, refresh: bool = False) -> str:
    if path.exists() and not refresh:
        return path.read_text(errors="replace")
    last_error = None
    for attempt in range(3):
        try:
            with opener.open(url, timeout=30) as response:
                text = response.read().decode("utf-8", "replace")
            redirect = re.search(r'http-equiv="refresh" content="[^;]+; URL=([^"]+)', text, re.I)
            if redirect:
                url = urllib.parse.urljoin(url, unescape(redirect.group(1)))
                continue
            path.write_text(text)
            time.sleep(0.35)
            return text
        except Exception as exc:  # network failures are persisted only in the manifest, never hidden
            last_error = exc
            if attempt < 2:
                time.sleep(1.0 + attempt)
    raise RuntimeError(f"Fetch failed for {url}: {last_error}")


def gallery_snapshot(opener, category_id: str, refresh: bool = False):
    url = f"https://www.zeno.ru/showgallery.php?cat={category_id}"
    first_path = CACHE / f"category-{category_id}.html"
    first = fetch(opener, url, first_path, refresh=refresh)
    first_ids = photo_ids(first)
    pages = []
    all_ids = list(first_ids)
    signatures = {tuple(first_ids): "first"}
    repeated = []
    for page_index, page_url in enumerate(pagination_urls(first, category_id, url)):
        number = page_number(page_url)
        page_path = CACHE / f"category-{category_id}-page{number}.html"
        legacy_path = CACHE / f"category-{category_id}-page{page_index}.html"
        read_path = legacy_path if legacy_path.exists() and not page_path.exists() and not refresh else page_path
        html = fetch(opener, page_url, read_path, refresh=refresh)
        ids = photo_ids(html)
        signature = tuple(ids)
        duplicate_of = signatures.get(signature)
        if duplicate_of is not None:
            repeated.append({"page": number, "duplicateOf": duplicate_of, "recordIds": ids})
        else:
            signatures[signature] = number
        pages.append(
            {
                "page": number,
                "url": page_url,
                "rawHtml": str(read_path.relative_to(ROOT)),
                "recordCount": len(ids),
                "recordIds": ids,
                "duplicateOf": duplicate_of,
                "sha256": hashlib.sha256(html.encode()).hexdigest(),
            }
        )
        all_ids.extend(ids)
    observed = unique(all_ids)
    reported = source_reported_count(first, category_id)
    baseline = expected_scope_count(category_id)
    expected = reported if reported is not None else baseline
    if expected is not None and len(observed) == expected:
        coverage_status = "observed_count_matches_source_count"
    elif expected is not None and len(observed) < expected:
        coverage_status = "incomplete_observed_links"
    elif expected is not None and len(observed) > expected:
        coverage_status = "observed_links_exceed_source_count_review_required"
    else:
        coverage_status = "count_unverified"
    if repeated and coverage_status != "observed_count_matches_source_count":
        pagination_integrity = "failed_repeated_page_content"
    elif repeated:
        pagination_integrity = "repeated_page_content_but_count_matches_source"
    else:
        pagination_integrity = "no_repeat_detected"
    return {
        "url": url,
        "firstRawHtml": str(first_path.relative_to(ROOT)),
        "recordIds": observed,
        "sourceReportedCount": reported,
        "scopeBaselineCount": baseline,
        "coverageStatus": coverage_status,
        "pagination": {
            "linksObserved": len(pagination_urls(first, category_id, url)),
            "pagesFetched": pages,
            "repeatedPages": repeated,
            "integrity": pagination_integrity,
            "note": "Repeated photo-ID sets are treated as pagination failure, not evidence of additional coverage.",
        },
    }


def parse_measurement(text: str, label: str):
    match = re.search(re.escape(label) + r"\s*([\d.,]+)", text)
    return float(match.group(1).replace(",", ".")) if match else None


def collect_record(opener, category_id: str, record_id: str, download: bool, refresh: bool = False):
    url = f"https://www.zeno.ru/showphoto.php?photo={record_id}"
    raw_path = CACHE / f"{record_id}.html"
    html = fetch(opener, url, raw_path, refresh=refresh)
    title_match = re.search(r"<title>(.*?)</title>", html, re.S | re.I)
    title = clean(title_match.group(1)) if title_match else f"Zeno {record_id}"
    images = [
        x
        for x in re.findall(r'(?:src|href)=[\'\"]([^\'\"]+/data/[^\'\"]+)[\'\"]', html)
        if "/avatars/" not in x
    ]
    big = re.findall(r"openBigWindow\('([^']+)", html)
    candidates = unique([x for x in big if "/data/" in x] + [x.replace("/medium/", "/") for x in images] + images)
    image = None
    if download:
        from PIL import Image

        out = ROOT / "public/coins/zeno"
        out.mkdir(parents=True, exist_ok=True)
        target = out / f"{record_id}.jpg"
        for image_url in candidates:
            try:
                if not target.exists() or refresh:
                    with opener.open(unescape(image_url), timeout=30) as response:
                        target.write_bytes(response.read())
                with Image.open(target) as probe:
                    probe.verify()
                with Image.open(target) as probe:
                    width, height = probe.size
                image = {
                    "url": unescape(image_url),
                    "path": f"/coins/zeno/{record_id}.jpg",
                    "width": width,
                    "height": height,
                    "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                }
                break
            except Exception:
                target.unlink(missing_ok=True)
    text = re.sub(r"\s+", " ", clean(html))
    fields = source_fields(html)
    note = photo_note(html)
    uploader = uploader_info(html)
    crumbs = breadcrumb(html)
    leaf = crumbs[-1]["categoryId"] if crumbs else None
    narrative = " ".join(x for x in [title, note or "", fields.get("Keywords", "")] if x)
    if image is not None:
        image["credit"] = uploader["name"] if uploader else "Zeno.ru uploader not parsed"
        image["rightsStatus"] = "source_terms_apply_unverified"
        image["sourceTermsUrl"] = "https://www.zeno.ru/rules.php"
    return {
        "id": record_id,
        "url": url,
        "rawHtml": str(raw_path.relative_to(ROOT)),
        "title": title,
        "description": note or title,
        "photoNote": note,
        "sourceFields": fields,
        "uploadDateText": fields.get("Upload Date"),
        "dateText": fields.get("Date"),
        "mintText": fields.get("Mint"),
        "metalText": fields.get("Metal"),
        "weightText": fields.get("Weight, g"),
        "sizeText": fields.get("Size, mm"),
        "weightG": parse_measurement(text, "Weight, g:"),
        "diameterMm": parse_measurement(text, "Size, mm:"),
        "uploader": uploader,
        "rights": {
            "status": "source_terms_apply_unverified",
            "sourceTermsUrl": "https://www.zeno.ru/rules.php",
            "note": "Uploader attribution is preserved from the source page; downstream reuse rights are not inferred.",
        },
        "image": image,
        "breadcrumb": crumbs,
        "leafCategoryId": leaf,
        "inRequestedCategory": leaf == str(category_id) if leaf else None,
        "squareHoleStatus": explicit_square_hole_status(narrative),
        "scopeReview": "pending",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--category", default="3106")
    parser.add_argument("--download", action="store_true")
    parser.add_argument("--refresh", action="store_true", help="Ignore cached HTML/images and refetch public sources.")
    args = parser.parse_args()

    opener = make_opener()
    snapshot = gallery_snapshot(opener, args.category, refresh=args.refresh)
    manifest_path = CACHE / f"manifest-{args.category}.json"
    existing = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    retrieved_on = existing.get("retrievedOn") or datetime.now(timezone.utc).date().isoformat()
    manifest = {
        "categoryId": str(args.category),
        "url": snapshot["url"],
        "retrievedOn": retrieved_on,
        "sourceReportedCount": snapshot["sourceReportedCount"],
        "scopeBaselineCount": snapshot["scopeBaselineCount"],
        "recordIds": snapshot["recordIds"],
        "recordCount": len(snapshot["recordIds"]),
        "countSemantics": "Observed unique photo links only; source count and pagination integrity are tracked separately and completeness is never inferred from links alone.",
        "coverageStatus": snapshot["coverageStatus"],
        "pagination": snapshot["pagination"],
        "rawGalleryHtml": snapshot["firstRawHtml"],
        "records": [] if args.download else existing.get("records", []),
    }
    print(f"CATEGORY {args.category}: observed {manifest['recordCount']} links; source={manifest['sourceReportedCount']}; baseline={manifest['scopeBaselineCount']}", flush=True)
    print("PAGINATION", manifest["pagination"]["integrity"], flush=True)

    if args.download:
        for record_id in snapshot["recordIds"]:
            try:
                record = collect_record(opener, args.category, record_id, download=True, refresh=args.refresh)
                manifest["records"].append(record)
                print(record_id, record["title"], record["image"] and [record["image"]["width"], record["image"]["height"]], flush=True)
            except Exception as exc:
                manifest["records"].append({"id": record_id, "url": f"https://www.zeno.ru/showphoto.php?photo={record_id}", "error": str(exc)})
                print(record_id, str(exc), flush=True)
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print("MANIFEST", manifest_path, flush=True)


if __name__ == "__main__":
    main()
