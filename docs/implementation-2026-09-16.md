# Atlas rebuild — 2026-09-16

## Delivered source and data

- MapLibre geographic raster map, drag / wheel / touch navigation; no directional controls. Physical colour terrain at overview scales, higher resolution shaded relief when approaching sites; optional detailed modern topography. Historical-site point layer and local collision-managed labels. No remote font dependency.
- 14 historic city/site orientation records, with source, precision and editorial role. UNESCO coordinates are explicitly distinguished from approximate editorial anchors.
- Explicit family → source reference group → specimen hierarchy, with independent photographs, measurements, source records, and feature filtering. Source “ff.” reference groups are not presented as established one-to-one variants.
- Lady Nana category3106: all 14 publicly observed Zeno photo records and full-size source images imported. Actual file sizes and hashes recorded. At this snapshot the category reports14; the union of its recent block and gallery lists all14 and individual pages confirm the category. Pagination returned the same first-page contents, so that mechanism is not considered reliable for a larger census. The collector's generic `recordCount` means observed links, not completeness.
- Seven other-source Nana specimen records reviewed. Bactrianumis5898 is merged into Zeno264408 on explicit “this coin” identification. Numista197126 is attached to SARC28/145. Two CNG photos stay under one specimen. Result:20 Nana specimen records,22 images. Cross-platform physical identity is not exhaustively established; do not advertise20 proven unique specimens.
- Whole current display export after the reviewed #795 import: **15 editorial type families, 37 source reference groups, 270 specimen records and 273 photographs**. These are import totals, not a census of all Sogdian major types or unique physical coins. Lady Nana remains independently scoped at 20 specimen records / 22 images, including all 14 Zeno category 3106 records.
- Zeno Semirechye parent category reports 569 photo records: 558 in subcategories plus 11 direct. Category #795 has now been recursively captured and reviewed; the remaining parent-category branches retain their saved baselines until separately acquired/reviewed. Parent and child counts are never summed as independent specimens.

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

At this intermediate handoff stage, the execution container could not resolve `www.zeno.ru` (`Temporary failure in name resolution`), so no #795 acquisition was claimed in that revision. The collector changes remained independent of the website UI and did not alter the existing Lady Nana source files or images. The later Mac-local acquisition described below supersedes that temporary acquisition status.

## Bounded environment check and continuation after `ac08d9b`

The continuation workspace explicitly declares `NETWORK=caas_packages_only` and no HTTP/HTTPS proxy. A single current resolver check returned `gaierror(-3, 'Temporary failure in name resolution')` for both `www.zeno.ru` and `registry.npmjs.org`. The platform web reader could display an older crawled/text rendering of the already-known Zeno Semirechye parent URL, but that path does not expose raw response bytes and therefore is not accepted as a source-capture mechanism. A permitted file-download attempt did not produce a raw Zeno HTML file. No DNS settings were changed and no repeated network retry loop was used.

Accordingly, that intermediate revision made **no #795 source-record or image claim** and had no `manifest-795.json` or cached `category-795*.html`. The network-capable continuation command used the same collector interface:

```bash
python scripts/collect-zeno.py --category 795 --download
```

The collector now preserves a previous successful detail record and image if a later refresh fails, while recording the current failure separately in `fetchFailures`. Image refreshes use a temporary file and replace the previous image only after the replacement validates as an image. This permits partial and interrupted #795 acquisition without destroying previous success.

Image provenance is now carried consistently through the display and relational exports. The raw Zeno manifest remains the authoritative store for the full uploader object, raw labelled fields, breadcrumb/category membership, rights note and source terms URL. The Atlas image record carries the uploader name as `credit`, normalized `rightsStatus='unverified'`, and `rightsSourceUrl`; it does not treat the source-terms URL as a verified license. SQLite stores the same separation in `image.credit`, `image.rights_status`, `image.rights_source_url`, with `license_uri` left null unless a verified license is later established.

At the pre-#795 checkpoint, Lady Nana display coverage remained 14/14 imported Zeno records and **22 images across all Lady Nana sources**, while the whole-site image count was **34**. The later #795 import keeps the Nana scope unchanged while increasing the independently derived whole-site total, as recorded below.

