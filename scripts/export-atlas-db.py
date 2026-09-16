"""Build a reviewable relational research database from the current Atlas export.
Usage: python scripts/export-atlas-db.py /absolute/path/atlas.sqlite
"""
from pathlib import Path
import json,sqlite3,sys,hashlib
root=Path(__file__).resolve().parents[1];out=Path(sys.argv[1]);assert not out.exists(),'Refusing to overwrite existing database'
d=json.loads((root/'public/data/atlas.json').read_text());db=sqlite3.connect(out);db.executescript((root/'db/schema.sql').read_text())
def add(table,**row):
 db.execute('INSERT INTO '+table+' ('+','.join(row)+') VALUES ('+','.join('?' for _ in row)+')',tuple(row.values()))
def key(url):return hashlib.sha256(url.encode()).hexdigest()[:16]
seen=set()
def cite(url,title=None):
 id=key(url)
 if id not in seen:
  add('publication',id=id,title=title or url,publication_kind='web_record',url=url,accessed_on='2026-09-16',verification_status='partly_read');add('citation',id='c-'+id,publication_id=id);seen.add(id)
 return 'c-'+id
add('corpus',id='square-hole',title='Sogdian-related square-holed coinage',scope_note='Semirechye core; related Sogdian, Tokharistan and Xinjiang series. Current import is incomplete.')
for p in d['places']:
 add('place',id=p['id'],historical_name=p['name'],modern_name=p['zh'],kind=p['kind'])
 add('place_geometry',id='geo-'+p['id'],place_id=p['id'],geometry_geojson=json.dumps({'type':'Point','coordinates':p['coordinates']}),label_lat=p['coordinates'][1],label_lon=p['coordinates'][0],precision='approximate_site',confidence='unassessed',citation_id=cite(p['source']),note=p['precision']+'; '+p['note'])
for f in d['families']:
 add('coin_type',id=f['id'],corpus_id='square-hole',title=f['title'],aperture='square',classification_status='catalogue_linked' if f['id']=='lady-nana' else 'candidate',exploration_reason=f['question'],created_on='2026-09-16',updated_on='2026-09-16')
 add('type_level',type_id=f['id'],level='family',note='Editorial browsing family. No count of definitive major types implied.')
 for p in f['publications']:add('type_publication',type_id=f['id'],citation_id=cite(p['url'],p['title']),role='background')
 dc=cite(f['publications'][0]['url']);add('dating_claim',id='date-'+f['id'],type_id=f['id'],start_year=f['start'],end_year=f['end'],display_text=f['dateLabel'],interval_semantics='century_normalization' if f['id']=='lady-nana' else 'issue_range' if f['start'] is not None else 'unknown',precision='range' if f['start'] is not None else 'unknown',confidence='unassessed',citation_id=dc,is_preferred=1)
 if f['anchor']:
  p=next(p for p in d['places'] if p['id']==f['anchor']['placeId'])
  add('display_anchor',type_id=f['id'],place_id=p['id'],role='attributed_city' if f['id']=='lady-nana' else 'regional_orientation',citation_id=cite(p['source']),editorial_note=f['anchor']['note'])
for v in d['variants']:
 add('coin_type',id=v['id'],corpus_id='square-hole',title=v['title'],parent_type_id=v['familyId'],aperture='square',classification_status='catalogue_linked',created_on='2026-09-16',updated_on='2026-09-16')
 add('type_level',type_id=v['id'],level='source_reference_group',note=v['description'])
for s in d['specimens']:
 ci=cite(s['sources'][0]['url'],s['sources'][0]['label'])
 add('specimen',id=s['id'],title=s['title'],material_text='Copper alloy / AE, source wording',weight_g=s['weightG'],diameter_mm=s['diameterMm'],citation_id=ci,observed_on='2026-09-16')
 add('specimen_type_claim',id='type-'+s['id'],specimen_id=s['id'],type_id=s['variantId'] or s['familyId'],citation_id=ci,confidence='possible',is_preferred=1,note='Source reference group; cross-catalogue equivalence is not asserted.')
 for im in s['images']:
  add('image',id=im['id'],specimen_id=s['id'],view='both' if im['view']!='single face' else 'unknown',local_path=im['path'],source_url=im['sourceUrl'],credit=im['credit'],rights_status='unverified',width_px=im['width'],height_px=im['height'],citation_id=ci)
 for src in s['sources']:
  url=src['url'];eid='ext-'+key(url)
  if not db.execute('SELECT 1 FROM external_record WHERE id=?',(eid,)).fetchone():add('external_record',id=eid,provider='Zeno' if 'zeno.ru' in url else 'external',record_key=url,url=url,record_kind='specimen',verification_status='directly_checked' if src['relation']=='same_specimen' else 'reported_by_source',checked_on='2026-09-16',citation_id=cite(url,src['label']))
  add('specimen_external_record',specimen_id=s['id'],external_record_id=eid,relation=src['relation'])
 for feature in s['facets']:add('specimen_feature',specimen_id=s['id'],label=feature,citation_id=ci)
add('coverage_snapshot',id='zeno3106-20260916',provider='Zeno',category_url=d['coverage']['categoryUrl'],retrieved_on=d['coverage']['date'],expected_record_count=d['coverage']['zenoRecordCount'],scope_note=d['coverage']['scope'])
manifest=json.loads((root/'research/zeno/manifest-3106.json').read_text())
for r in manifest['records']:
 s=next((s for s in d['specimens'] if s['id']=='zeno-'+r['id']),None)
 add('coverage_record',snapshot_id='zeno3106-20260916',source_record_key=r['id'],specimen_id=s['id'] if s else None,image_id=s['images'][0]['id'] if s else None,status='image_imported' if s else 'pending')
assert not db.execute('PRAGMA foreign_key_check').fetchall();db.commit();print('Relational export:',out,';',len(d['specimens']),'specimen records')
