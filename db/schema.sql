-- Sogdian Coins Atlas / relational draft v0.1
-- Local research model; deliberately independent of the hosting runtime.
PRAGMA foreign_keys=ON;
CREATE TABLE corpus (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, scope_note TEXT NOT NULL
);
CREATE TABLE publication (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, authors TEXT, year INTEGER,
 publication_kind TEXT NOT NULL, container_title TEXT, doi TEXT, url TEXT,
 accessed_on TEXT, verification_status TEXT NOT NULL DEFAULT 'metadata_only'
 CHECK(verification_status IN ('metadata_only','partly_read','read'))
);
CREATE TABLE citation (
 id TEXT PRIMARY KEY, publication_id TEXT NOT NULL REFERENCES publication(id),
 locator TEXT, note TEXT
);
CREATE TABLE place (
 id TEXT PRIMARY KEY, historical_name TEXT NOT NULL, modern_name TEXT,
 kind TEXT NOT NULL CHECK(kind IN ('region','city','site','valley','unknown')),
 parent_id TEXT REFERENCES place(id), nomisma_uri TEXT, pleiades_uri TEXT,
 CHECK(parent_id IS NULL OR parent_id<>id)
);
-- Geometry is a separately sourced claim, not a compulsory exact point.
CREATE TABLE place_geometry (
 id TEXT PRIMARY KEY, place_id TEXT NOT NULL REFERENCES place(id),
 geometry_geojson TEXT, label_lat REAL, label_lon REAL,
 precision TEXT NOT NULL CHECK(precision IN ('exact_site','approximate_site','region','unknown')),
 confidence TEXT NOT NULL CHECK(confidence IN ('certain','probable','possible','disputed','unassessed')),
 valid_start INTEGER, valid_end INTEGER, citation_id TEXT REFERENCES citation(id),
 note TEXT,
 CHECK((label_lat IS NULL)=(label_lon IS NULL)),
 CHECK(label_lat IS NULL OR label_lat BETWEEN -90 AND 90),
 CHECK(label_lon IS NULL OR label_lon BETWEEN -180 AND 180),
 CHECK(valid_start IS NULL OR valid_end IS NULL OR valid_start<=valid_end)
);
CREATE TABLE authority (
 id TEXT PRIMARY KEY, name TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('person','dynasty','polity','institution','unidentified')),
 nomisma_uri TEXT
);
CREATE TABLE coin_type (
 id TEXT PRIMARY KEY, corpus_id TEXT NOT NULL REFERENCES corpus(id),
 title TEXT NOT NULL, parent_type_id TEXT REFERENCES coin_type(id),
 aperture TEXT NOT NULL CHECK(aperture IN ('square','round','none','uncertain')),
 classification_status TEXT NOT NULL CHECK(classification_status IN ('candidate','catalogue_linked','reviewed')),
 exploration_reason TEXT, created_on TEXT NOT NULL, updated_on TEXT NOT NULL,
 CHECK(parent_type_id IS NULL OR parent_type_id<>id)
);
-- Bibliographic numbering belongs to a particular publication/edition.
CREATE TABLE type_reference (
 id TEXT PRIMARY KEY, type_id TEXT NOT NULL REFERENCES coin_type(id),
 citation_id TEXT NOT NULL REFERENCES citation(id), reference_number TEXT NOT NULL,
 relation TEXT NOT NULL CHECK(relation IN ('equivalent','broader','narrower','comparison','unreviewed')),
 UNIQUE(type_id,citation_id,reference_number)
);
CREATE TABLE specimen (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, collection_name TEXT,
 inventory_number TEXT, material_text TEXT, weight_g REAL CHECK(weight_g>0),
 diameter_mm REAL CHECK(diameter_mm>0), axis_hours INTEGER CHECK(axis_hours BETWEEN 1 AND 12),
 citation_id TEXT NOT NULL REFERENCES citation(id), observed_on TEXT NOT NULL
);
-- One specimen may have competing classifications; a type can have many specimens.
CREATE TABLE specimen_type_claim (
 id TEXT PRIMARY KEY, specimen_id TEXT NOT NULL REFERENCES specimen(id),
 type_id TEXT NOT NULL REFERENCES coin_type(id), citation_id TEXT NOT NULL REFERENCES citation(id),
 confidence TEXT NOT NULL CHECK(confidence IN ('certain','probable','possible','disputed','unassessed')),
 is_preferred INTEGER NOT NULL DEFAULT 0 CHECK(is_preferred IN (0,1)), note TEXT
);
CREATE UNIQUE INDEX idx_specimen_preferred_type ON specimen_type_claim(specimen_id) WHERE is_preferred=1;
CREATE TABLE image (
 id TEXT PRIMARY KEY, specimen_id TEXT NOT NULL REFERENCES specimen(id),
 view TEXT NOT NULL CHECK(view IN ('obverse','reverse','both','detail','unknown')),
 local_path TEXT, source_url TEXT NOT NULL, credit TEXT NOT NULL,
 license_uri TEXT, rights_source_url TEXT,
 rights_status TEXT NOT NULL CHECK(rights_status IN ('open_license','permission','public_domain','unverified')),
 width_px INTEGER, height_px INTEGER, iiif_manifest TEXT, citation_id TEXT NOT NULL REFERENCES citation(id)
);
CREATE TABLE type_place_claim (
 id TEXT PRIMARY KEY, type_id TEXT NOT NULL REFERENCES coin_type(id),
 place_id TEXT NOT NULL REFERENCES place(id),
 role TEXT NOT NULL CHECK(role IN ('attributed_region','mint','place_of_issue')),
 confidence TEXT NOT NULL CHECK(confidence IN ('certain','probable','possible','disputed','unassessed')),
 citation_id TEXT NOT NULL REFERENCES citation(id), note TEXT,
 is_preferred INTEGER NOT NULL DEFAULT 0 CHECK(is_preferred IN (0,1))
);
CREATE TABLE type_authority_claim (
 id TEXT PRIMARY KEY, type_id TEXT NOT NULL REFERENCES coin_type(id),
 authority_id TEXT NOT NULL REFERENCES authority(id),
 role TEXT NOT NULL CHECK(role IN ('issuer','named_authority','overlord','dynasty','polity')),
 citation_id TEXT NOT NULL REFERENCES citation(id),
 confidence TEXT NOT NULL CHECK(confidence IN ('certain','probable','possible','disputed','unassessed')), note TEXT
);
CREATE TABLE dating_claim (
 id TEXT PRIMARY KEY, type_id TEXT NOT NULL REFERENCES coin_type(id),
 start_year INTEGER, end_year INTEGER, display_text TEXT NOT NULL,
 interval_semantics TEXT NOT NULL CHECK(interval_semantics IN ('issue_range','reign_proxy','century_normalization','terminus','unknown')),
 precision TEXT NOT NULL CHECK(precision IN ('year','decade','half_century','century','range','unknown')),
 confidence TEXT NOT NULL CHECK(confidence IN ('certain','probable','possible','disputed','unassessed')),
 citation_id TEXT NOT NULL REFERENCES citation(id), normalization_note TEXT,
 is_preferred INTEGER NOT NULL DEFAULT 0 CHECK(is_preferred IN (0,1)),
 CHECK(start_year IS NULL OR end_year IS NULL OR start_year<=end_year)
);
CREATE UNIQUE INDEX idx_type_preferred_date ON dating_claim(type_id) WHERE is_preferred=1;
CREATE TABLE type_face (
 id TEXT PRIMARY KEY, type_id TEXT NOT NULL REFERENCES coin_type(id),
 side TEXT NOT NULL CHECK(side IN ('obverse','reverse','uncertain')),
 description TEXT, citation_id TEXT NOT NULL REFERENCES citation(id)
);
CREATE TABLE legend_reading (
 id TEXT PRIMARY KEY, face_id TEXT NOT NULL REFERENCES type_face(id),
 original_text TEXT, transliteration TEXT, translation TEXT,
 language TEXT, script TEXT, reading_author TEXT,
 confidence TEXT NOT NULL CHECK(confidence IN ('certain','probable','possible','disputed','unassessed')),
 citation_id TEXT NOT NULL REFERENCES citation(id), note TEXT
);
CREATE TABLE symbol (
 id TEXT PRIMARY KEY, label TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('tamgha','countermark','monogram','other')),
 description TEXT, external_uri TEXT
);
CREATE TABLE face_symbol (
 face_id TEXT NOT NULL REFERENCES type_face(id), symbol_id TEXT NOT NULL REFERENCES symbol(id),
 position TEXT NOT NULL DEFAULT 'unspecified', orientation TEXT,
 citation_id TEXT NOT NULL REFERENCES citation(id),
 PRIMARY KEY(face_id,symbol_id,position,citation_id)
);
-- Shared form and shared political identity are separate propositions.
CREATE TABLE symbol_relation_claim (
 id TEXT PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES symbol(id),
 object_id TEXT NOT NULL REFERENCES symbol(id),
 relation TEXT NOT NULL CHECK(relation IN ('similar_form','variant_of','same_symbol')),
 citation_id TEXT NOT NULL REFERENCES citation(id), confidence TEXT NOT NULL, note TEXT,
 CHECK(subject_id<>object_id)
);
CREATE TABLE concept (
 id TEXT PRIMARY KEY, label TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('material','denomination','iconography','influence','prototype')),
 nomisma_uri TEXT
);
CREATE TABLE type_concept_claim (
 type_id TEXT NOT NULL REFERENCES coin_type(id), concept_id TEXT NOT NULL REFERENCES concept(id),
 citation_id TEXT NOT NULL REFERENCES citation(id), note TEXT,
 PRIMARY KEY(type_id,concept_id,citation_id)
);
CREATE TABLE find_context (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('hoard','single_find','excavation_context','reported_find')),
 place_id TEXT REFERENCES place(id), description TEXT,
 citation_id TEXT NOT NULL REFERENCES citation(id), confidence TEXT NOT NULL
);
CREATE TABLE specimen_find_claim (
 specimen_id TEXT NOT NULL REFERENCES specimen(id), find_context_id TEXT NOT NULL REFERENCES find_context(id),
 citation_id TEXT NOT NULL REFERENCES citation(id), note TEXT,
 PRIMARY KEY(specimen_id,find_context_id,citation_id)
);
CREATE TABLE type_publication (
 type_id TEXT NOT NULL REFERENCES coin_type(id), citation_id TEXT NOT NULL REFERENCES citation(id),
 role TEXT NOT NULL CHECK(role IN ('defines_type','revises_attribution','specimen_description','background','comparison')),
 PRIMARY KEY(type_id,citation_id,role)
);
CREATE TABLE external_record (
 id TEXT PRIMARY KEY, provider TEXT NOT NULL, record_key TEXT NOT NULL, url TEXT NOT NULL,
 identity_status TEXT NOT NULL CHECK(identity_status IN ('resolved','pending_resolution')),
 record_kind TEXT NOT NULL CHECK(record_kind IN ('type','specimen','category','unknown')),
 verification_status TEXT NOT NULL CHECK(verification_status IN ('directly_checked','reported_by_source','unverified')),
 checked_on TEXT, citation_id TEXT REFERENCES citation(id),
 UNIQUE(provider,record_key)
);
-- Keep every observed URL even when several URLs resolve to one source identity.
CREATE TABLE external_record_url (
 external_record_id TEXT NOT NULL REFERENCES external_record(id), url TEXT NOT NULL,
 citation_id TEXT NOT NULL REFERENCES citation(id),
 PRIMARY KEY(external_record_id,url)
);
CREATE TABLE external_record_classification (
 external_record_id TEXT NOT NULL REFERENCES external_record(id),
 scheme TEXT NOT NULL, path_json TEXT NOT NULL, leaf_key TEXT, leaf_label TEXT,
 citation_id TEXT REFERENCES citation(id),
 PRIMARY KEY(external_record_id,scheme,path_json)
);
CREATE TABLE specimen_external_record (
 specimen_id TEXT NOT NULL REFERENCES specimen(id), external_record_id TEXT NOT NULL REFERENCES external_record(id),
 relation TEXT NOT NULL CHECK(relation IN ('same_specimen','comparison','unreviewed')),
 PRIMARY KEY(specimen_id,external_record_id)
);
CREATE TABLE type_external_record (
 type_id TEXT NOT NULL REFERENCES coin_type(id), external_record_id TEXT NOT NULL REFERENCES external_record(id),
 relation TEXT NOT NULL CHECK(relation IN ('equivalent','broader','narrower','comparison','unreviewed')),
 PRIMARY KEY(type_id,external_record_id)
);
-- Actual first queries: place → types; type → specimens; type → sources.
CREATE INDEX idx_type_place_lookup ON type_place_claim(place_id,type_id);
CREATE INDEX idx_specimen_type_lookup ON specimen_type_claim(type_id,specimen_id);
CREATE INDEX idx_dating_range ON dating_claim(start_year,end_year) WHERE is_preferred=1;