The existing Semirechye records `sr3` (Kamyshev 21; Vahshutava / yuan reverse) and `sr6` (Kamyshev 24; Türgesh kagan / tamgha reverse) were explicit pre-ingest crosswalk candidates for category #795. The later reviewed import tested those existing families before creating new family rows; the resolved crosswalk is recorded below.

No formal Git remote is recorded in `.git/config`, README or the implementation notes. The local hosting configuration retains the existing Site project binding; no new Site is created and no deployment is attempted in this blocked environment.


## Zeno #795 recursive acquisition and reviewed import

The Mac-local continuation run completed the saved Zeno category #795 snapshot without collector failures. The root category has **5 direct records**; its four direct branches report **169, 23, 1 and 56** records. Recursive traversal visited **27 category nodes** and resolved **254 unique source IDs**, matching the saved subtree/source baseline. All **254 detail pages and 254 source images** are retained locally. Pagination integrity reports `no_repeat_detected`; fetch failures and category failures are both zero. Raw HTML remains part of the source handoff archive even where ignored by Git.

`research/zeno/review-795.json` records a complete first-pass scope review of the 254 source records. **239 source records are linked into the Atlas**. The remaining 15 are deliberately held or excluded: 4 non-coin objects (`223681`, `256514`, `256515`, `137536`); 1 hoard/context image (`326444`); 1 closed-aperture scope case (`327084`); 3 related non-square-aperture records (`110499`, `223133`, `219315`); 5 source images containing multiple physical coins and awaiting specimen-level splitting (`89783`, `131295`, `307661`, `308343`, `371668`); and 1 square-hole Kai Yuan-style Arslanid imitation (`126089`) held for the later Chinese-cash-imitation crosswalk. Scope-review status is therefore complete even though not every source record becomes a specimen row.

The #795 crosswalk reuses existing editorial families where the source structure and existing catalogue records support continuity: `sr3` for the Vahshutava series, `sr6` for the broader Türgesh qaghan/tamgha series, `sr9` for the Arslan Irkin / legacy Inal-Tegin attribution complex, and `sr20` for Arslan Bilge Qaghan. Two editorial families were added for the explicit Alp Tagh and Arslan Kul Irkin branches. Nineteen reviewed Zeno leaf-category groupings are stored as **source reference groups**; their Zeno hierarchy is not promoted automatically to definitive academic variants, and individual Kamyshev/Smirnova references are not generalized beyond the records that support them.

One strong cross-platform identity was established: Zeno **#20696** is the same physical specimen and the same Coins of Central Asia source photograph as the existing `sr9` record, at another resolution. It is merged into `sr9` while retaining the Zeno source/image, so 239 imported #795 source records produce **238 net new specimen rows**. No other same-specimen merge is asserted from visual similarity alone. Zeno #1766 and #1767, for example, reuse the same obverse photograph but show different reverse photographs and remain separate source/specimen records.

After the import, `python scripts/build-atlas.py` exports **15 families / 37 source reference groups / 270 specimen records / 273 images**. `python scripts/validate-atlas.py` passes the Lady Nana 14/14 + 22-image invariants and the #795 254/254 acquisition, 254-review, 239-link and `sr9` identity invariants. A fresh SQLite export contains 270 specimen rows, 273 image rows, 15 family rows and 37 source-reference-group rows; the #795 coverage snapshot stores 239 records as `image_imported` and 15 as `pending`, with a clean `foreign_key_check`. Lady Nana coverage remains independent and unchanged.

The current execution shell has Node v22.16.0 but no `pnpm` executable and no restored `node_modules`. One offline dependency-recovery attempt therefore stopped immediately at `pnpm: command not found`. Python build/validation and SQLite export pass; TypeScript and production build have **not** been re-run in this environment and are not treated as substituted by the Python checks. The existing private Site binding `appgprj_6aaa004e58c481918488e7ebec45333a` is unchanged and no deployment is performed before the frontend build can be validated. No formal Git remote is recorded, so no remote is created or pushed automatically.


## Scope v1 expansion: Central Asian Square-Hole Coinage Atlas

The research scope was expanded after the #795 import from a Semirechye/Sogdian-focused atlas to the **Central Asian Square-Hole Coinage Atlas**. The main working interval is 221–1643 CE. `research/central-asia-square-hole-scope.json` is the machine-readable scope authority for temporal boundaries, geographic zones, political/coinage systems, source categories, inclusion/exclusion rules, review queue and current coverage.

