# Atlas rebuild — 2026-09-16

## Delivered source and data

- MapLibre geographic raster map, drag / wheel / touch navigation; no directional controls. Physical colour terrain at overview scales, higher resolution shaded relief when approaching sites; optional detailed modern topography. Historical-site point layer and local collision-managed labels. No remote font dependency.
- 14 historic city/site orientation records, with source, precision and editorial role. UNESCO coordinates are explicitly distinguished from approximate editorial anchors.
- Explicit family → source reference group → specimen hierarchy, with independent photographs, measurements, source records, and feature filtering. Source “ff.” reference groups are not presented as established one-to-one variants.
- Lady Nana category3106: all 14 publicly observed Zeno photo records and full-size source images imported. Actual file sizes and hashes recorded. At this snapshot the category reports14; the union of its recent block and gallery lists all14 and individual pages confirm the category. Pagination returned the same first-page contents, so that mechanism is not considered reliable for a larger census. The collector's generic `recordCount` means observed links, not completeness.
- Seven other-source Nana specimen records reviewed. Bactrianumis5898 is merged into Zeno264408 on explicit “this coin” identification. Numista197126 is attached to SARC28/145. Two CNG photos stay under one specimen. Result:20 Nana specimen records,22 images. Cross-platform physical identity is not exhaustively established; do not advertise20 proven unique specimens.
- Whole current display export:13 editorial type families,18 source reference groups,32 specimen records,34 photographs. These are import totals, not a census of all Sogdian major types.
- Zeno Semirechye parent category reports569 photo records:558 in subcategories plus11 direct. The breakdown is in `research/coverage-scopes.json`. Counts are not yet reviewed for scope, objects, duplicates or photographs of non-coins. Parent and child counts overlap and must not be summed twice.

## Geography evidence still missing

No type-specific archaeological hoard inventory or sourced circulation polygon has yet been imported. The map has separately styled, date-aware polygon and find/hoard layers, but the production evidence arrays intentionally remain empty until source geometry is available. This means the requested clickable circulation-area experience is **not yet complete**.

Zeno264184 reports a find in northern Afghanistan. It supplies no site or excavation context. The report is retained in the specimen description; it is not converted into a Balkh point or a circulation polygon. Panjakent's general coin excavation totals likewise do not prove Lady Nana findspots.

Promising next archaeological source: Smailov & Kazmadiyarova2025, *Coins of the Turkic Khaganates from Taraz settlement (Southern Kazakhstan)*, DOI10.53737/2713-2021.2025.72.81.005. Metadata located; full paper and type-level find inventory not yet extracted. IICAS2024 detailed catalogue crosswalk is also pending.

## Data quality decisions

- Zeno334987 says Size1.8mm in its measurement field. Raw value remains in the source manifest; exported diameter is null pending clarification. No silent conversion to18mm.
- CNG611/576 cites Zeno81165 as a comparator; these are not merged.
- Zeno57887 is described as similar to Smirnova834–836. Its reference is retained while its variant assignment stays null.
- Nana dating differs across sources: broad7th–8th century,709–722,709–728. The broad family interval is explicit; no claim of continuous circulation throughout that interval.
- Manufacture relationships distinguish struck dies, casting moulds and mother models. No relationships invented.
- Raw cached source HTML is ignored by Git; structured citations and factual extracts are retained. Collector follows ordinary public PHP-session forwarding and does not log in or bypass restrictions.

## Verification

TypeScript and production build; actual photograph dimensions and visual contact sheet;14/14 local image check; relational foreign keys; bad date / weight / hierarchy values rejected; comparator versus same-specimen relation tested. Browser interaction/visual QA has not been run in this pass, so screenshot-level parity with the supplied reference is not claimed.

## Rebuild

1. `python scripts/build-atlas.py`
2. `python scripts/validate-atlas.py`
3. `python scripts/export-atlas-db.py /new/path/atlas.sqlite`
4. Build with the configured Sites helper.

The exported JSON drives the site; SQLite is a reproducible relational research export, not a hosted write database. SQL includes citations, classification claims, spatial uncertainty, distribution evidence, separate discovery/deposition dates and coverage tracking.

## Continuation after cross-window source handoff

The source archive was restored in a clean workspace from Git HEAD `318c4622eb7fc5c5fb0d349aff0e490a5a14ebf8` (`Build terrain atlas and source-traceable Lady Nana corpus`). The archive contained `.git`, 25 research files, 14 `public/coins/zeno` images and 8 `public/coins/nana` images; the restored working tree was clean before continuation work.

The Zeno collector has now been hardened before the Semirechye expansion:

- category source counts, scope-baseline counts and observed link counts are recorded separately;
- pagination pages are fingerprinted by their photo-ID sets, and a repeated first page is explicitly marked as a pagination-integrity failure rather than counted as new coverage;
- legacy cached pagination filenames remain readable, so the Lady Nana snapshot can be audited offline;
- detail records retain their raw HTML path, breadcrumb, leaf Zeno category, requested-category membership, measurements and an explicit-text-only square-hole scope flag;
- cached Lady Nana detail pages were re-parsed offline: all 14 now retain uploader attribution, raw labelled source fields, upload/date/mint/metal text when present, free-text photo notes, image hashes and a source-terms rights marker; image bytes, dimensions and hashes are unchanged;
- running the collector without `--download` preserves existing detailed manifest records instead of erasing them;
- saved Zeno manifests are exported as independent relational coverage snapshots, so later Semirechye batches cannot inflate the Lady Nana 14/14 statistic.

The Lady Nana coverage field `images` was corrected to its actual scoped value of **22**. The whole display export remains **34** images. Validation now asserts both figures independently and scopes Zeno-ID equality to the Lady Nana family, allowing new Zeno categories to be added safely.

Offline regression checks pass for the cached Lady Nana category, including detection that Zeno category 3106's `page=2` response duplicates the first-page photo-ID set while the observed 14 records still match the source-reported category total.

Current execution environments cannot resolve `www.zeno.ru` (`Temporary failure in name resolution`). No #795 data is therefore claimed as collected. Category 795 remains at its saved source baseline of 254 photo records with `scopeChecked=false` and `importedImages=0` until a network-capable retrieval succeeds. The collector changes are intentionally independent of the website UI and do not alter the existing Lady Nana source files or images.
