"""Non-destructive normalized taxonomy, independent of source catalogue groupings."""
import hashlib
import json
from physical_reconciliation import core_fingerprints, stable_id, evidence_value

RANKS = ('family', 'major_type', 'variant', 'subvariant')
STATES = {'accepted', 'provisional', 'deprecated', 'unresolved'}
ASSIGNMENT_STATES = {'confirmed', 'provisional', 'unresolved'}
TABLES = ('source_taxonomy_mapping', 'taxonomy_resolution', 'specimen_taxonomy_assignment',
          'taxonomy_alias', 'source_taxonomy_label', 'taxonomy_node')


def node_id(key):
    # This accession key is immutable metadata, not a title or an array position.
    if not isinstance(key, str) or not key or any(c.isspace() for c in key):
        raise ValueError('Taxonomy needs a nonempty immutable accession key')
    return 'taxonomy:' + key


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify_t05(root, db):
    baseline = json.loads((root / 'research/t05-logical-baseline.json').read_text())
    require(all(hashlib.sha256((root / path).read_bytes()).hexdigest() == digest
                for path, digest in baseline['files'].items()), 'T05 corpus/reconciliation source files changed')
    require(core_fingerprints(db, baseline['tables']) == baseline['tables'],
            'T06 must preserve every row and column of the 43 T05 tables')


def source_labels(db):
    return [(stable_id('source-label-', [eid, scheme, context]), eid, scheme, context,
             key, label, label, 'external_record_classification:' + eid + ':' + scheme)
            for eid, scheme, context, key, label in db.execute(
                'SELECT external_record_id,scheme,path_json,leaf_key,leaf_label '
                "FROM external_record_classification WHERE leaf_label IS NOT NULL AND leaf_label<>'' "
                'ORDER BY external_record_id,scheme,path_json')]


def reviewed_evidence(root, item):
    require(bool(item.get('reviewed_by')), 'Taxonomy research needs a named reviewer')
    evidence_value(root, item['evidence'])
    return json.dumps({'reviewed_by': item['reviewed_by'], 'evidence': item['evidence']},
                      ensure_ascii=False, sort_keys=True)


def resolution_rows(db, known):
    rows = []
    for sid in sorted(known):
        for rank in ('major_type', 'variant'):
            states = {r[0] for r in db.execute(
                'SELECT assignment_status FROM specimen_taxonomy_path WHERE specimen_id=? AND rank=?',
                (sid, rank))}
            state = 'assigned' if 'confirmed' in states else 'provisional' if 'provisional' in states else 'unresolved'
            rows.append((sid, rank, state, 'Derived from explicit assignments; missing depth remains unknown.'))
    return rows


def validate_structure(db):
    nodes = {r[0]: dict(zip(('key','parent','rank','status','legacy'), r[1:])) for r in db.execute(
        'SELECT taxonomy_id,stable_key,parent_taxonomy_id,rank,status,legacy_family_id FROM taxonomy_node')}
    ancestors = {}
    for tid, n in nodes.items():
        require(tid == node_id(n['key']) and n['rank'] in RANKS and n['status'] in STATES,
                'Invalid taxonomy identity/rank/status')
        seen, current = set(), tid
        while current is not None:
            require(current in nodes and current not in seen, 'Missing parent or taxonomy cycle')
            seen.add(current)
            current = nodes[current]['parent']
        ancestors[tid] = seen
        if n['rank'] == 'family':
            require(n['parent'] is None and n['legacy'] is not None, 'Family must be a traced root')
        else:
            require(n['parent'] in nodes and nodes[n['parent']]['rank'] == RANKS[RANKS.index(n['rank'])-1],
                    'Invalid taxonomy rank sequence')
            require(n['legacy'] is None, 'Only family may own a legacy family identity')
    known = {r[0] for r in db.execute('SELECT id FROM specimen')}
    confirmed = {}
    for sid, tid, status, evidence, note in db.execute('SELECT * FROM specimen_taxonomy_assignment'):
        require(sid in known and tid in nodes and status in ASSIGNMENT_STATES and evidence and note,
                'Invalid taxonomy assignment')
        if status == 'confirmed':
            require(nodes[tid]['status'] == 'accepted', 'Confirmed assignment requires accepted node')
            confirmed.setdefault(sid, []).append(tid)
    for tids in confirmed.values():
        for a in tids:
            for b in tids:
                require(a in ancestors[b] or b in ancestors[a], 'Conflicting confirmed assignment branches')
    require(not db.execute('PRAGMA foreign_key_check').fetchall(), 'Taxonomy foreign key failure')
    return known