The operative inclusion concept is the **Chinese-style square-hole cash tradition**. A physically pierced central square hole is common but not mandatory: intentionally unpierced or pseudo-aperture issues that clearly derive from the same cash tradition remain main-corpus candidates. This explicitly includes Gurek imitation issues with a cast/represented square aperture. Post-cast drilled, suspension or decorative holes remain excluded as qualifying evidence.

Source provenance is now specified in `research/source-provenance-policy.json`. The model rejects a single scalar source-quality score: reliability is evaluated per claim (attribution/date, find context, measurements, specimen/image identity, provenance, rights). Evidence lineage is explicit so that a Zeno, Numista or auction claim that derives from the same print catalogue is not treated as independent corroboration. `research/source-authorities.json` registers the first normalized academic/reference/database/museum/auction source set.

`research/current-corpus-scope-map.json` maps the existing 15 families and all 270 current specimen rows into Scope v1 while preserving unresolved families such as `sr21` as competing-attribution complexes. `research/candidate-type-inventory.json` seeds a cross-regional candidate inventory from checked sources. It includes current and candidate Sogdian local cash, Chach/Ferghana Turko-Sogdian issues, Semirechye/Türgesh/Qarluq groups, Eastern and Western Uyghur cash, Kucha local cash, Western Liao candidates, Northern Tokharistan exploration targets and regional imported East Asian cash. Candidate rows are source claims, not automatically canonical type records.

Frontend work remains frozen during this stage. No Site deployment accompanies the scope/provenance expansion.

## Scope-v1 acquisition queue and generic recursive collector

The source workflow now has an explicit acquisition queue in `research/acquisition-queue.json` and a Zeno root plan in `research/zeno/root-503-plan.json`. The next Zeno discovery target is root category **#503 Central Asia**. The collector has been generalized from the successful #795 recursive run: it follows only the explicit `Subcategories` table, visits each category once, paginates each category independently, stores direct membership separately from subtree membership, writes gallery/detail files via temporary files before replacement, and preserves prior successful cache files when a refresh fails.

Collector modes are now separated: default = recursive gallery/category census; `--details` = census plus cached detail HTML/parsed source fields without image download; `--download` = detail collection plus original-image acquisition. Detail records preserve `originalImageUrl` and image candidates even in metadata-only mode. This supports a scientifically safer two-pass #503 workflow: first acquire the complete category/detail evidence needed for scope review, then request original images only for included/candidate/review-needed records. Existing #795 raw pages and images remain authoritative and are not invalidated or redownloaded by this plan.

Offline regression now checks both the historical Lady Nana pagination failure and the completed #795 recursive tree. For Lady Nana, the cached `page=2` response duplicates page 1; the generic collector therefore correctly reports 12 directly observed gallery IDs against a source-declared 14 and marks the cached pagination as incomplete instead of using the `Recent Posts` block to manufacture completeness. The existing independently verified Nana manifest remains the source of the established 14/14 corpus. For #795, cached traversal returns 254 unique IDs across 27 nodes, root direct count 5, subtree source count 254 and no repeated pagination.

Source authority coverage was expanded with Smirnova 1981, Kamyshev 2002, Zeimal 1994, dedicated Western Liao papers (2012 Xuxing, 2022 Tianxi, 2024 Zhouyuan and the 2024 survey), Babayarov's Isfijab/Sayram lead, and the peer-reviewed 2026 Taraz archaeological publication. Candidate inventory v0.2 now seeds Paykand square-hole cash, Isfijab/Sayram Tutuk-Khagan cash and Keder cash as source-backed candidates while keeping disputed localization and upstream evidence lineage explicit.


## Zeno #503 Central Asia metadata census and selective-image plan

The Mac-local metadata discovery run for Zeno root category `#503` completed with collector exit status 0. The saved snapshot visits **393 category nodes**, observes **3,891 unique source IDs**, and confirms that forced branches `#2141` Semirechye and `#795` Turgesh are present in the discovered tree. The original run parsed 3,884 detail records and logged seven parser failures caused by range/punctuation measurement strings such as `24.4...25.0`; the raw detail HTML for all seven was already cached. `parse_measurement()` was narrowed to normalize only the first parseable numeric token while preserving the original `sizeText`, allowing all seven cached records to be reparsed offline. The working manifest therefore now contains **3,891 parsed detail records and zero outstanding detail parse failures**.

