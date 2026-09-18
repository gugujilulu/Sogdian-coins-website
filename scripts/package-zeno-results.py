from __future__ import annotations

import argparse
import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZENODIR = ROOT / "research" / "zeno"
IMGDIR = ROOT / "public" / "coins" / "zeno"
RESULTDIR = ROOT / "results"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load_json(path: Path):
    try:
        return json.loads(path.read_text())
    except Exception:
        return None


def make_summary(category_id: str, manifest, collector_status: int, started_at: str | None) -> str:
    lines = [
        f"Zeno #{category_id} recursive collection summary",
        "======================================",
        f"Started at: {started_at or 'unknown'}",
        f"Packaged at: {utc_now()}",
        f"Collector exit status: {collector_status}",
    ]
    if not manifest:
        lines += [
            "Manifest: missing/unreadable",
            f"Cached category HTML files: {len(list(ZENODIR.glob('category-*.html')))}",
            f"Cached detail HTML files: {len([p for p in ZENODIR.glob('*.html') if p.stem.isdigit()])}",
            "Coverage gap: inspect the run log and preserved raw files.",
        ]
        return "\n".join(lines) + "\n"

    records = manifest.get("records", []) or []
    record_ids = {str(x) for x in manifest.get("recordIds", []) or []}
    records_by_id = {str(r.get("id")): r for r in records if r.get("id")}
    detail_ok = sum(1 for rid in record_ids if records_by_id.get(rid, {}).get("rawHtml"))
    image_ok = sum(1 for rid in record_ids if records_by_id.get(rid, {}).get("image"))
    failures = manifest.get("fetchFailures", []) or []
    category_failures = manifest.get("categoryFetchFailures", []) or []
    repeated = (manifest.get("pagination", {}) or {}).get("repeatedPages", []) or []
    tree = manifest.get("categoryTree", []) or []

    lines += [
        f"Source-declared direct records: {manifest.get('sourceReportedDirectCount', 'unknown')}",
        f"Source-declared subtree records: {manifest.get('sourceReportedSubtreeCount', 'unknown')}",
        f"Observed unique source IDs in subtree: {len(record_ids)}",
        f"Visited category nodes: {len(tree)}",
        f"Successful detail HTML records: {detail_ok}",
        f"Downloaded images represented in manifest: {image_ok}",
        f"Fetch failures: {len(failures)}",
        f"Category fetch failures: {len(category_failures)}",
        f"Coverage status: {manifest.get('coverageStatus', 'unknown')}",
        f"Pagination integrity: {(manifest.get('pagination', {}) or {}).get('integrity', 'unknown')}",
        f"Repeated pagination pages: {len(repeated)}",
    ]
    if collector_status != 0:
        lines.append("Run ended non-zero; completed caches remain resumable and are included where present.")
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--category", required=True)
    parser.add_argument("--collector-exit-status", type=int, default=0)
    parser.add_argument("--started-at")
    parser.add_argument("--log")
    parser.add_argument("--include-images", action="store_true")
    args = parser.parse_args()

    category_id = str(args.category)
    RESULTDIR.mkdir(parents=True, exist_ok=True)
    ZENODIR.mkdir(parents=True, exist_ok=True)
    manifest_path = ZENODIR / f"manifest-{category_id}.json"
    manifest = load_json(manifest_path) if manifest_path.exists() else None
    summary_path = ZENODIR / f"collection-summary-{category_id}.txt"
    summary_path.write_text(make_summary(category_id, manifest, args.collector_exit_status, args.started_at))
    run_meta = ZENODIR / f"collection-run-{category_id}.json"
    run_meta.write_text(json.dumps({
        "categoryId": category_id,
        "startedAt": args.started_at,
        "packagedAt": utc_now(),
        "collectorExitStatus": args.collector_exit_status,
        "manifestPresent": manifest_path.exists(),
        "includeImages": args.include_images,
    }, ensure_ascii=False, indent=2))

    paths: list[Path] = []
    paths.extend(sorted(ZENODIR.glob("category-*.html")))
    paths.extend(sorted(ZENODIR.glob("manifest-*.json")))
    paths.extend(sorted(p for p in ZENODIR.glob("*.html") if p.stem.isdigit()))
    for support in [
        ROOT / "research" / "coverage-scopes.json",
        ROOT / "research" / "central-asia-square-hole-scope.json",
        ROOT / "research" / "acquisition-queue.json",
        ROOT / "research" / "zeno" / "root-503-plan.json",
    ]:
        if support.exists():
            paths.append(support)
    paths.extend([summary_path, run_meta])
    if args.log:
        log_path = ROOT / args.log
        if log_path.exists():
            paths.append(log_path)
    if args.include_images:
        paths.extend(sorted(IMGDIR.glob("*.jpg")))

    seen = set()
    unique_paths = []
    for path in paths:
        if path.exists() and path.is_file() and str(path) not in seen:
            seen.add(str(path))
            unique_paths.append(path)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    suffix = "with-images" if args.include_images else "metadata"
    out = RESULTDIR / f"zeno-{category_id}-{suffix}-{stamp}.zip"
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in unique_paths:
            zf.write(path, path.relative_to(ROOT))

    print(summary_path.read_text(), end="")
    print(f"RESULT_ZIP={out.resolve()}")
    print(f"RESULT_FILES={len(unique_paths)}")


if __name__ == "__main__":
    main()
