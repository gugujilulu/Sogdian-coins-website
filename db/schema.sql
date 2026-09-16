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
 license_uri TEXT, rights_status TEXT NOT NULL CHECK(rights_status IN ('open_license','permission','public_domain','unverified')),
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
 record_kind TEXT NOT NULL CHECK(record_kind IN ('type','specimen','category','unknown')),
 verification_status TEXT NOT NULL CHECK(verification_status IN ('directly_checked','reported_by_source','unverified')),
 checked_on TEXT, citation_id TEXT REFERENCES citation(id),
 UNIQUE(provider,record_key)
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