The #503 source census is **not** claimed complete. Zeno returned repeated pagination content in 24 categories. Across those affected categories the source-declared direct totals exceed the saved direct IDs by 459 records. Many gaps are in non-target series, but seven categories intersect the current square-hole/cash-tradition candidate or visual-review scope: Urk Wartramuka (`2740`), Chach Type 8/Tarnavch (`24941`), Farankat/Benakan (`911`), Kanka (`914`), Chach Unknown principality I (`2144`), Semirechye anepigraphic imitations (`15758`), and the Yelü Dashi / `malik ārām yīnāl qaraj` cash group (`796`). Lady Nana `3106` is excluded from this recovery queue because its independent validated manifest already preserves the complete 14/14 snapshot. `research/zeno/coverage-gaps-503.json` records the recovery list.

The first pre-image scope review is recorded in `research/zeno/review-503-preimage.json`. It is intentionally category-first and conservative: source/category evidence can identify strong square-hole/cash-tradition candidates, while ambiguous Chach, Otrar, Ferghana, Sayram, Ustrushana, Tokharistan and extended-zone bronzes remain in a visual-review bucket rather than being promoted automatically. Existing #795 review decisions are reused. The current selective image plan contains **811 high-priority records** and **535 visual-review records** after skipping Zeno images already held in the repository. These counts are acquisition targets only; they are not unique-specimen totals, editorial-family totals, or final inclusion decisions.

`scripts/fetch-zeno-503-targets.py` implements the bounded next pass. It retries only the seven scope-relevant incomplete galleries using Zeno's public `perpage=90` mode, caches newly recovered detail pages, then downloads original images only for the pre-image high/visual target lists plus any recovered target IDs. Existing successful HTML and images are reused and failures remain explicit. The Mac wrapper packages high-priority and visual-review image results separately so the larger corpus can be handed back without requiring a full #503 image dump.

## 2026-09-16 · Central Asia #503 stage-1 import

The metadata-first #503 census originally observed 3,891 unique Zeno records across 393 category nodes. Seven scope-relevant repeated-pagination categories were re-fetched with `perpage=90`, adding 93 non-overlapping records. The working #503 metadata corpus is therefore 3,984 observed/recovered records; this remains a partial source census because repeated-page gaps outside the targeted recovery are still unresolved.

Selective image acquisition downloaded 1,439 target records. A visual quality audit discovered that 776 detail pages contained decorative `/data/glyph/` assets before the actual specimen photograph; the original collector had accepted the first such asset. The collector now blocks glyph/avatar/smiley assets. A repair pass recovered 774 genuine specimen images; Zeno 302497 and 304297 remain unresolved image failures. The display layer normalizes Zeno's raw `source_terms_apply_unverified` marker to `rightsStatus=unverified` while retaining `https://www.zeno.ru/rules.php` separately as the rights-source URL.

`research/zeno/review-503-stage1.json` is deliberately conservative. It selects 586 source records, imports 584, and holds two records without usable target images. The import adds source-linked families/groups for Eastern/Western/Southern Sogd, Panch, Chach, Ferghana, Sayram/Keder, Qarluq, Yaghlaqar, Western Liao candidates and Northern Tokharistan while preserving unsettled catalogue equivalences. Mixed categories (including round-hole/openwork Chinese imitations and portrait/tamgha series) remain outside stage-1 pending record-level review. Zeno #796 contributes 58 square-hole cash records to the existing disputed `sr21` family; its Yelü Dashi / Western Liao label is retained as a source attribution, not a canonical resolution of the legacy proto-Qarakhanid / Karluk / Western Liao dispute.

After this stage the display export is **41 editorial families, 82 source reference groups, 854 specimen records and 857 images**. Lady Nana remains independently scoped at 20 specimen records / 22 images and Zeno #795 remains 254/254 source-captured with 239 Atlas-linked records. The #503 relational coverage snapshot unions the 3,891 root-manifest IDs with the 93 recovered IDs without treating either source record IDs or overlapping category membership as independent physical specimens.


## 2026-09-16 · Central Asia #503 stage-2 record-level visual review

