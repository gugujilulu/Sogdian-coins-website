# Research architecture / 2026-09-16

## Scope decisions

Keep the user's chosen core: square-holed coinage of Semirechye plus neighbouring Sogdian-related regions, northern Tokharistan, Afghanistan and Xinjiang. Chach and Samarkand are comparative corpora rather than replacements for the chosen MVP. Preserve the exploration vault. The existing UI is an interaction draft; its legacy-source candidate records are not a completed academic type census.

## What the external references establish

OCRE's institutional account explains a type corpus linked to physical specimens and geographic evidence. This supports independent type/specimen identities and separately sourced find contexts. https://isaw.nyu.edu/publications/research-reference/ocre

The HRC launch account, written by its principal developer, describes cross-corpus search while keeping component catalogues. This supports a `corpus_id` and stable local type IDs, not separate applications for every region. This historical account does not verify the complete 2026 corpus list. https://numishare.blogspot.com/2019/06/ans-releases-hellenistic-royal-coinages.html

Nomisma maintains canonical identifiers and an ontology in its official repository. The DAI project description identifies its linked-data and controlled-vocabulary role. https://github.com/nomisma/data ; https://www.dainst.org/en/research/projects/nomismaorg-a-linked-data-approach-to-numismatics/2098

The live OCRE Maps, HRC and Nomisma ontology pages could not be retrieved in this session. No claim is made that their current UI was inspected. The user-supplied facet list remains a reference proposal until live verification.

## Adopt in phase one

- Stable local IDs for types, specimens, places, authorities and references.
- Nullable verified Nomisma/Pleiades URIs. Preserve local concepts when no reviewed match exists.
- Separate specimen measurements from any later type-level aggregate. Do not turn a single specimen's weight into a standard weight.
- Many-to-many publications with page, plate and catalogue-number locators.
- Multiple inscription readings with language, script, transliteration, translation, researcher and citation.
- Typed geographic claims: attributed region, mint, place of issue; actual find contexts belong to specimens.
- Explicit date semantics. Reign dates, minting ranges and coarse century normalization must be distinguishable.
- Multiple source-backed authority and symbol claims. The same-looking tamgha does not automatically establish one issuer.

## Defer

A triple store, SPARQL server, full ontology conformance, automated attribution, automatic new-type declarations, coin-price estimation and multi-user editorial infrastructure. Retain export-friendly identities; choose relational storage first. The draft schema is SQLite-compatible, independent of the deployment backend. No hosted database is provisioned by this design.

## Uncertainty in the product

Geographic precision and confidence are independent. A securely attributed region may still have no known mint. A region gets an area or explicitly labelled regional anchor; a known archaeological site gets a point. Alternative location claims remain individually inspectable, rather than averaged into a fictional coordinate.

Dates use original display text plus normalized bounds and a normalization note. A year match means a range overlaps that year, not that the type is proven to circulate then. Rival chronologies stay as separate claims, with one optional editorial preference. Undated types remain searchable in the vault.

Exploration is a view over unresolved claims, not a disposable holding table. A type can appear on the regional map and in the vault when its region is known but its reading or date is disputed. Promotion to a preferred attribution leaves the earlier claim and source intact.

## First coherent research corpus

Target 20–50 *reviewed types*, subject to actual taxonomy, centred on Semirechye. Count specimens separately. Start with the Türgesh, Tukhus and related series, then add only source-linked comparative square-hole types. Exclude round-aperture pieces even when a reverse device looks square. Keep tangential Chinese local issues explicitly tagged as comparison material.

Use IICAS 2024 as a classification backbone after checking the relevant entries, not solely the publisher's summary. Crosswalk older Kamyshev / Smirnova references with the new catalogue; record mismatches as research tasks. IICAS metadata has been verified; the complete book has not yet been read or extracted. https://iicas.int/book/177

## Ingestion sequence

1. Inventory source categories and bibliography, with access date and retrieval outcome.
2. Record type definitions and catalogue locators from the reviewed literature.
3. Ingest specimen observations with source IDs; retain uncertainty in measurements and identity.
4. Link specimen → candidate type as a cited claim; allow competing claims.
5. Add region/date/authority/legend/symbol claims with page or source locators.
6. Add external records with checked/reported status; a reference to a comparable Zeno coin is not proof of identical specimen identity.
7. Record image credit, dimensions and rights status; do not substitute an enlarged thumbnail for a high-resolution original.
8. Export the public catalogue plus a coverage ledger showing reviewed, unreviewed, inaccessible and unresolved sources.

Broad collection and publication are separate stages. Newly observed listings can enter an observation queue immediately; calling them a new type requires a documented typological comparison. Neither an auction listing date nor a seller's claimed region establishes an excavation date or findspot.

## Query examples

Region + date interval: select distinct types linked by attributed-region claims whose preferred date interval intersects the requested interval (`start <= query_end AND end >= query_start`). Return confidence and date semantics with each hit.

Type detail: one type, its alternative claims, face descriptions, inscription readings, symbols, linked specimens and citations. Measurements stay attached to specimens.

Exploration vault: types with unresolved classification, chronology, region or inscription questions; include known regions where applicable. Show cited hypotheses and what evidence would distinguish them.

## Prototype status

The current page consumes a temporary flat display JSON. `db/schema.sql` is the next relational foundation, with a reproducible import of the 12 legacy observations. All imported type rows remain `candidate`; no fabricated IICAS type IDs, mint locations, legend readings or external equivalences are inserted. The migration validates model mechanics, not scholarly attribution.