-- v0.2: explicit hierarchy, browsing anchors and evidence-backed areas.
CREATE TABLE type_level (
 type_id TEXT PRIMARY KEY REFERENCES coin_type(id),
 level TEXT NOT NULL CHECK(level IN ('family','major_type','variant','source_reference_group')),
 classification_scheme TEXT, note TEXT
);
CREATE TABLE display_anchor (
 type_id TEXT PRIMARY KEY REFERENCES coin_type(id), place_id TEXT NOT NULL REFERENCES place(id),
 role TEXT NOT NULL CHECK(role IN ('core_findspot','attributed_city','polity_centre','regional_orientation')),
 citation_id TEXT REFERENCES citation(id), editorial_note TEXT NOT NULL
);
CREATE TABLE distribution_claim (
 id TEXT PRIMARY KEY, type_id TEXT NOT NULL REFERENCES coin_type(id),
 kind TEXT NOT NULL CHECK(kind IN ('documented_circulation','inferred_distribution','geographic_context')),
 geometry_geojson TEXT NOT NULL, method TEXT NOT NULL,
 citation_id TEXT NOT NULL REFERENCES citation(id), confidence TEXT NOT NULL,
 start_year INTEGER, end_year INTEGER, note TEXT,
 CHECK(start_year IS NULL OR end_year IS NULL OR start_year<=end_year)
);
CREATE TABLE find_dating (
 id TEXT PRIMARY KEY, find_context_id TEXT NOT NULL REFERENCES find_context(id),
 event TEXT NOT NULL CHECK(event IN ('deposition','archaeological_context','modern_discovery')),
 start_year INTEGER, end_year INTEGER, citation_id TEXT NOT NULL REFERENCES citation(id),
 CHECK(start_year IS NULL OR end_year IS NULL OR start_year<=end_year)
);
CREATE TABLE specimen_feature (
 specimen_id TEXT NOT NULL REFERENCES specimen(id), label TEXT NOT NULL,
 citation_id TEXT NOT NULL REFERENCES citation(id),
 PRIMARY KEY(specimen_id,label,citation_id)
);
CREATE TABLE manufacture_link (
 id TEXT PRIMARY KEY, specimen_a TEXT NOT NULL REFERENCES specimen(id), specimen_b TEXT NOT NULL REFERENCES specimen(id),
 relation TEXT NOT NULL CHECK(relation IN ('same_die','same_mould','same_mother_model','possible_link')),
 confidence TEXT NOT NULL, citation_id TEXT NOT NULL REFERENCES citation(id), note TEXT,
 CHECK(specimen_a<>specimen_b)
);
CREATE TABLE coverage_snapshot (
 id TEXT PRIMARY KEY, provider TEXT NOT NULL, category_url TEXT NOT NULL,
 retrieved_on TEXT NOT NULL, expected_record_count INTEGER, scope_note TEXT NOT NULL,
 manifest_path TEXT NOT NULL
);
CREATE TABLE coverage_record (
 snapshot_id TEXT NOT NULL REFERENCES coverage_snapshot(id), source_record_key TEXT NOT NULL,
 external_record_id TEXT NOT NULL REFERENCES external_record(id),
 source_manifest_path TEXT NOT NULL, raw_html_path TEXT, source_path_json TEXT,
 specimen_id TEXT REFERENCES specimen(id), image_id TEXT REFERENCES image(id), status TEXT NOT NULL,
 PRIMARY KEY(snapshot_id,source_record_key)
);

