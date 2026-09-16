"""Checks publication claims and relational invariants, including negative cases."""
import json,sqlite3,subprocess,sys,tempfile
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1];a=json.loads((root/'public/data/atlas.json').read_text());z=json.loads((root/'research/zeno/manifest-3106.json').read_text())
families={f['id'] for f in a['families']};variants={v['id']:v for v in a['variants']};places={p['id'] for p in a['places']};ids=[s['id'] for s in a['specimens']]
assert len(ids)==len(set(ids));assert len(families)==len(a['families'])
# Coverage is one explicitly scoped leaf, with actual local image bytes for every record.
expected={'388312','334987','264408','264184','227845','182898','130578','81165','77712','57887','54032','54031','29609','30750'}
assert {r['id'] for r in z['records']}==expected
assert {s['id'][5:] for s in a['specimens'] if s['id'].startswith('zeno-')}==expected
assert a['coverage']['importedZenoRecords']==14
for s in a['specimens']:
 assert s['familyId'] in families
 if s['variantId']:assert variants[s['variantId']]['familyId']==s['familyId']
 assert any(x['relation']=='same_specimen' for x in s['sources'])
 for im in s['images']:
  p=root/'public'/im['path'].lstrip('/');image=Image.open(p);assert image.size==(im['width'],im['height']);assert '/avatars/' not in im['sourceUrl'];assert p.stat().st_size>1000
# Explicitly identified repeated specimen is merged; comparison records remain independent.
assert 'bactrianumis-5898' not in ids
merged=next(s for s in a['specimens'] if s['id']=='zeno-264408');assert any('bactrianumis.com' in x['url'] for x in merged['sources'])
assert 'cng611-576' in ids and 'zeno-81165' in ids
assert next(s for s in a['specimens'] if s['id']=='zeno-334987')['diameterMm'] is None # source unit anomaly
for f in a['families']:
 if f['anchor']:assert f['anchor']['placeId'] in places
 assert f['start'] is None or f['start']<=f['end']
for x in a['areas']:assert x['source'] and x['note'] and x['kind'] in ['documented_circulation','inferred_distribution','geographic_context']
# Northern Afghanistan report has no exact point; don't silently turn it into Balkh.
assert not any(e['familyId']=='lady-nana' and e['placeId']=='balkh' for e in a['evidence'])
with tempfile.TemporaryDirectory() as tmp:
 p=Path(tmp)/'atlas.sqlite';subprocess.run([sys.executable,str(root/'scripts/export-atlas-db.py'),str(p)],check=True,capture_output=True);db=sqlite3.connect(p);db.execute('PRAGMA foreign_keys=ON')
 assert db.execute('SELECT count(*) FROM specimen').fetchone()[0]==len(a['specimens'])
 assert not db.execute('PRAGMA foreign_key_check').fetchall()
 assert db.execute("SELECT count(*) FROM coverage_record WHERE status='image_imported'").fetchone()[0]==14
 # A comparison link must not create a same-specimen equivalence.
 assert db.execute("SELECT relation FROM specimen_external_record s JOIN external_record e ON e.id=s.external_record_id WHERE specimen_id='cng611-576' AND e.url LIKE '%photo=81165'").fetchone()[0]=='comparison'
 # Reject physically invalid measurements and invalid relation types.
 for sql in ["UPDATE specimen SET weight_g=-1 WHERE id='cng611-576'","UPDATE type_level SET level='image' WHERE type_id='lady-nana'","UPDATE dating_claim SET end_year=1 WHERE type_id='lady-nana'"]:
  try:db.execute(sql)
  except sqlite3.IntegrityError:db.rollback()
  else:raise AssertionError('Invalid data accepted: '+sql)
 # Multiple photographs and external sources do not inflate the specimen count.
 assert db.execute("SELECT count(*) FROM image WHERE specimen_id='cng611-576'").fetchone()[0]==2
print('PASS: scoped 14/14 image coverage, image dimensions, duplicate semantics, catalogue hierarchy, date/measurement constraints, foreign keys and geographic evidence separation.')
