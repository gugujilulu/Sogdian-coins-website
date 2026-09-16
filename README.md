# Sogdian Coins Atlas

An evolving visual research atlas of square-holed coinage, centred on Semirechye and extending into Sogdiana, Tokharistan, Afghanistan and Xinjiang. Inspired by conversations with members of the Vancouver coin club.

## Current research edition

- Regional map with specimen thumbnails, zoom/pan and keyboard selection.
- Timeline filters for overlapping attributed date ranges, with playback.
- Specimen details, enlargement at available resolution, sources and research links.
- Exploration vault for unknown regions and disputed chronology.
- 12 photographic records: 9 with regional anchors and 5 exploration entries (2 appear in both views). All academic type assignments remain candidates.

This is a working research prototype, not the completed comprehensive census. Afghanistan is not yet represented by a securely attributed specimen. Xinjiang has one comparative Kucha record. Only two records currently have explicit Zeno cross-references; direct Zeno pages were inaccessible during collection. Most photographs are small catalogue images, not high-resolution photography. Record-level paper matching remains incomplete; foundational catalogue links are labelled accordingly.

## Research model

`public/data/coins.json` contains display records. `research/source-register.json` records specimen sources, original image URLs, attribution and image verification. Coordinates are approximate regional display anchors; no mint or findspot is inferred from them. Numeric bounds for century descriptions are UI approximations, not exact mint dates. The timeline depicts date-range overlap rather than proven circulation.

A comprehensive next dataset should separate `types`, `specimens`, `attribution_claims`, `locations` and `references`. Each new specimen needs a stable source ID and observation date. Deduplicate relisted specimens separately from type classification. Maintain competing readings and attribution histories; first online appearance is not an archaeological discovery date.

## Coverage work still required

1. Establish the square-hole type census against IICAS 2024, recording catalogue/page IDs.
2. Review Zeno categories, new submissions and comments against that census.
3. Cross-reference primary articles and published excavation material in Russian, English and Chinese.
4. Review auction/dealer records for additional specimens, retaining seller claims separately.
5. Resolve image permissions and replace thumbnails with appropriately licensed high-resolution images.
6. Expand Afghanistan, northern Tokharistan and Xinjiang without conflating geography or forcing uncertain types onto the map.
7. Add an explicit coverage report and dated update log.

Auction scraping and price comparisons are a later phase.

## Development

This project uses React, TypeScript and the Sites Vinext starter with pnpm. Install using the lockfile, then run `pnpm dev` or `pnpm build`. The current deployment runs on Cloudflare Workers through Sites. A future GitHub Pages export needs a static-output configuration; do not assume the current server build is Pages-ready.

## Sources and images

The map uses Natural Earth public-domain boundary data. Modern boundaries provide orientation only.

Specimen photographs are credited individually. They are third-party copyrighted materials with no open redistribution license verified in this research pass. No blanket open-source image license is granted by this repository. The rights/source register must accompany any public reuse review.

Core bibliography: https://iicas.int/book/177 (2024, 496 pages); https://www.charm.ru/kamyshev.shtml; https://www.iranicaonline.org/articles/turko-sogdian-coinage/.

## Validation

Production build and local record/asset integrity checks. Browser interaction and WebMCP runtime validation were not run in this environment. A tool, where supported, exposes the same timeline state as the UI.

## Relational foundation

See `docs/research-architecture.md`, `db/schema.sql` and `scripts/import-research.py`. The 12 source observations can be imported into a local SQLite database with independent type, specimen, image, citation, geography and dating records. Run the importer with a new output path. This model is not yet connected to the UI or a hosted database.
