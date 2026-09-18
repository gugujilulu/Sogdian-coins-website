# Product roadmap — 2026-09-16

## Product principle

The Atlas is a source-preserving research and exploration product. Source records, original images, source taxonomy and raw descriptions are foundational assets. Research normalization and product filtering are additive layers; related / held / excluded states never delete the source layer. Duplicate records are tolerated. Large-scale visual specimen deduplication is not a current task.

## Node 1 — existing material connected

Current source-preserving baseline:

- 56 Atlas families.
- 120 source / catalogue groups.
- 1,010 main-corpus specimen records.
- 1,013 main-corpus images.
- 701 reviewed related / held / excluded Zeno records exposed separately from the main count.
- Zeno source record ID and breadcrumb classification path are exported for public source browsing.
- Original Atlas family/group assignments remain separate from source taxonomy.
- Raw Zeno HTML and acquisition manifests remain in `research/zeno/` and are not replaced by the display export.

Node 1 does not require global specimen deduplication, complete academic attribution, complete dates, or coordinates for every record.

## Node 2 — phase-one Atlas product

The phase-one product is organized around three primary views:

### Atlas

- Full-viewport MapLibre terrain map.
- Compact floating search/filter control.
- Filters for current structured dimensions: historical region, city/display anchor, family, source, issue date and existing inscription/tamgha/feature tags.
- Small clustered coin-location points rather than hundreds of large coin images.
- Selection opens a right-side detail drawer; on mobile the same panel becomes a bottom sheet.
- Family gallery, catalogue-group filtering, source links, image enlargement and up to three-record comparison.
- Existing find/hoard and area layers remain separate from display anchors.
- Missing political polygons or find coordinates do not remove records from search/catalogue.

### Catalogue

Two parallel entries use the same data:

1. **Atlas 纲目** — region → family → source/catalogue group → specimen record.
2. **来源目录** — source → preserved source classification path → record → Atlas destination.

Related / held / excluded records have a visible source-material entry and remain outside main-corpus counts.

### Research

- Corpus counts and source-coverage snapshots.
- Explicit explanation of source, research and product layers.
- Current spatial-evidence limitations.
- Research roadmap and phase-two requirements.

## Node 3 — rolling research topics

Each batch should produce a visible increment rather than waiting for all Central Asian numismatics to be resolved. Priority research sources include IICAS 2024, Smirnova, Kamyshev, Baratova, Thierry, Zeimal, Naymark, specialist Uyghur/Qara Khitai/Xinjiang studies, archaeological reports, museum catalogues and original auction catalogues.

Academic crosswalks are many-to-many and must distinguish exact, broader, narrower, related and unresolved mappings. Existing source labels and legacy names remain searchable.

## Node 4 — phase two

### Learning

Reuse the phase-one inscription/tamgha/image relationships for:

- script-system recognition;
- Sogdian, Bactrian, Old Turkic, Old Uyghur, Chinese, Arabic and other attested languages;
- glyph → transliteration → translation → coin records;
- tamgha comparison and variants;
- source-attributed readings and dispute-aware exercises.

### Market / auction history

When formally activated, preserve auction house, sale, lot, date, estimate, hammer, premium status, currency, sold state, description, provenance and source URLs. Multiple aggregator pages can point to one sale event without deleting the source records. Repeated sales are linked only where evidence supports the relationship.

After the first successful complete market update, run an incremental update every four calendar months in a real schedulable environment. Previous successful data survives partial failures.

## Historical GIS

Political territory, documented circulation, find distribution, inferred range, mint, findspot, hoard and display anchor are separate layers. Political polygons are time-bounded and source-attributed. Missing polygons are displayed as a research gap, never invented for visual completeness.
