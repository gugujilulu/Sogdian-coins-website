"""Validate display data, scoped source coverage, and relational invariants."""
import json
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

root=Path(__file__).resolve().parents[1]
a=json.loads((root/'public/data/atlas.json').read_text())
z=json.loads((root/'research/zeno/manifest-3106.json').read_text())
families={f['id'] for f in a['families']}
variants={v['id']:v for v in a['variants']}
places={p['id'] for p in a['places']}
ids=[s['id'] for s in a['specimens']]
assert len(ids)==len(set(ids))
assert len(families)==len(a['families'])

# Lady Nana remains one explicitly scoped, fully imported leaf category.
expected_nana={'388312','334987','264408','264184','227845','182898','130578','81165','77712','57887','54032','54031','29609','30750'}
manifest_nana={str(r['id']) for r in z['records']}
assert manifest_nana==expected_nana
nana_zeno={s['id'][5:] for s in a['specimens'] if s['familyId']=='lady-nana' and s['id'].startswith('zeno-')}
assert nana_zeno==expected_nana
assert a['coverage']['zenoRecordCount']==14
assert a['coverage']['importedZenoRecords']==14
assert a['coverage']['images']==22  # Nana only; whole-site image totals are computed separately.
assert all((r.get('uploader') or {}).get('name') for r in z['records'])

# Saved Zeno manifests are independent coverage scopes. Partial Semirechye crawls are
# valid research states, while their counts must never be labelled complete by accident.
coverage_rows={str(r['categoryId']):r for r in a.get('scopeCensus',[])}
manifest_paths=sorted((root/'research/zeno').glob('manifest-*.json'))
for manifest_path in manifest_paths:
 m=json.loads(manifest_path.read_text())
 category=str(m.get('categoryId') or manifest_path.stem.split('-',1)[-1])
 record_ids=[str(x) for x in (m.get('recordIds') or [r['id'] for r in m.get('records',[]) if r.get('id')])]
 assert len(record_ids)==len(set(record_ids)),f'duplicate observed record IDs in {manifest_path.name}'
 assert m.get('recordCount',len(record_ids))==len(record_ids),f'recordCount mismatch in {manifest_path.name}'
 detail_ids=[str(r['id']) for r in m.get('records',[]) if r.get('id')]
 assert set(detail_ids).issubset(set(record_ids)),f'detail record outside observed IDs in {manifest_path.name}'
 expected=m.get('sourceReportedCount')
 if expected is None and category in coverage_rows:expected=coverage_rows[category].get('sourcePhotoCount')
 status=m.get('coverageStatus')
 if status=='observed_count_matches_source_count':
  assert expected is not None and len(record_ids)==expected
 if status=='incomplete_observed_links':
  assert expected is not None and len(record_ids)<expected
 pagination=m.get('pagination',{})
 if pagination.get('integrity')=='failed_repeated_page_content':
  assert pagination.get('repeatedPages'),f'pagination failure without repeated-page evidence in {manifest_path.name}'

for s in a['specimens']:
 assert s['familyId'] in families
 if s['variantId']:
  assert variants[s['variantId']]['familyId']==s['familyId']
 assert any(x['relation']=='same_specimen' for x in s['sources'])
 for im in s['images']:
  p=root/'public'/im['path'].lstrip('/')
  image=Image.open(p)
  assert image.size==(im['width'],im['height'])
  assert '/avatars/' not in im['sourceUrl']
  assert p.stat().st_size>1000
  assert im['rightsStatus'] in {'open_license','permission','public_domain','unverified'}
  assert 'credit' in im and im['credit']

# Zeno uploader attribution flows into the display image record, while the full
# member/profile object and raw source-rights marker remain preserved in manifest.
for r in z['records']:
 s=next(s for s in a['specimens'] if s['id']=='zeno-'+str(r['id']))
 im=next(im for im in s['images'] if im['path']==r['image']['path'])
 assert im['credit']==r['uploader']['name']
 assert im['rightsStatus']=='unverified'
 assert im['rightsSourceUrl']==r['rights']['sourceTermsUrl']

