"""Additive physical-object overlay. Discovery can never create confirmed groups."""
import hashlib
import itertools
import json

STRONG_EVIDENCE = {'explicit_provenance_cross_reference', 'unique_inventory_reference',
                   'explicit_auction_provenance_chain', 'explicit_same_object_statement'}
STATUSES = {'confirmed_same', 'candidate_review', 'confirmed_distinct', 'unresolved'}


def stable_id(prefix, values):
    return prefix + hashlib.sha256(json.dumps(values, separators=(',', ':')).encode()).hexdigest()[:20]


def core_fingerprints(db, tables):
    result = {}
    for table in sorted(tables):
        # Names come from the committed baseline, never from a query parameter.
        if not table.replace('_', '').isalnum():
            raise ValueError('Invalid table name')
        columns = [r[1] for r in db.execute('PRAGMA table_info(' + table + ')')]
        rows = sorted(json.dumps(list(r), ensure_ascii=False, separators=(',', ':'))
                      for r in db.execute('SELECT * FROM ' + table))
        result[table] = {'columns': columns, 'count': len(rows),
                         'sha256': hashlib.sha256('\n'.join(rows).encode()).hexdigest()}
    return result


def verify_t04(db, root):
    baseline = json.loads((root / 'research/t04-logical-baseline.json').read_text())
    if core_fingerprints(db, baseline['tables']) != baseline['tables']:
        raise ValueError('T04 logical data changed; reconciliation cannot rewrite the corpus')


def discover_candidates(db):
    """Only existing explicit comparison links: a bounded review queue, not identity."""
    pairs = {}
    rows = db.execute("""
      SELECT a.specimen_id,b.specimen_id,a.external_record_id,e.provider,e.record_key,e.url
      FROM specimen_external_record a JOIN specimen_external_record b
      ON a.external_record_id=b.external_record_id
      JOIN external_record e ON e.id=a.external_record_id
      WHERE a.relation='comparison' AND b.relation='same_specimen'
        AND a.specimen_id<>b.specimen_id AND e.identity_status='resolved'
      ORDER BY a.specimen_id,b.specimen_id,a.external_record_id
    """)
    for left, right, eid, provider, key, url in rows:
        pair = tuple(sorted((left, right)))
        images = list(db.execute('SELECT image_id,specimen_id,source_entity_id,status FROM image_provenance_detail WHERE specimen_id IN (?,?) ORDER BY image_id', pair))
        pairs.setdefault(pair, []).append({
            'method': 'existing_comparison_reference', 'document': 'public/data/atlas.json',
            'referring_specimen_id': left, 'referenced_specimen_id': right,
            'source_entity_id': eid, 'provider': provider, 'source_key': key,
            'source_url': url, 't04_images': images,
            'warning': 'Comparison is not a same-object assertion.'})
    return [(stable_id('candidate-', pair), *pair,
             json.dumps(evidence, ensure_ascii=False, sort_keys=True))
            for pair, evidence in sorted(pairs.items())]


def evidence_value(root, item):
    path = (root / item['document']).resolve()
    if not path.is_relative_to(root.resolve()) or not path.is_file():
        raise ValueError('Evidence document missing or outside repository')
    text = path.read_text()
    locator = item.get('locator', '')
    if path.suffix == '.json':
        value = json.loads(text)
        if not locator.startswith('/'):
            raise ValueError('JSON evidence needs an exact JSON pointer')
        for token in locator.split('/')[1:]:
            token = token.replace('~1', '/').replace('~0', '~')
            value = value[int(token)] if isinstance(value, list) else value[token]
        text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)
    elif not locator:
        raise ValueError('Evidence needs a local locator')
    quote = item.get('quoted_text')
    if not quote or quote not in text:
        raise ValueError('Evidence quote not found at local locator')


def validate_exact_image(root, item, pair):
    proof = item.get('exact_image', {})
    usage = proof.get('source_usage_review', {})
    if usage.get('status') != 'reviewed_no_warning' or usage.get('flags') != [] or not usage.get('note'):
        raise ValueError('Stock/reference/misassigned/placeholder risk needs manual review')
    atlas = json.loads((root / 'public/data/atlas.json').read_text())
    images = {im['id']: (record['id'], im['path']) for record in atlas['specimens'] for im in record['images']}
    selected = proof.get('image_ids', [])
    if len(selected) != 2 or len(set(selected)) != 2:
        raise ValueError('Exact-image proof needs two explicit image IDs')
    if sorted(images[i][0] for i in selected) != list(pair):
        raise ValueError('Exact-image proof does not cover both specimen records')
    hashes, paths = [], []
    for image_id in selected:
        path = (root / 'public' / images[image_id][1].lstrip('/')).resolve()
        if not path.is_relative_to((root / 'public').resolve()) or not path.is_file():
            raise ValueError('Exact-image local file is missing')
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if proof.get('sha256', {}).get(image_id) != digest:
            raise ValueError('Exact-image cryptographic hash mismatch')
        paths.append(path)
        hashes.append(digest)
    kind = proof.get('kind')
    if kind == 'same_file':
        if paths[0] != paths[1]:
            raise ValueError('Not the same original file')
    elif kind == 'sha256':
        if hashes[0] != hashes[1]:
            raise ValueError('Different cryptographic hashes are not exact image identity')
    elif kind == 'documented_direct_derivation':
        report = proof.get('technical_evidence', {})
        evidence_value(root, report)
        # A local, reviewed technical report must identify both exact byte endpoints.
        # This is not an image-similarity classifier or an automatic inference.
        if report.get('sha256') != proof['sha256'] or report.get('result') != 'same_original_photo_verified':
            raise ValueError('Derivation evidence does not verify these image files')
        operations = report.get('operations', [])
        if not operations or not set(operations) <= {'resize','crop','watermark','compression'}:
            raise ValueError('Derivation must be a documented direct photo transformation')
        if not report.get('reviewed_by'):
            raise ValueError('Derivation technical evidence needs an identified reviewer')
        if not all(digest in report['quoted_text'] for digest in hashes):
            raise ValueError('Technical quote must bind both cryptographic endpoints')
    else:
        raise ValueError('Perceptual/visual similarity is not exact-image evidence')


