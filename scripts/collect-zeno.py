"""Collect a source-preserving public Zeno category snapshot.

Usage:
    python scripts/collect-zeno.py --category 503 [--details | --download] [--refresh]

Default mode recursively snapshots category/gallery HTML only. --details also caches
record detail HTML and parsed source fields without downloading images. --download
adds original-image acquisition and implies --details.

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


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def unique(values):
    return list(dict.fromkeys(values))


def direct_gallery_section(html: str) -> str:
    # Zeno category pages may show a "Recent Posts" block containing descendants.
    # Only the explicit "Images X to Y of N" gallery is direct membership.
    matches = list(re.finditer(r'<div class="box__header ca">\s*Images\s+[^<]*?</div>', html, re.I | re.S))
    if not matches:
        return ""
    start = matches[-1].start()
    end_candidates = [
        x for x in [html.find('Quick Jump To', start), html.find('<!-- Footer begin -->', start)] if x >= 0
    ]
    end = min(end_candidates) if end_candidates else len(html)
    return html[start:end]


def photo_ids(html: str) -> list[str]:
    section = direct_gallery_section(html)
    return unique(re.findall(r"showphoto\.php\?photo=(\d+)", section))


def direct_source_reported_count(html: str) -> int | None:
    section = direct_gallery_section(html)
    if not section:
        return 0 if re.search(r'No\s+(?:photos|images)', html, re.I) else None
    match = re.search(r'Images\s+\d+\s+to\s+\d+\s+of\s+(\d+)', section, re.I)
    if match:
        return int(match.group(1))
    match = re.search(r'Images\s+(\d+)\s+of\s+(\d+)', section, re.I)
    if match:
        return int(match.group(2))
    return None


def direct_subcategories(html: str) -> list[dict[str, object]]:
    # The Subcategories table can include descendants at increasing indentation.
    # Direct children are exactly the rows at the minimum indentation level.
    table_match = re.search(
        r'<table[^>]*class=["\']tbl["\'][^>]*>.*?<th[^>]*>\s*Subcategories\s*</th>(.*?)</table>',
        html,
        re.I | re.S,
    )
    if not table_match:
        return []
    rows = []
    for row_html in re.findall(r'<tr[^>]*class=["\']highlighted["\'][^>]*>(.*?)</tr>', table_match.group(1), re.I | re.S):
        cell = re.search(
            r'<td[^>]*style=["\'][^"\']*padding-left:\s*(\d+)px[^"\']*["\'][^>]*>(.*?)</td>',
            row_html,
            re.I | re.S,
        )
        if not cell:
            continue
        link = re.search(r'showgallery\.php\?cat=(\d+)[^>]*>(.*?)</a>', cell.group(2), re.I | re.S)
        if not link:
            continue
        counts = re.findall(r'class=["\']lastnav__count["\']>\s*(\d+)\s*</div>', row_html, re.I | re.S)
        rows.append({
            "categoryId": link.group(1),
            "title": clean(link.group(2)),
            "indentPx": int(cell.group(1)),
            "declaredSubtreeCount": int(counts[0]) if counts else None,
        })
    if not rows:
        return []
    minimum = min(int(row["indentPx"]) for row in rows)
    return [row for row in rows if int(row["indentPx"]) == minimum]


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
        temp = path.with_suffix(path.suffix + ".part")
        try:
            with opener.open(url, timeout=30) as response:
                payload = response.read()
            text = payload.decode("utf-8", "replace")
            redirect = re.search(r'http-equiv="refresh" content="[^;]+; URL=([^"]+)', text, re.I)
            if redirect:
                url = urllib.parse.urljoin(url, unescape(redirect.group(1)))
                continue
            temp.write_bytes(payload)
            if not temp.stat().st_size:
                raise RuntimeError("empty response body")
            temp.replace(path)
            time.sleep(0.35)
            return text
        except Exception as exc:  # failures never replace a previous successful cache
            temp.unlink(missing_ok=True)
            last_error = exc
            if attempt < 2:
                time.sleep(1.0 + attempt)
    raise RuntimeError(f"Fetch failed for {url}: {last_error}")


def category_snapshot(opener, category_id: str, parent_category_id: str | None = None, refresh: bool = False):
    url = f"https://www.zeno.ru/showgallery.php?cat={category_id}"
    first_path = CACHE / f"category-{category_id}.html"
    first = fetch(opener, url, first_path, refresh=refresh)
    first_ids = photo_ids(first)
    direct_count = direct_source_reported_count(first)
    children = direct_subcategories(first)

    pages = []
    all_ids = list(first_ids)
    signatures = {tuple(first_ids): "first"}
    repeated = []
    fetched_page_numbers = {"1"}
    queued: dict[str, str] = {}
    for page_url in pagination_urls(first, category_id, url):
        number = page_number(page_url)
        if number != "1":
            queued.setdefault(number, page_url)

    while queued:
        number = sorted(queued, key=lambda x: int(x) if str(x).isdigit() else 10**9)[0]
        page_url = queued.pop(number)
        if number in fetched_page_numbers:
            continue
        fetched_page_numbers.add(number)
        page_path = CACHE / f"category-{category_id}-page{number}.html"
        legacy_path = None
        if str(number).isdigit() and int(number) >= 2:
            legacy_path = CACHE / f"category-{category_id}-page{int(number) - 2}.html"
        read_path = legacy_path if legacy_path and legacy_path.exists() and not page_path.exists() and not refresh else page_path
        html = fetch(opener, page_url, read_path, refresh=refresh)
        ids = photo_ids(html)
        signature = tuple(ids)
        duplicate_of = signatures.get(signature)
        if duplicate_of is not None:
            repeated.append({
                "categoryId": str(category_id),
                "page": number,
                "duplicateOf": duplicate_of,
                "recordIds": ids,
            })
        else:
            signatures[signature] = number
        pages.append({
            "page": number,
            "url": page_url,
            "rawHtml": str(read_path.relative_to(ROOT)),
            "recordCount": len(ids),
            "recordIds": ids,
            "duplicateOf": duplicate_of,
            "sha256": hashlib.sha256(html.encode()).hexdigest(),
        })
        all_ids.extend(ids)
        for discovered in pagination_urls(html, category_id, url):
            discovered_number = page_number(discovered)
            if discovered_number not in fetched_page_numbers and discovered_number != "1":
                queued.setdefault(discovered_number, discovered)

    observed = unique(all_ids)
    if direct_count is not None and len(observed) == direct_count:
        coverage_status = "observed_count_matches_direct_source_count"
    elif direct_count is not None and len(observed) < direct_count:
        coverage_status = "incomplete_direct_observed_links"
    elif direct_count is not None and len(observed) > direct_count:
        coverage_status = "direct_observed_links_exceed_source_count_review_required"
    else:
        coverage_status = "direct_count_unverified"
    if repeated and coverage_status != "observed_count_matches_direct_source_count":
        pagination_integrity = "failed_repeated_page_content"
    elif repeated:
        pagination_integrity = "repeated_page_content_but_count_matches_source"
    else:
        pagination_integrity = "no_repeat_detected"
    return {
        "categoryId": str(category_id),
        "parentCategoryId": str(parent_category_id) if parent_category_id is not None else None,
        "url": url,
        "rawGalleryHtml": str(first_path.relative_to(ROOT)),
        "directRecordIds": observed,
        "directRecordCount": len(observed),
        "directSourceReportedCount": direct_count,
        "children": children,
        "coverageStatus": coverage_status,
        "pagination": {
            "linksObserved": len(fetched_page_numbers) - 1,
            "pagesFetched": pages,
            "repeatedPages": repeated,
            "integrity": pagination_integrity,
            "note": "Repeated photo-ID sets are treated as pagination failure, not evidence of additional coverage.",
        },
    }


def gallery_snapshot(opener, category_id: str, refresh: bool = False):
    root_id = str(category_id)
    visited: set[str] = set()
    nodes: list[dict[str, object]] = []
    category_failures: list[dict[str, object]] = []
    membership: dict[str, list[str]] = {}

    def walk(current_id: str, parent_id: str | None = None, declared_from_parent: int | None = None):
        if current_id in visited:
            return
        visited.add(current_id)
        try:
            node = category_snapshot(opener, current_id, parent_category_id=parent_id, refresh=refresh)
        except Exception as exc:
            category_failures.append({
                "categoryId": current_id,
                "parentCategoryId": parent_id,
                "attemptedAt": utc_now(),
                "error": str(exc),
                "preservedCachedHtml": (CACHE / f"category-{current_id}.html").exists(),
            })
            return
        node["declaredSubtreeCountFromParent"] = declared_from_parent
        nodes.append(node)
        for record_id in node["directRecordIds"]:
            membership.setdefault(str(record_id), []).append(current_id)
        for child in node["children"]:
            child_id = str(child["categoryId"])
            if child_id in visited:
                continue
            walk(child_id, current_id, child.get("declaredSubtreeCount"))

    walk(root_id)
    root_node = next((node for node in nodes if node["categoryId"] == root_id), None)
    root_direct_count = root_node.get("directSourceReportedCount") if root_node else None
    direct_children = root_node.get("children", []) if root_node else []
    declared_child_total = sum(
        int(child["declaredSubtreeCount"])
        for child in direct_children
        if child.get("declaredSubtreeCount") is not None
    )
    subtree_reported = (int(root_direct_count) if root_direct_count is not None else 0) + declared_child_total if root_node else None
    if root_node and any(child.get("declaredSubtreeCount") is None for child in direct_children):
        subtree_reported = None
    baseline = expected_scope_count(root_id)
    observed = unique(record_id for node in nodes for record_id in node["directRecordIds"])
    expected = subtree_reported if subtree_reported is not None else baseline
    if expected is not None and len(observed) == expected and not category_failures:
        coverage_status = "observed_count_matches_subtree_source_count"
    elif expected is not None and len(observed) < expected:
        coverage_status = "incomplete_subtree_observed_links"
    elif expected is not None and len(observed) > expected:
        coverage_status = "subtree_observed_links_exceed_source_count_review_required"
    else:
        coverage_status = "subtree_count_unverified"

    repeated = []
    for node in nodes:
        repeated.extend(node["pagination"].get("repeatedPages", []))
    if repeated and coverage_status != "observed_count_matches_subtree_source_count":
        pagination_integrity = "failed_repeated_page_content"
    elif repeated:
        pagination_integrity = "repeated_page_content_but_count_matches_source"
    else:
        pagination_integrity = "no_repeat_detected"

    return {
        "url": f"https://www.zeno.ru/showgallery.php?cat={root_id}",
        "firstRawHtml": root_node.get("rawGalleryHtml") if root_node else f"research/zeno/category-{root_id}.html",
        "directRecordIds": list(root_node.get("directRecordIds", [])) if root_node else [],
        "recordIds": observed,
        "recordCategoryMembership": membership,
        "sourceReportedDirectCount": root_direct_count,
        "sourceReportedSubtreeCount": subtree_reported,
        "sourceReportedCount": subtree_reported,
        "scopeBaselineCount": baseline,
        "coverageStatus": coverage_status,
        "categoryTree": nodes,
        "categoryFetchFailures": category_failures,
        "pagination": {
            "categoriesVisited": len(nodes),
            "repeatedPages": repeated,
            "integrity": pagination_integrity,
            "note": "Pagination is evaluated independently inside every visited category; repeated pages preserve partial results and leave an explicit coverage gap.",
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
    image_errors = []
    if download:
        from PIL import Image

        out = ROOT / "public/coins/zeno"
        out.mkdir(parents=True, exist_ok=True)
        target = out / f"{record_id}.jpg"
        for image_url in candidates:
            temp = target.with_suffix(target.suffix + ".part")
            try:
                if not target.exists() or refresh:
                    with opener.open(unescape(image_url), timeout=30) as response:
                        payload = response.read()
                    temp.write_bytes(payload)
                    with Image.open(temp) as probe:
                        probe.verify()
                    temp.replace(target)
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
            except Exception as exc:
                temp.unlink(missing_ok=True)
                image_errors.append({"url": unescape(image_url), "error": str(exc)})
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
        "originalImageUrl": unescape(candidates[0]) if candidates else None,
        "imageCandidates": [unescape(x) for x in candidates],
        "image": image,
        "imageFetchErrors": image_errors,
        "breadcrumb": crumbs,
        "leafCategoryId": leaf,
        "inRequestedCategory": leaf == str(category_id) if leaf else None,
        "directlyInRequestedCategory": leaf == str(category_id) if leaf else None,
        "inRequestedSubtree": (str(category_id) in {row["categoryId"] for row in crumbs}) if crumbs else None,
        "squareHoleStatus": explicit_square_hole_status(narrative),
        "scopeReview": "pending",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--category", default="3106")
    parser.add_argument("--details", action="store_true", help="Cache/parse record detail HTML without downloading images.")
    parser.add_argument("--download", action="store_true", help="Download original record images; implies --details.")
    parser.add_argument("--refresh", action="store_true", help="Ignore cached HTML/images and refetch public sources.")
    args = parser.parse_args()

    opener = make_opener()
    snapshot = gallery_snapshot(opener, args.category, refresh=args.refresh)
    manifest_path = CACHE / f"manifest-{args.category}.json"
    existing = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    retrieved_on = datetime.now(timezone.utc).date().isoformat() if args.refresh or not existing else existing.get("retrievedOn") or datetime.now(timezone.utc).date().isoformat()
    existing_records = {str(r.get("id")): r for r in existing.get("records", []) if r.get("id")}

    # Preserve successful cached details/images even when a partial subtree crawl has not
    # re-observed their leaf category yet. Coverage counts use recordIds only.
    records_by_id = dict(existing_records)
    for record in records_by_id.values():
        crumbs = record.get("breadcrumb") or []
        crumb_ids = {str(row.get("categoryId")) for row in crumbs if row.get("categoryId") is not None}
        leaf = str(record.get("leafCategoryId")) if record.get("leafCategoryId") is not None else None
        record["inRequestedCategory"] = leaf == str(args.category) if leaf else None
        record["directlyInRequestedCategory"] = leaf == str(args.category) if leaf else None
        record["inRequestedSubtree"] = str(args.category) in crumb_ids if crumbs else None

    manifest = {
        "categoryId": str(args.category),
        "url": snapshot["url"],
        "retrievedOn": retrieved_on,
        "sourceReportedCount": snapshot["sourceReportedCount"],
        "sourceReportedDirectCount": snapshot["sourceReportedDirectCount"],
        "sourceReportedSubtreeCount": snapshot["sourceReportedSubtreeCount"],
        "scopeBaselineCount": snapshot["scopeBaselineCount"],
        "directRecordIds": snapshot["directRecordIds"],
        "directRecordCount": len(snapshot["directRecordIds"]),
        "recordIds": snapshot["recordIds"],
        "recordCount": len(snapshot["recordIds"]),
        "recordCategoryMembership": snapshot["recordCategoryMembership"],
        "countSemantics": f"Direct records belong to category {args.category} itself; subtree records are the unique union of direct gallery records from category {args.category} and recursively visited descendants. Parent branch totals are never added to child IDs as records.",
        "coverageStatus": snapshot["coverageStatus"],
        "pagination": snapshot["pagination"],
        "categoryTree": snapshot["categoryTree"],
        "categoryFetchFailures": snapshot["categoryFetchFailures"],
        "rawGalleryHtml": snapshot["firstRawHtml"],
        "lastRunAt": utc_now(),
        "records": [records_by_id[x] for x in sorted(records_by_id, key=lambda v: int(v) if v.isdigit() else v)],
        "fetchFailures": existing.get("fetchFailures", []) if not (args.details or args.download) else [],
    }
    for failure in snapshot["categoryFetchFailures"]:
        manifest["fetchFailures"].append({
            "id": None,
            "categoryId": failure.get("categoryId"),
            "url": f"https://www.zeno.ru/showgallery.php?cat={failure.get('categoryId')}",
            "phase": "gallery",
            "attemptedAt": failure.get("attemptedAt"),
            "error": failure.get("error"),
            "preservedPrevious": bool(failure.get("preservedCachedHtml")),
        })
    print(
        f"CATEGORY {args.category}: direct observed {manifest['directRecordCount']}; "
        f"subtree observed {manifest['recordCount']}; direct source={manifest['sourceReportedDirectCount']}; "
        f"subtree source={manifest['sourceReportedSubtreeCount']}; baseline={manifest['scopeBaselineCount']}",
        flush=True,
    )
    print("CATEGORIES", len(manifest["categoryTree"]), "PAGINATION", manifest["pagination"]["integrity"], flush=True)

    if args.details or args.download:
        for record_id in snapshot["recordIds"]:
            previous = records_by_id.get(record_id)
            try:
                record = collect_record(opener, args.category, record_id, download=args.download, refresh=args.refresh)
                if args.download and record.get("image") is None and previous and previous.get("image"):
                    record["image"] = previous["image"]
                    record["imageRefreshStatus"] = "failed_preserved_previous"
                    manifest["fetchFailures"].append({
                        "id": record_id,
                        "url": record["url"],
                        "phase": "image",
                        "attemptedAt": utc_now(),
                        "error": "; ".join(x.get("error", "") for x in record.get("imageFetchErrors", [])) or "No downloadable image candidate succeeded",
                        "preservedPrevious": True,
                    })
                elif args.download and record.get("image") is None:
                    manifest["fetchFailures"].append({
                        "id": record_id,
                        "url": record["url"],
                        "phase": "image",
                        "attemptedAt": utc_now(),
                        "error": "; ".join(x.get("error", "") for x in record.get("imageFetchErrors", [])) or "No downloadable image candidate succeeded",
                        "preservedPrevious": False,
                    })
                elif not args.download and previous and previous.get("image"):
                    record["image"] = previous["image"]
                record["observedDirectCategoryIds"] = snapshot["recordCategoryMembership"].get(record_id, [])
                records_by_id[record_id] = record
                print(record_id, record["title"], record.get("image") and [record["image"]["width"], record["image"]["height"]], flush=True)
            except Exception as exc:
                failure = {
                    "id": record_id,
                    "url": f"https://www.zeno.ru/showphoto.php?photo={record_id}",
                    "phase": "detail",
                    "attemptedAt": utc_now(),
                    "error": str(exc),
                    "preservedPrevious": bool(previous and not previous.get("error")),
                }
                manifest["fetchFailures"].append(failure)
                if previous and not previous.get("error"):
                    records_by_id[record_id] = previous
                else:
                    records_by_id[record_id] = {"id": record_id, "url": failure["url"], "error": str(exc)}
                print(record_id, str(exc), flush=True)
            manifest["records"] = [records_by_id[x] for x in sorted(records_by_id, key=lambda v: int(v) if v.isdigit() else v)]
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print("MANIFEST", manifest_path, flush=True)


if __name__ == "__main__":
    main()
