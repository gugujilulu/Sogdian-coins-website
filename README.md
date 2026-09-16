# Sogdian Coins Atlas

An interactive spatial–temporal research atlas of Sogdian-related square-holed coinage. Semirechye is the core scope, connected to Sogdiana, Tokharistan and Xinjiang.

## Current edition

A real draggable MapLibre terrain map; historical city/site anchors; family → catalogue grouping → specimen galleries; date and region filtering; original-resolution images; source and bibliography links; exploration vault; explicit source-coverage accounting.

The Lady Nana collection includes all14 Zeno category3106 records in the2026-09-16 snapshot plus other-source records:20 specimen records and22 images after confirmed repeat-source merges. The whole export currently has32 specimen records and34 images. Neither count is a complete corpus census. Semirechye's569 source photo records have a saved category baseline, with import and scope review outstanding.

Circulation polygons and hoard points have supported model/layers but no verified type-specific data yet. Do not claim the distribution map is complete. Detailed results and limitations: `docs/implementation-2026-09-16.md`.

## Data and reproducibility

- `public/data/atlas.json`: normalized display export.
- `research/`: image provenance, primary-page metadata, category snapshots and coverage baselines.
- `db/schema.sql`: relational model, hierarchy, attributions, specimen identity, geography, manufacture links and evidence.
- `scripts/build-atlas.py`: source-register → display export.
- `scripts/export-atlas-db.py OUTPUT`: reproducible SQLite research database.
- `scripts/validate-atlas.py`: coverage and evidence/identity invariants.
- `scripts/collect-zeno.py --category ID --download`: public, cached source retrieval; observed-link totals alone are not completeness claims.

Python data scripts require Pillow. Website uses TypeScript, React/Vinext, MapLibre GL and the existing Shadcn primitives. Use the configured Sites build helper; pnpm lockfile is committed.

Photographs retain their credits and original source links. Map data credits remain visible. Source-specific dates, uncertain mint assignments, disputed attributions and unresolved specimen identities must remain distinguishable.