Stage 2 reviews 91 previously downloaded target records individually. Eighty records enter the main Atlas after source-taxonomy plus image confirmation; eleven records with clearly circular or special rosette/open apertures remain related/held and do not count as main-corpus square-hole-tradition coins. Pseudo-aperture and intentionally unpierced square-frame forms remain includable under Scope v1.

The stage reuses existing editorial families for Zeno #14905 (10 Inal-Tegin source records → `sr9`) and #15156 (10 Ferghana anonymous khaqan records → `ferghana-anon-khagan`), and adds three browsing families: `yarug-kadin`, `general-ir-chor-irti`, and `semirechye-chinese-imitation`. The Chinese-imitation family is an editorial umbrella only: Kaiyuan, Qianyuan, Dali, Huichang, Xining, Dading, Zhenglong and undeciphered source groups remain separate source groups, and local imitation/local recast/imported-coin roles remain open for later claim-level adjudication.

After stage 2 the display export is **44 editorial families, 98 source reference groups, 934 specimen records and 937 images**. The #503 relational coverage snapshot contains 3,984 source records, of which 915 currently have an Atlas image link, 9 are linked to an existing specimen without a new image status, and 3,060 remain pending. This coverage state must not be read as 924 unique physical coins.

The deployable `public/coins/zeno` directory receives only reviewed/imported stage-2 images. The remaining 762 downloaded images stay in `research/zeno/pending-images-503/`; eleven visually reviewed related/held images are kept in `research/zeno/reviewed-related-images-503/`. One previously targeted record still lacks a valid repaired image.

## Phase-one product checkpoint after Zeno #503 review

The #503 target-image review is now closed at the downloaded-target level. The main display corpus is **56 families / 120 source-catalogue groups / 1,010 specimen records / 1,013 images**. These are collection records, not a rarity census or an assertion of 1,010 proven unique physical coins.

Source preservation was strengthened before the phase-one UI rebuild:

- every Zeno specimen exported to the product now carries its Zeno source-record ID and preserved breadcrumb category path where present;
- **701 reviewed related / held / excluded Zeno records** are exported as a separate research-material index rather than silently disappearing from the product;
- this related index does not change the 1,010 main-corpus record count and does not delete cached HTML, images, manifests or review decisions;
- large-scale visual specimen deduplication is explicitly out of scope. Multiple source records and photographs are retained; same-specimen relations are additive only when evidence establishes them.

The phase-one UI has been restructured around full-viewport Atlas / Catalogue / Research views. The Atlas uses clustered point markers and a selection drawer; Catalogue provides both an Atlas hierarchy and a source-oriented browser; Research exposes coverage and current evidence limitations. Current structured filters include region, display anchor, family, source, issue date and existing inscription/tamgha/feature tags. Political-entity polygons remain evidence-gated and are not fabricated.

The environment restored from the handoff archive does not include `node_modules`, so production UI build/browser QA remains pending a runtime with the committed package set available. Python build/validation and relational export remain reproducible locally.

## Phase-one continuation checkpoint · explicit provenance and stable browsing

The source-preserving product pass now exports explicit provenance on every main-corpus specimen and image. Each specimen carries `sourceName`, `sourceRecordId`, `sourceRecordUrl`, and its preserved Zeno breadcrumb where applicable. Each image separately carries its own source provider, source-record label/URL, direct original-image URL, credit and rights-status/right-source fields. Cross-platform image provenance is additive: for example, a Zeno-linked specimen can retain a Bactrianumis image as Bactrianumis provenance without replacing the Zeno record, and the Coins of Central Asia `sr9` record retains its separate Zeno #20696 image relation.

The public Catalogue source tree uses the explicit primary source provenance rather than treating comparison links as the record's source. Source groups and individual specimen records now have stable hash links, and source-tree entries link directly back to their original external records. Specimen lightboxes expose the source record, direct original-image link and rights-information link when present.

Map cluster labels now represent the number of Atlas families inside the cluster, rather than the number of geographic point features. This keeps map counts semantically aligned with the UI legend. The Research view shows the current primary-source record distribution with an explicit note that these are source-record counts, not unique physical coins or rarity statistics. A research-status filter has also been added to the Atlas alongside region, polity/local system, city/display anchor, family, primary source, date and existing inscription/tamgha/feature filters.

The UI changes were syntax-checked with the installed TypeScript compiler via `transpileModule`. A full Next production build and browser QA still require restoration of the project dependency set; no deployment is claimed from this checkpoint.