-- T04: one attribution decision per stable image; conflicting candidates remain evidence.
CREATE TABLE image_provenance (
 image_id TEXT PRIMARY KEY REFERENCES image(id),
 external_record_id TEXT REFERENCES external_record(id), source_page_url TEXT,
 status TEXT NOT NULL CHECK(status IN ('resolved','unresolved','ambiguous')),
 method TEXT NOT NULL, evidence_json TEXT NOT NULL CHECK(json_valid(evidence_json)), notes TEXT,
 CHECK((external_record_id IS NULL)=(source_page_url IS NULL)),
 CHECK(status<>'resolved' OR external_record_id IS NOT NULL),
 CHECK(status<>'ambiguous' OR external_record_id IS NULL),
 FOREIGN KEY(external_record_id,source_page_url) REFERENCES external_record_url(external_record_id,url)
);
CREATE INDEX idx_image_provenance_source ON image_provenance(external_record_id);
-- Left joins keep unresolved images visible for all image/specimen queries.
CREATE VIEW image_provenance_detail AS
 SELECT i.id AS image_id,i.specimen_id,p.external_record_id AS source_entity_id,
        e.provider,e.record_key AS provider_source_key,e.identity_status,
        i.local_path,p.source_page_url,i.source_url AS source_image_url,
        p.status,p.method,p.evidence_json,p.notes
 FROM image i JOIN image_provenance p ON p.image_id=i.id
 LEFT JOIN external_record e ON e.id=p.external_record_id;

