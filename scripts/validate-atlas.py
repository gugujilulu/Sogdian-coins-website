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
z795=json.loads((root/'research/zeno/manifest-795.json').read_text())
r795=json.loads((root/'research/zeno/review-795.json').read_text())
z503=json.loads((root/'research/zeno/manifest-503.json').read_text())
r503=json.loads((root/'research/zeno/review-503-stage1.json').read_text())
r5032=json.loads((root/'research/zeno/review-503-stage2.json').read_text())
r5034=json.loads((root/'research/zeno/review-503-stage4.json').read_text())
r5035=json.loads((root/'research/zeno/review-503-stage5.json').read_text())
r5036=json.loads((root/'research/zeno/review-503-stage6.json').read_text())
recovered503=json.loads((root/'research/zeno/recovered-records-503.json').read_text())
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

# Recursive Zeno #795 acquisition is complete as a source snapshot; Atlas import is
# a reviewed subset and must not be conflated with the 254 source records.
assert z795['categoryId']=='795'
assert z795['sourceReportedSubtreeCount']==254
assert z795['recordCount']==254
assert len(z795['records'])==254
assert not z795.get('fetchFailures') and not z795.get('categoryFetchFailures')
assert z795.get('pagination',{}).get('integrity')=='no_repeat_detected'
assert r795['summary']['scopeReviewed']==254
assert r795['summary']['atlasImportedSourceRecords']==239
assert r795['summary']['newSpecimenRecordsExpected']==238
assert r795['summary']['mergedIntoExistingSpecimens']==1
review_ids={str(x['id']) for x in r795['records']}
assert review_ids=={str(x['id']) for x in z795['records']}
imported_795={str(x['id']) for x in r795['records'] if x['atlasImport']}
assert len(imported_795)==239
assert '20696' in imported_795
assert 'zeno-20696' not in ids  # same physical specimen as legacy sr9
sr9=next(s for s in a['specimens'] if s['id']=='sr9')
assert any(src['url'].endswith('photo=20696') and src['relation']=='same_specimen' for src in sr9['sources'])
assert any(im['path']=='/coins/zeno/20696.jpg' for im in sr9['images'])
held_795={str(x['id']) for x in r795['records'] if not x['atlasImport']}
assert len(held_795)==15
assert not any(('zeno-'+rid) in ids for rid in held_795)
assert 'zeno-1766' in ids and 'zeno-1767' in ids  # shared obverse photo is not identity evidence

# Central Asia #503 stage-1 review is conservative: the metadata census is broader
# than the Atlas import, recovered pagination records stay in the same source scope,
# and two records with unresolved/failed target images remain held.
assert z503['categoryId']=='503'
assert len(z503['recordIds'])==3891
assert len(z503['records'])==3891
assert len(recovered503.get('recoveredRecords',[]))==93
assert not ({str(x) for x in z503['recordIds']} & {str(r['id']) for r in recovered503['recoveredRecords']})
assert len({str(x) for x in z503['recordIds']} | {str(r['id']) for r in recovered503['recoveredRecords']})==3984
assert r503['counts']['stage1SourceRecordsSelected']==586
assert r503['counts']['atlasImportRecords']==584
assert r503['counts']['heldRecords']==2
assert r503['counts']['sourceGroups']==45
assert {'142559','302497'}=={str(x['id']) for x in r503['heldRecords']}
assert all(('zeno-'+str(x['id'])) in ids for x in r503['records'] if x.get('atlasImport'))
assert not any(('zeno-'+str(x['id'])) in ids for x in r503['heldRecords'])
# #796 is imported into the existing disputed sr21 family without canonicalizing
# the Western Liao attribution.
assert sum(1 for x in r503['records'] if x['leafCategoryId']=='796' and x['familyId']=='sr21')==58
sr21f=next(f for f in a['families'] if f['id']=='sr21')
assert 'legacy proto-Qarakhanid' in sr21f['title']
assert 'Western Liao' in sr21f['description']

# Stage-2 resolves a bounded set of previously downloaded target images at
# record level. Only visually/source-confirmed Chinese-style square-hole forms
# enter the main corpus; circular/special apertures remain related/held.
assert r5032['counts']['sourceRecordsReviewed']==91
assert r5032['counts']['atlasImportRecords']==80
assert r5032['counts']['heldRelatedRecords']==11
assert r5032['counts']['newFamilies']==3
assert r5032['counts']['sourceGroups']==16
assert all(('zeno-'+str(x['id'])) in ids for x in r5032['records'] if x.get('atlasImport'))
assert not any(('zeno-'+str(x['id'])) in ids for x in r5032['heldRecords'])
assert sum(1 for x in r5032['records'] if x['leafCategoryId']=='14905' and x['familyId']=='sr9')==10
assert sum(1 for x in r5032['records'] if x['leafCategoryId']=='15156' and x['familyId']=='ferghana-anon-khagan')==10
assert {f['id'] for f in a['families']} >= {'yarug-kadin','general-ir-chor-irti','semirechye-chinese-imitation'}
assert {str(x['id']) for x in r5032['heldRecords']}=={'375693','377305','306552','326586','146052','293374','115509','232909','284607','697','350958'}


# Stage-4 resolves a large bounded block of the remaining downloaded-image queue.
assert r5034['counts']['sourceRecordsReviewed']==239
assert r5034['counts']['atlasImportRecords']==34
assert r5034['counts']['relatedOutsideMainCorpus']==205
assert r5034['counts']['newFamilies']==3
assert r5034['counts']['pendingImagesRemaining']==185
assert all(('zeno-'+str(x['id'])) in ids for x in r5034['records'] if x.get('atlasImport'))
assert not any(('zeno-'+str(x['id'])) in ids for x in r5034['relatedRecords'])
assert {f['id'] for f in a['families']} >= {'semirechye-runic-sh-gamma','vakhsh-cross-tamgha-cash','ferghana-two-tamgha-cash'}
assert sum(1 for x in r5034['records'] if x['leafCategoryId'] in {'20647','20648','20649'} and x['familyId']=='paykand-square-hole')==7