def export_taxonomy(root, atlas, db):
    verify_t05(root, db)
    plan = json.loads((root / 'research/taxonomy.json').read_text())
    for f in sorted(atlas['families'], key=lambda f: f['id']):
        key = 'family:' + f['id']
        db.execute('INSERT INTO taxonomy_node VALUES (?,?,?,?,?,?,?,?,?,?)',
                   (node_id(key), key, None, 'family', f['title'], f['title'], 'accepted', f['id'],
                    'public/data/atlas.json:families[id=' + f['id'] + ']',
                    'Accepted as the existing editorial family; not a new academic attribution.'))
    # Deferred FK allows declaration order to change without affecting IDs or export validity.
    db.execute('PRAGMA defer_foreign_keys=ON')
    for n in sorted(plan['nodes'], key=lambda n: n['stable_key']):
        require(n['rank'] != 'family', 'T06 does not create/split/merge baseline families')
        db.execute('INSERT INTO taxonomy_node VALUES (?,?,?,?,?,?,?,?,?,?)',
                   (node_id(n['stable_key']), n['stable_key'], node_id(n['parent_key']), n['rank'],
                    n['canonical_name'], n['display_name'], n['status'], None,
                    reviewed_evidence(root, n), n['notes']))
    for s in sorted(atlas['specimens'], key=lambda s: s['id']):
        db.execute('INSERT INTO specimen_taxonomy_assignment VALUES (?,?,?,?,?)',
                   (s['id'], node_id('family:' + s['familyId']), 'confirmed',
                    'public/data/atlas.json:specimens[id=' + s['id'] + ']/familyId',
                    'Existing editorial family assignment retained; deeper levels are not inferred.'))
    for a in plan['assignments']:
        db.execute('INSERT INTO specimen_taxonomy_assignment VALUES (?,?,?,?,?)',
                   (a['specimen_id'], node_id(a['taxonomy_key']), a['assignment_status'],
                    reviewed_evidence(root, a), a['notes']))
    for a in plan['aliases']:
        db.execute('INSERT INTO taxonomy_alias VALUES (?,?,?)',
                   (node_id(a['taxonomy_key']), a['alias'], reviewed_evidence(root, a)))
    db.executemany('INSERT INTO source_taxonomy_label VALUES (?,?,?,?,?,?,?,?)', source_labels(db))
    # A contextual family link is not label/type equivalence, and remains provisional.
    rows = db.execute("""SELECT DISTINCT l.label_id,a.taxonomy_id
        FROM source_taxonomy_label l JOIN specimen_external_record s ON s.external_record_id=l.source_entity_id
        JOIN specimen_taxonomy_assignment a ON a.specimen_id=s.specimen_id
        JOIN taxonomy_node n ON n.taxonomy_id=a.taxonomy_id
        WHERE s.relation='same_specimen' AND n.rank='family' ORDER BY l.label_id,a.taxonomy_id""").fetchall()
    for lid, tid in rows:
        db.execute('INSERT INTO source_taxonomy_mapping VALUES (?,?,?,?,?,?)',
                   (lid, tid, 'contextual_family', 'provisional', 'Existing same_specimen link + family assignment',
                    'Record context only; does not equate this source category with an Atlas type.'))
    for m in plan['mappings']:
        db.execute('INSERT INTO source_taxonomy_mapping VALUES (?,?,?,?,?,?)',
                   (m['label_id'], node_id(m['taxonomy_key']), m['relation'], m['mapping_status'],
                    reviewed_evidence(root, m), m['notes']))
    known = validate_structure(db)
    db.executemany('INSERT INTO taxonomy_resolution VALUES (?,?,?,?)', resolution_rows(db, known))
    verify_t05(root, db)


def validate_taxonomy(root, atlas, db):
    verify_t05(root, db)
    known = validate_structure(db)
    actual = sorted(db.execute('SELECT * FROM source_taxonomy_label').fetchall())
    require(actual == sorted(source_labels(db)), 'Source labels/context overwritten or missing')
    families = dict(db.execute("SELECT legacy_family_id,taxonomy_id FROM taxonomy_node WHERE rank='family'"))
    require(families == {f['id']: node_id('family:' + f['id']) for f in atlas['families']}, 'Family identities changed')
    for s in atlas['specimens']:
        require(db.execute('SELECT assignment_status FROM specimen_taxonomy_assignment WHERE specimen_id=? AND taxonomy_id=?',
                           (s['id'], families[s['familyId']])).fetchone() == ('confirmed',), 'Family assignment changed')
    require(sorted(db.execute('SELECT * FROM taxonomy_resolution')) == resolution_rows(db, known), 'Resolution coverage stale')
    # Revocation demonstrates that taxonomy has no incoming dependency from the old corpus.
    expected_overlay = core_fingerprints(db, TABLES)
    db.execute('SAVEPOINT revoke_t06')
    for table in TABLES:
        db.execute('DELETE FROM ' + table)
    verify_t05(root, db)
    require(not db.execute('PRAGMA foreign_key_check').fetchall(), 'Taxonomy removal broke base data')
    # Rebuild only the overlay from the reviewed registry; catch tampered mappings,
    # evidence, aliases or node metadata as well as structural errors.
    export_taxonomy(root, atlas, db)
    require(core_fingerprints(db, TABLES) == expected_overlay, 'Taxonomy differs from reviewed registry/export')
    db.execute('ROLLBACK TO revoke_t06')
    db.execute('RELEASE revoke_t06')
    print('T06 nodes:', db.execute('SELECT rank,count(*) FROM taxonomy_node GROUP BY rank').fetchall())
    print('T06 assignment coverage:', db.execute('SELECT rank,assignment_status,count(DISTINCT specimen_id) FROM specimen_taxonomy_path GROUP BY rank,assignment_status').fetchall())
    print('T06 resolution:', db.execute('SELECT rank,status,count(*) FROM taxonomy_resolution GROUP BY rank,status').fetchall())
    print('T06 source labels/mappings:', len(actual), db.execute('SELECT mapping_status,count(*) FROM source_taxonomy_mapping GROUP BY mapping_status').fetchall())
    print('T06 PASS: 43 T05 tables unchanged; source labels preserved; hierarchy, assignments, revocation and foreign keys clean')