-- T05 additive overlay. Candidate discovery and reviewed identity stay separate.
CREATE TABLE reconciliation_candidates (
 candidate_id TEXT PRIMARY KEY,
 specimen_id_a TEXT NOT NULL REFERENCES specimen(id),
 specimen_id_b TEXT NOT NULL REFERENCES specimen(id),
 discovery_evidence_json TEXT NOT NULL CHECK(json_valid(discovery_evidence_json)),
 CHECK(specimen_id_a<specimen_id_b), UNIQUE(specimen_id_a,specimen_id_b)
);
CREATE TABLE reconciliation_assertions (
 assertion_id TEXT PRIMARY KEY,
 specimen_id_a TEXT NOT NULL REFERENCES specimen(id),
 specimen_id_b TEXT NOT NULL REFERENCES specimen(id),
 status TEXT NOT NULL CHECK(status IN ('confirmed_same','candidate_review','confirmed_distinct','unresolved')),
 evidence_type TEXT NOT NULL, evidence_json TEXT NOT NULL CHECK(json_valid(evidence_json) AND json_array_length(evidence_json)>0),
 review_note TEXT NOT NULL,
 created_method TEXT NOT NULL CHECK(created_method='manual_object_evidence_review'),
 CHECK(specimen_id_a<specimen_id_b), UNIQUE(specimen_id_a,specimen_id_b),
 CHECK(status NOT IN ('confirmed_same','confirmed_distinct') OR evidence_type IN
 ('explicit_provenance_cross_reference','unique_inventory_reference','explicit_auction_provenance_chain','explicit_same_object_statement'))
);
CREATE TABLE physical_specimen_groups (
 physical_group_id TEXT PRIMARY KEY,
 created_method TEXT NOT NULL CHECK(created_method='manual_object_evidence_review'), notes TEXT
);
CREATE TABLE physical_specimen_group_members (
 physical_group_id TEXT NOT NULL REFERENCES physical_specimen_groups(physical_group_id),
 specimen_id TEXT NOT NULL UNIQUE REFERENCES specimen(id),
 PRIMARY KEY(physical_group_id,specimen_id)
);
CREATE TABLE physical_group_assertions (
 physical_group_id TEXT NOT NULL REFERENCES physical_specimen_groups(physical_group_id),
 assertion_id TEXT NOT NULL REFERENCES reconciliation_assertions(assertion_id),
 PRIMARY KEY(physical_group_id,assertion_id)
);
CREATE VIEW reconciliation_decisions AS
 WITH pairs AS (
 SELECT specimen_id_a,specimen_id_b FROM reconciliation_candidates
 UNION SELECT specimen_id_a,specimen_id_b FROM reconciliation_assertions)
 SELECT p.specimen_id_a,p.specimen_id_b,COALESCE(a.status,'candidate_review') AS status,
        c.candidate_id,c.discovery_evidence_json,a.assertion_id,a.evidence_type,a.evidence_json,a.review_note
 FROM pairs p LEFT JOIN reconciliation_candidates c USING(specimen_id_a,specimen_id_b)
 LEFT JOIN reconciliation_assertions a USING(specimen_id_a,specimen_id_b);
CREATE VIEW physical_group_sources AS
 SELECT DISTINCT m.physical_group_id,s.specimen_id,e.id AS source_entity_id,e.provider,e.record_key
 FROM physical_specimen_group_members m
 JOIN specimen_external_record s ON s.specimen_id=m.specimen_id
 JOIN external_record e ON e.id=s.external_record_id WHERE s.relation='same_specimen';
CREATE VIEW physical_group_images AS
 SELECT m.physical_group_id,p.* FROM physical_specimen_group_members m
 JOIN image_provenance_detail p ON p.specimen_id=m.specimen_id;
