"""Recover scope-relevant #503 pagination gaps and download only target images.

This helper consumes the metadata-first #503 snapshot and its pre-image review.
It does two bounded network jobs:
  1. retry scope-relevant incomplete galleries with Zeno's perpage=90 mode;
  2. download original images only for high-priority and visual-review target IDs.

Existing detail HTML/images are reused. Failed retries never replace prior successful
cache files. Zeno record IDs remain source-record IDs, not specimen IDs.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "research/zeno"
RESULTS = ROOT / "results"


def utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def load_collector():
    path = ROOT / "scripts/collect-zeno.py"
    spec = importlib.util.spec_from_file_location("collect_zeno", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load collector: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def recovery_priority(category_id: str) -> str:
    high = {"2740", "911", "15758", "796"}
    medium = {"24941", "914", "2144"}
    if category_id in high:
        return "high"
    if category_id in medium:
        return "medium"
    return "medium"


def recover_gaps(collector, opener, manifest: dict, dry_run: bool = False) -> dict:
    gap_path = CACHE / "coverage-gaps-503.json"
    gap_plan = json.loads(gap_path.read_text())
    known_ids = set(manifest.get("recordIds", []))
    rows = []
    recovered_records = []

    for gap in gap_plan.get("recoveryPriorityCategories", []):
        category_id = str(gap["categoryId"])
        url = (
            f"https://www.zeno.ru/showgallery.php?cat={category_id}"
            "&perpage=90&sortby=t&way=asc&page=1"
        )
        cache_path = CACHE / f"category-{category_id}-perpage90.html"
        if dry_run:
            rows.append({
                "categoryId": category_id,
                "url": url,
                "status": "dry_run",
                "previousObserved": gap.get("observedDirectCount"),
                "previousDeclared": gap.get("sourceDeclaredDirectCount"),
            })
            continue
        try:
            html = collector.fetch(opener, url, cache_path, refresh=False)
            ids = collector.photo_ids(html)
            declared = collector.direct_source_reported_count(html)
            new_ids = [rid for rid in ids if rid not in known_ids]
            detail_failures = []
            for rid in new_ids:
                try:
                    rec = collector.collect_record(opener, "503", rid, download=False, refresh=False)
                    recovered_records.append(rec)
                    known_ids.add(rid)
                except Exception as exc:
                    detail_failures.append({"id": rid, "error": str(exc)})
            rows.append({
                "categoryId": category_id,
                "title": gap.get("title"),
                "url": url,
                "rawGalleryHtml": str(cache_path.relative_to(ROOT)),
                "previousObserved": gap.get("observedDirectCount"),
                "previousDeclared": gap.get("sourceDeclaredDirectCount"),
                "perpage90Observed": len(ids),
                "perpage90Declared": declared,
                "newRecordIds": new_ids,
                "newRecordCount": len(new_ids),
                "detailFailures": detail_failures,
                "coverageStatus": (
                    "recovered_complete" if declared is not None and len(ids) >= declared
                    else "still_incomplete"
                ),
                "imagePriority": recovery_priority(category_id),
            })
        except Exception as exc:
            rows.append({
                "categoryId": category_id,
                "title": gap.get("title"),
                "url": url,
                "status": "fetch_failed",
                "error": str(exc),
                "imagePriority": recovery_priority(category_id),
            })

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "method": "scope-relevant incomplete galleries retried with perpage=90",
        "categories": rows,
        "recoveredRecords": recovered_records,
    }
    write_json(CACHE / "recovered-records-503.json", payload)
    return payload


def build_targets(plan: dict, recovery: dict, priority: str) -> list[dict]:
    rows = []
    seen = set()
    for row in plan.get("records", []):
        p = row.get("imagePriority")
        if priority != "all" and p != priority:
            continue
        rid = str(row["id"])
        if rid not in seen:
            rows.append({"id": rid, "priority": p, "origin": "preimage_review"})
            seen.add(rid)

    for category in recovery.get("categories", []):
        p = category.get("imagePriority", "medium")
        if priority != "all" and p != priority:
            continue
        for rid in category.get("newRecordIds", []):
            rid = str(rid)
            if rid not in seen:
                rows.append({"id": rid, "priority": p, "origin": f"recovered_category_{category['categoryId']}"})
                seen.add(rid)
    return rows


def package_results(run: dict, targets: list[dict], stamp: str) -> list[Path]:
    RESULTS.mkdir(parents=True, exist_ok=True)
    paths = []
    by_priority = {"high": [], "medium": []}
    success = set(run.get("successfulImageIds", []))
    for row in targets:
        if row["id"] in success:
            by_priority.setdefault(row["priority"], []).append(row["id"])

    metadata_files = [
        CACHE / "target-image-run-503.json",
        CACHE / "image-targets-503.json",
        CACHE / "coverage-gaps-503.json",
        CACHE / "recovered-records-503.json",
    ]
    recovery_html = list(CACHE.glob("category-*-perpage90.html"))
    recovery_detail_ids = {
        str(r.get("id"))
        for r in json.loads((CACHE / "recovered-records-503.json").read_text()).get("recoveredRecords", [])
    } if (CACHE / "recovered-records-503.json").exists() else set()
    recovery_details = [CACHE / f"{rid}.html" for rid in recovery_detail_ids if (CACHE / f"{rid}.html").exists()]

    for p in ("high", "medium"):
        ids = by_priority.get(p, [])
        if not ids:
            continue
        out = RESULTS / f"zeno-503-{p}-images-{stamp}.zip"
        with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, allowZip64=True) as zf:
            for rid in ids:
                img = ROOT / f"public/coins/zeno/{rid}.jpg"
                if img.exists():
                    zf.write(img, img.relative_to(ROOT))
            for f in metadata_files + recovery_html + recovery_details:
                if f.exists():
                    zf.write(f, f.relative_to(ROOT))
        paths.append(out)
    return paths


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--priority", choices=["all", "high", "medium"], default="all")
    parser.add_argument("--skip-recovery", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    collector = load_collector()
    opener = collector.make_opener()
    manifest = json.loads((CACHE / "manifest-503.json").read_text())
    plan = json.loads((CACHE / "image-targets-503.json").read_text())

    recovery = {"categories": [], "recoveredRecords": []}
    if not args.skip_recovery:
        recovery = recover_gaps(collector, opener, manifest, dry_run=args.dry_run)

    targets = build_targets(plan, recovery, args.priority)
    if args.dry_run:
        print(f"DRY_RUN targets={len(targets)} priority={args.priority}")
        return 0

    run = {
        "startedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "priority": args.priority,
        "targetCount": len(targets),
        "successfulImageIds": [],
        "failedImages": [],
        "skippedExisting": [],
        "recoverySummary": recovery.get("categories", []),
    }
    run_path = CACHE / "target-image-run-503.json"

    interrupted = False
    try:
        for idx, row in enumerate(targets, 1):
            rid = row["id"]
            target = ROOT / f"public/coins/zeno/{rid}.jpg"
            if target.exists():
                run["skippedExisting"].append(rid)
                if rid not in run["successfulImageIds"]:
                    run["successfulImageIds"].append(rid)
            else:
                try:
                    rec = collector.collect_record(opener, "503", rid, download=True, refresh=False)
                    if rec.get("image") and target.exists():
                        run["successfulImageIds"].append(rid)
                        print(f"[{idx}/{len(targets)}] {rid} OK")
                    else:
                        run["failedImages"].append({"id": rid, "error": "No verified image acquired"})
                        print(f"[{idx}/{len(targets)}] {rid} NO_IMAGE")
                except Exception as exc:
                    run["failedImages"].append({"id": rid, "error": str(exc)})
                    print(f"[{idx}/{len(targets)}] {rid} FAIL {exc}")
            if idx % 10 == 0:
                run["updatedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
                write_json(run_path, run)
    except KeyboardInterrupt:
        interrupted = True
        print("Interrupted by user; packaging partial successful results.", file=sys.stderr)
    finally:
        run["finishedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        run["interrupted"] = interrupted
        run["successfulImageCount"] = len(set(run["successfulImageIds"]))
        run["failedImageCount"] = len(run["failedImages"])
        write_json(run_path, run)
        stamp = utc_stamp()
        zips = package_results(run, targets, stamp)
        print(f"TARGETS={len(targets)}")
        print(f"SUCCESSFUL_IMAGES={run['successfulImageCount']}")
        print(f"FAILED_IMAGES={run['failedImageCount']}")
        for path in zips:
            print(f"RESULT_ZIP={path}")

    return 130 if interrupted else 0


if __name__ == "__main__":
    raise SystemExit(main())