# Explicitly identified repeated specimen is merged; comparison records remain independent.
assert 'bactrianumis-5898' not in ids
merged=next(s for s in a['specimens'] if s['id']=='zeno-264408')
assert any('bactrianumis.com' in x['url'] for x in merged['sources'])
assert 'cng611-576' in ids and 'zeno-81165' in ids
assert next(s for s in a['specimens'] if s['id']=='zeno-334987')['diameterMm'] is None  # source unit anomaly

for f in a['families']:
 if f['anchor']:assert f['anchor']['placeId'] in places
 assert f['start'] is None or f['start']<=f['end']
for x in a['areas']:
 assert x['source'] and x['note'] and x['kind'] in ['documented_circulation','inferred_distribution','geographic_context']
# Northern Afghanistan report has no exact point; don't silently turn it into Balkh.
assert not any(e['familyId']=='lady-nana' and e['placeId']=='balkh' for e in a['evidence'])

with tempfile.TemporaryDirectory() as tmp:
 p=Path(tmp)/'atlas.sqlite'
 subprocess.run([sys.executable,str(root/'scripts/export-atlas-db.py'),str(p)],check=True,capture_output=True)
 db=sqlite3.connect(p)
 db.execute('PRAGMA foreign_keys=ON')
 assert db.execute('SELECT count(*) FROM specimen').fetchone()[0]==len(a['specimens'])
 assert db.execute('SELECT count(*) FROM image').fetchone()[0]==sum(len(s['images']) for s in a['specimens'])==34
 assert not db.execute('PRAGMA foreign_key_check').fetchall()
 # Nana coverage remains independently verifiable even after other categories are added.
 nana_snapshot=db.execute("SELECT id FROM coverage_snapshot WHERE category_url LIKE '%cat=3106'").fetchone()[0]
 assert db.execute("SELECT count(*) FROM coverage_record WHERE snapshot_id=? AND status='image_imported'",(nana_snapshot,)).fetchone()[0]==14
 # The display coverage's 22-image Lady Nana scope is independently derivable
 # from the relational type hierarchy; it is not conflated with 14 Zeno records.
 nana_images=db.execute("""
 WITH RECURSIVE nana_types(id) AS (
   SELECT 'lady-nana'
   UNION ALL
   SELECT c.id FROM coin_type c JOIN nana_types p ON c.parent_type_id=p.id
 )
 SELECT count(DISTINCT i.id)
 FROM specimen_type_claim stc
 JOIN nana_types nt ON nt.id=stc.type_id
 JOIN image i ON i.specimen_id=stc.specimen_id
 """).fetchone()[0]
 assert nana_images==a['coverage']['images']==22
 z388=db.execute("SELECT credit,rights_status,license_uri,rights_source_url FROM image WHERE id='z388312'").fetchone()
 assert z388==('Numis_Dmitriy','unverified',None,'https://www.zeno.ru/rules.php')
 assert db.execute('SELECT count(*) FROM coverage_snapshot').fetchone()[0]==len(manifest_paths)
 # A comparison link must not create a same-specimen equivalence.
 assert db.execute("SELECT relation FROM specimen_external_record s JOIN external_record e ON e.id=s.external_record_id WHERE specimen_id='cng611-576' AND e.url LIKE '%photo=81165'").fetchone()[0]=='comparison'
 # Reject physically invalid measurements and invalid relation/types.
 for sql in [
  "UPDATE specimen SET weight_g=-1 WHERE id='cng611-576'",
  "UPDATE type_level SET level='image' WHERE type_id='lady-nana'",
  "UPDATE dating_claim SET end_year=1 WHERE type_id='lady-nana'",
 ]:
  try:db.execute(sql)
  except sqlite3.IntegrityError:db.rollback()
  else:raise AssertionError('Invalid data accepted: '+sql)
 # Multiple photographs and external sources do not inflate the specimen count.
 assert db.execute("SELECT count(*) FROM image WHERE specimen_id='cng611-576'").fetchone()[0]==2

whole_images=sum(len(s['images']) for s in a['specimens'])
print(f'PASS: Nana 14/14 Zeno coverage and 22 images remain scoped; {len(manifest_paths)} Zeno manifest(s) checked; {len(a["specimens"])} specimen records / {whole_images} whole-site images; duplicate, hierarchy, date/measurement, FK and geography invariants hold.')