def validate_plan(root, plan, known_ids):
    image_warnings = set()
    for warning in plan.get('image_usage_warnings', []):
        evidence_value(root, warning['evidence'])
        image_warnings.add(tuple(sorted(warning['specimen_ids'])))
    decisions = {}
    for assertion in plan['assertions']:
        a, b = assertion['specimen_id_a'], assertion['specimen_id_b']
        pair = (a, b)
        if a >= b or not {a, b} <= known_ids or pair in decisions:
            raise ValueError('Invalid, duplicate or unknown reconciliation pair')
        status = assertion['status']
        if status not in STATUSES or not assertion.get('review_note'):
            raise ValueError('Missing reconciliation status/review note')
        if assertion['created_method'] != 'manual_object_evidence_review':
            raise ValueError('Automatic confirmation/review is not supported')
        if not assertion.get('evidence'):
            raise ValueError('Review needs auditable evidence')
        for item in assertion['evidence']:
            evidence_value(root, item)
        if status in {'confirmed_same', 'confirmed_distinct'} and assertion['evidence_type']=='exact_image_identity':
            if status!='confirmed_same' or pair in image_warnings:
                raise ValueError('Exact image cannot prove distinctness or bypass a recorded usage warning')
            for item in assertion['evidence']:
                validate_exact_image(root,item,pair)
        elif status in {'confirmed_same', 'confirmed_distinct'}:
            if assertion['evidence_type'] not in STRONG_EVIDENCE:
                raise ValueError('Weak evidence cannot confirm sameness or distinctness')
            for item in assertion['evidence']:
                # A reviewer supplies the explicit object reference, not a score.
                ref = item.get('object_reference', {})
                if not ref.get('namespace') or not ref.get('identifier'):
                    raise ValueError('Confirmation needs a structured object-level reference')
                if sorted(ref.get('specimen_ids', [])) != [a, b]:
                    raise ValueError('Object reference must explicitly identify both records')
                if ref['identifier'] not in item['quoted_text']:
                    raise ValueError('Object identifier is not present in quoted evidence')
        decisions[pair] = assertion
    occupied = set()
    for group in plan['groups']:
        members = group['members']
        if len(set(members)) != len(members) or len(members) < 2 or not set(members) <= known_ids:
            raise ValueError('Physical group needs at least two existing distinct records')
        if occupied.intersection(members):
            raise ValueError('A record cannot belong to conflicting groups')
        occupied.update(members)
        # Conservative clique requirement: no inferred transitive confirmation.
        for pair in itertools.combinations(sorted(members), 2):
            if decisions.get(pair, {}).get('status') != 'confirmed_same':
                raise ValueError('Every group pair needs an explicit confirmed_same review')
    return decisions


def export_reconciliation(root, db):
    verify_t04(db, root)
    plan = json.loads((root / 'research/physical-reconciliation.json').read_text())
    known_ids = {row[0] for row in db.execute('SELECT id FROM specimen')}
    decisions = validate_plan(root, plan, known_ids)
    for row in discover_candidates(db):
        db.execute('INSERT INTO reconciliation_candidates VALUES (?,?,?,?)', row)
    for pair, assertion in sorted(decisions.items()):
        db.execute('INSERT INTO reconciliation_assertions VALUES (?,?,?,?,?,?,?,?)',
                   (stable_id('assertion-', pair), *pair, assertion['status'],
                    assertion['evidence_type'], json.dumps(assertion['evidence'], ensure_ascii=False, sort_keys=True),
                    assertion['review_note'], assertion['created_method']))
    for group in sorted(plan['groups'], key=lambda g: sorted(g['members'])):
        members = sorted(group['members'])
        gid = stable_id('physical-', members)
        db.execute('INSERT INTO physical_specimen_groups VALUES (?,?,?)',
                   (gid, 'manual_object_evidence_review', group.get('notes')))
        db.executemany('INSERT INTO physical_specimen_group_members VALUES (?,?)',
                       [(gid, member) for member in members])
        db.executemany('INSERT INTO physical_group_assertions VALUES (?,?)',
                       [(gid, stable_id('assertion-', pair)) for pair in itertools.combinations(members, 2)])
    verify_t04(db, root)
