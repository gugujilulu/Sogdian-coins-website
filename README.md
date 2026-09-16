# Sogdian Coins Atlas

An interactive spatial–temporal research atlas of Sogdian-related square-holed coinage. Semirechye is the core scope, connected to Sogdiana, Tokharistan and Xinjiang.

## Current edition

A real draggable MapLibre terrain map; historical city/site anchors; family → catalogue grouping → specimen galleries; date and region filtering; original-resolution images; source and bibliography links; exploration vault; explicit source-coverage accounting.

The Lady Nana collection includes all 14 Zeno category 3106 records in the 2026-09-16 snapshot plus other-source records: 20 specimen records and 22 images after confirmed repeat-source merges. The whole export currently has 32 specimen records and 34 images. Neither count is a complete corpus census. Semirechye's 569 source photo records have a saved category baseline, with import and scope review outstanding.

Circulation polygons and hoard points have supported model/layers but no verified type-specific data yet. Do not claim the distribution map is complete. Detailed results and limitations: `docs/implementation-2026-09-16.md`.

## Data and reproducibility

- `public/data/atlas.json`: normalized display export.
- `research/`: image provenance, primary-page metadata, category snapshots and coverage baselines.
- `db/schema.sql`: relational model, hierarchy, attributions, specimen identity, geography, manufacture links and evidence.
- `scripts/build-atlas.py`: source-register → display export.
- `scripts/export-atlas-db.py OUTPUT`: reproducible SQLite research database.
- `scripts/validate-atlas.py`: coverage and evidence/identity invariants; Lady Nana coverage stays independently scoped as new Zeno categories are added.
- `scripts/collect-zeno.py --category ID --download`: public, cached source retrieval with source-count and pagination-integrity tracking; observed-link totals alone are not completeness claims.
- `python -m unittest tests/test_collect_zeno.py -v`: offline regression checks against the cached Lady Nana gallery, including repeated-pagination detection.

Python data scripts require Pillow. Website uses TypeScript, React/Vinext, MapLibre GL and the existing Shadcn primitives. Use the configured Sites build helper; pnpm lockfile is committed.

Photographs retain their credits and original source links. Map data credits remain visible. Source-specific dates, uncertain mint assignments, disputed attributions and unresolved specimen identities must remain distinguishable.

For Zeno records, the raw manifest retains the full uploader object (name, member ID and profile URL), the raw source-rights marker, source fields and detail-page path. The display export carries the uploader name as image credit plus a normalized `rightsStatus`; the Zeno terms page is stored separately as `rightsSourceUrl`, not asserted as an open license. SQLite mirrors those display fields as `image.credit`, `image.rights_status` and `image.rights_source_url`; `license_uri` remains null unless a verified license is actually known.

Collector refreshes are resumable. A failed detail/image refresh preserves the last successful record and image and records the current attempt in `fetchFailures`. Category source count, observed unique IDs, detailed records, downloaded images, scope-review status and Atlas import count remain separate measures.

Current Semirechye acquisition status: category #795 (Turgesh / Runic tamgha) is the next priority, but no #795 import is claimed until Zeno can be reached and pagination coverage is verified against the 254-photo source baseline. A partial crawl is a valid saved research state and must remain labelled partial.

When a network-capable execution environment is available, the next acquisition command is:

```bash
python scripts/collect-zeno.py --category 795 --download
```

Before creating any new #795 family, cross-check the existing Semirechye legacy candidates `sr3` (Kamyshev 21, Vahshutava / yuan reverse) and `sr6` (Kamyshev 24, Türgesh kagan / tamgha reverse). A Zeno category membership or photograph alone is not evidence that either record is a distinct academic major type or the same physical specimen.
