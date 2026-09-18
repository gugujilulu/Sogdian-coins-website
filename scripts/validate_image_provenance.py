"""T04 checks, called from validate-atlas.py with its existing temporary export."""
import json
import sqlite3
import subprocess
import sys
from collections import Counter
from image_provenance import evidence_index, resolve_image


def validate_image_provenance(root, atlas, db, second_path):
    images = [im for s in atlas['specimens'] for im in s['images']]
    assert len(images) == len({im['id'] for im in images}) == 1013
    assert (len(atlas['families']), len(atlas['variants']), len(atlas['specimens']),
            len(atlas['relatedRecords'])) == (56, 120, 1010, 701)
    assert db.execute('SELECT count(*) FROM external_record').fetchone()[0] == 3999
    assert db.execute("SELECT count(*) FROM external_record WHERE identity_status='pending_resolution'").fetchone()[0] == 6
    rows = db.execute('SELECT image_id,status,source_entity_id,provider,provider_source_key,evidence_json FROM image_provenance_detail').fetchall()
    assert len(rows) == len(images)
    assert {row[0] for row in rows} == {im['id'] for im in images}
    for specimen in atlas['specimens']:
        for im in specimen['images']:
            assert (root / 'public' / im['path'].lstrip('/')).is_file()
            row = db.execute('SELECT specimen_id,local_path,source_url,credit,rights_status,rights_source_url FROM image WHERE id=?',(im['id'],)).fetchone()
            assert row == (specimen['id'], im['path'], im['sourceUrl'], im['credit'], im['rightsStatus'], im.get('rightsSourceUrl'))
    for image_id, status, eid, provider, source_key, evidence_json in rows:
        assert status in {'resolved', 'unresolved', 'ambiguous'}
        evidence = json.loads(evidence_json)
        for item in evidence:
            assert (root / item['document']).is_file()
            if item.get('source_document'):
                assert (root / item['source_document']).is_file()
            if item['raw_html']:
                assert (root / item['raw_html']).is_file()
                assert item['raw_html_status']=='available'
            elif item['raw_html_reference']:
                assert item['raw_html_status']=='missing'
                assert not (root / item['raw_html_reference']).is_file()
            else:
                assert item['raw_html_status']=='not_recorded'
        if status == 'resolved':
            assert eid and evidence
            assert {(e['provider'], e['source_key']) for e in evidence} == {(provider, source_key)}
            assert db.execute('SELECT identity_status FROM external_record WHERE id=?',(eid,)).fetchone()[0] == 'resolved'
        if status == 'ambiguous':
            assert eid is None
        if eid:
            assert db.execute("SELECT 1 FROM image i JOIN specimen_external_record s ON i.specimen_id=s.specimen_id WHERE i.id=? AND s.external_record_id=? AND s.relation='same_specimen'",(image_id,eid)).fetchone()
            # The legacy citation now cites this image's evidenced source page.
            assert db.execute('SELECT p.url=q.source_page_url FROM image i JOIN citation c ON c.id=i.citation_id JOIN publication p ON p.id=c.publication_id JOIN image_provenance q ON q.image_id=i.id WHERE i.id=?',(image_id,)).fetchone()[0] == 1
    # A / B / C / D: view supports image, specimen, source-entity and provider/key queries.
    assert db.execute("SELECT specimen_id,provider,provider_source_key,status FROM image_provenance_detail WHERE image_id='z20696'").fetchone() == ('sr9','Zeno','20696','resolved')
    assert set(db.execute("SELECT image_id,provider,provider_source_key FROM image_provenance_detail WHERE specimen_id='zeno-264408'")) == {('z264408','Zeno','264408'),('bactrianumis-5898-photo','Bactrianumis','5898')}
    assert db.execute("SELECT provider,provider_source_key,status FROM image_provenance_detail WHERE image_id='z1063'").fetchone() == ('Zeno','1063','resolved')
    cng = db.execute("SELECT source_entity_id FROM image_provenance_detail WHERE provider='CNG' AND provider_source_key='4-LGIJRO'").fetchone()[0]
    assert set(db.execute('SELECT image_id FROM image_provenance_detail WHERE source_entity_id=?',(cng,))) == {('cng611-576-photo',),('cng611-576-alternate',)}
    assert db.execute("SELECT provider,provider_source_key FROM image_provenance_detail WHERE image_id='sarc52-1614-photo'").fetchone() == ('NumisBids','sale/9278/lot/1614')
    z_evidence = json.loads(db.execute("SELECT evidence_json FROM image_provenance WHERE image_id='z20696'").fetchone()[0])
    assert {e['document'] for e in z_evidence} >= {'research/zeno/manifest-503.json','research/zeno/manifest-795.json'}
    assert not db.execute('PRAGMA foreign_key_check').fetchall()

    # Small adversarial fixtures: order, conflicting candidates, absent evidence,
    # pending identity and comparison-only links must never force an attribution.
    index = evidence_index(root)
    entities = {(p,k): {'id':eid,'identity_status':status} for eid,p,k,status in db.execute('SELECT id,provider,record_key,identity_status FROM external_record')}
    associations = set(db.execute("SELECT specimen_id,external_record_id FROM specimen_external_record WHERE relation='same_specimen'"))
    urls = set(db.execute('SELECT external_record_id,url FROM external_record_url'))
    im = next(i for i in images if i['id']=='z20696')
    key = (im['path'],im['sourceUrl'])
    expected = resolve_image(im,'sr9',index,entities,associations,urls)
    assert resolve_image(im,'sr9',{key:list(reversed(index[key]))},entities,associations,urls) == expected
    assert resolve_image(im,'sr9',{},entities,associations,urls)['status'] == 'unresolved'
    conflicting = dict(index[key][0], source_key='264408')
    result = resolve_image(im,'sr9',{key:index[key]+[conflicting]},entities,associations,urls)
    assert result['status']=='ambiguous' and result['external_record_id'] is None
    assert resolve_image(im,'sr9',index,entities,set(),urls)['external_record_id'] is None
    legacy = next(i for i in images if i['id']=='sr9-photo')
    pending = resolve_image(legacy,'sr9',index,entities,associations,urls)
    assert pending['status']=='unresolved' and pending['external_record_id'] is not None

    # Required deterministic check: same input exported twice, compare logical DB
    # contents (not SQLite file bytes/page allocation). Includes all T03 identities.
    subprocess.run([sys.executable,str(root/'scripts/export-atlas-db.py'),str(second_path)],check=True,capture_output=True)
    with sqlite3.connect(second_path) as repeated:
        assert list(db.iterdump()) == list(repeated.iterdump()), 'Repeated SQLite export differs'
    counts = Counter(row[1] for row in rows)
    by_provider = Counter(row[3] for row in rows if row[1]=='resolved')
    no_entity = sum(row[2] is None for row in rows)
    multiple_images = db.execute('SELECT e.provider,e.record_key,count(*) FROM image_provenance p JOIN external_record e ON e.id=p.external_record_id GROUP BY e.id HAVING count(*)>1 ORDER BY e.provider,e.record_key').fetchall()
    multiple_sources = db.execute('SELECT i.specimen_id,count(DISTINCT p.external_record_id) FROM image i JOIN image_provenance p ON p.image_id=i.id GROUP BY i.specimen_id HAVING count(DISTINCT p.external_record_id)>1 ORDER BY i.specimen_id').fetchall()
    missing_html = sorted({row[0] for row in rows if any(e['raw_html_status']=='missing' for e in json.loads(row[5]))})
    print('T04 images with recorded-but-missing HTML (local JSON evidence retained):',len(missing_html),missing_html)
    print('T04 provenance:',dict(counts),'resolved by provider:',dict(sorted(by_provider.items())),'no source entity:',no_entity)
    print('T04 sources with multiple images (including identified pages with pending keys):',multiple_images)
    print('T04 specimens with multiple image sources:',multiple_sources)
    print('T04 PASS: preserved image IDs/paths/rights, exact source relations, ambiguous/unresolved handling, repeated export, foreign keys')
