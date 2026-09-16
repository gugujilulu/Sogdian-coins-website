# Sogdian Coins Atlas

An interactive spatial–temporal research atlas of Sogdian-related square-holed coinage. Semirechye is the core scope, connected to Sogdiana, Tokharistan and Xinjiang.

## Current edition

A real draggable MapLibre terrain map; historical city/site anchors; family → catalogue grouping → specimen galleries; date and region filtering; original-resolution images; source and bibliography links; exploration vault; explicit source-coverage accounting.

The Lady Nana collection remains independently scoped at all 14 Zeno category 3106 records plus other-source records: 20 specimen records and 22 images after confirmed repeat-source merges. Zeno category #795 (Turgesh / Runic tamgha) has now been recursively captured at 254/254 source records across 27 category nodes, with 254 detail pages and 254 source images retained. All 254 records received a first-pass scope review; 239 source records are linked into the Atlas, producing 238 net new specimen rows because Zeno #20696 is the same physical specimen/source photograph as the existing `sr9` Coins of Central Asia record. The whole export now has 15 editorial families, 37 source reference groups, 270 specimen records and 273 images. These are import totals, not a census of unique physical coins or all Sogdian major types.

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

Current Semirechye acquisition status: category #795 (Turgesh / Runic tamgha) is complete at the source-capture level for the saved 2026-09-16 snapshot. The root has 5 direct records; its four direct branches declare 169, 23, 1 and 56 records, while recursive traversal resolves 254 unique records across 27 nodes with no repeated pagination pages or fetch failures. `research/zeno/manifest-795.json` preserves the acquisition evidence and `research/zeno/review-795.json` preserves the first-pass scope/crosswalk decisions.

Of those 254 records, 239 are linked into the Atlas. The 15 held/excluded records are: four non-coin objects, one hoard/context image, one closed-aperture scope case, three related non-square-aperture records, five multi-specimen source images awaiting specimen-level splitting, and one Kai Yuan-style Arslanid imitation awaiting the later Chinese-imitation crosswalk. Source-category groupings remain source groupings rather than automatically becoming academic variants. Existing families were reused where evidence supported it (`sr3`, `sr6`, `sr9`, `sr20`), with two new editorial families added for Alp Tagh and Arslan Kul Irkin.

Physical identity remains conservative. Zeno #20696 is merged into existing specimen `sr9` because it is the same physical coin and the same Coins of Central Asia source photograph at another resolution. Similar-looking records are otherwise kept separate unless the source or image evidence establishes identity; for example Zeno #1766 and #1767 share an obverse photograph but have different reverse photographs and are explicitly not merged.