# Stage-5 resolves another bounded clear block from the remaining queue.
assert r5035['counts']['sourceRecordsReviewed']==87
assert r5035['counts']['atlasImportRecords']==16
assert r5035['counts']['relatedOutsideMainCorpus']==71
assert r5035['counts']['newFamilies']==4
assert r5035['counts']['pendingImagesRemaining']==98
assert all(('zeno-'+str(x['id'])) in ids for x in r5035['records'])
assert not any(('zeno-'+str(x['id'])) in ids for x in r5035['relatedRecords'])
assert {f['id'] for f in a['families']} >= {'fansar-pargar-square-hole','samarkand-unlisted-square-hole','termez-cash-like','badakhshan-kaiyuan-arabic'}


# Stage-6 resolves the entire remaining downloaded-image queue.
assert r5036['counts']['sourceRecordsReviewed']==98
assert r5036['counts']['atlasImportRecords']==25
assert r5036['counts']['relatedOutsideMainCorpus']==73
assert r5036['counts']['newFamilies']==4
assert r5036['counts']['pendingImagesRemaining']==0
assert all(('zeno-'+str(x['id'])) in ids for x in r5036['records'])
assert not any(('zeno-'+str(x['id'])) in ids for x in r5036['relatedRecords'])
assert {f['id'] for f in a['families']} >= {'uncertain-central-asian-square-hole','nwr-pry-square-hole','semirechye-unattributed-cash','ferghana-chach-anepigraphic-cash'}

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

# Product provenance invariants: source identity/classification is additive and
# related/held material remains visible without inflating the main specimen count.
assert len(a.get('relatedRecords',[]))==701
assert all(r.get('sourceRecordId') and r.get('sourceUrl') and r.get('reviewStatus') for r in a['relatedRecords'])
assert len({r['id'] for r in a['relatedRecords']})==len(a['relatedRecords'])
assert all(s.get('sourceRecordId') for s in a['specimens'])
assert all(isinstance(s.get('sourcePath',[]),list) for s in a['specimens'])
# Preserve the concrete source-record and image-source set already acquired. New
# sources may be added freely; removals require an explicit baseline update.
floor=json.loads((root/'research/source-preservation-floor.json').read_text())
current_record_ids={s['sourceRecordId'] for s in a['specimens'] if s.get('sourceRecordId')}|{r['sourceRecordId'] for r in a['relatedRecords'] if r.get('sourceRecordId')}
current_source_urls={x['url'] for s in a['specimens'] for x in s.get('sources',[]) if x.get('url')}|{r['sourceUrl'] for r in a['relatedRecords'] if r.get('sourceUrl')}
current_image_urls={im['sourceUrl'] for s in a['specimens'] for im in s.get('images',[]) if im.get('sourceUrl')}
assert set(floor['sourceRecordIds']).issubset(current_record_ids),'Previously captured source record ID disappeared'
assert set(floor['sourceUrls']).issubset(current_source_urls),'Previously captured source URL disappeared'
assert set(floor['imageSourceUrls']).issubset(current_image_urls),'Previously captured image source URL disappeared'

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
  assert '/glyph/' not in im['sourceUrl']
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
 assert db.execute('SELECT count(*) FROM image').fetchone()[0]==sum(len(s['images']) for s in a['specimens'])
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
 assert db.execute("SELECT count(*) FROM external_record WHERE provider='Zeno'").fetchone()[0]>=len(a.get('relatedRecords',[]))
 assert db.execute('SELECT count(*) FROM external_record_classification').fetchone()[0]>=len(a.get('relatedRecords',[]))
 # #795 coverage keeps source acquisition (254) separate from reviewed Atlas import (239).
 s795=db.execute("SELECT id FROM coverage_snapshot WHERE category_url LIKE '%cat=795'").fetchone()[0]
 assert db.execute("SELECT count(*) FROM coverage_record WHERE snapshot_id=?",(s795,)).fetchone()[0]==254
 assert db.execute("SELECT count(*) FROM coverage_record WHERE snapshot_id=? AND status='image_imported'",(s795,)).fetchone()[0]==239
 assert db.execute("SELECT count(*) FROM coverage_record WHERE snapshot_id=? AND status='pending'",(s795,)).fetchone()[0]==15
 # #503 snapshot includes the 3,891 root crawl plus 93 non-overlapping recovered IDs.
 s503=db.execute("SELECT id FROM coverage_snapshot WHERE category_url LIKE '%cat=503'").fetchone()[0]
 assert db.execute("SELECT count(*) FROM coverage_record WHERE snapshot_id=?",(s503,)).fetchone()[0]==3984
 imported503=db.execute("SELECT count(*) FROM coverage_record WHERE snapshot_id=? AND status='image_imported'",(s503,)).fetchone()[0]
 assert imported503>=664  # 584 stage-1 + 80 stage-2, plus earlier linked descendant records.
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
print(f'PASS: {len(a["families"])} families / {len(a["variants"])} source groups / {len(a["specimens"])} main records / {whole_images} images; {len(a.get("relatedRecords",[]))} related-held-excluded source records remain separately traceable; Nana and #795 coverage invariants, source paths, image rights, FK and geography checks hold.')
