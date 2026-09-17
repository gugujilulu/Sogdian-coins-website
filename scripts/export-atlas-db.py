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
def provider_name(url,label=''):
 if 'zeno.ru' in url:return 'Zeno'
 if 'cngcoins.com' in url:return 'CNG'
 if 'numista.com' in url:return 'Numista'
 if 'sogdcoins.' in url:return 'Coins of Central Asia'
 if 'bactrianumis' in url:return 'Bactrianumis'
 if 'sixbid' in url.lower():return 'Sixbid'
 if 'numisbids' in url.lower():return 'NumisBids'
 if 'biddr' in url.lower():return 'Biddr'
 if 'album' in (url+' '+label).lower() or 'sarc' in label.lower():return 'Stephen Album'
 try:
  from urllib.parse import urlparse
  return (urlparse(url).hostname or 'external').removeprefix('www.')
 except Exception:return 'external'
seen=set()
def cite(url,title=None):
 id=key(url)
 if id not in seen:
  add('publication',id=id,title=title or url,publication_kind='web_record',url=url,accessed_on='2026-09-16',verification_status='partly_read');add('citation',id='c-'+id,publication_id=id);seen.add(id)
 return 'c-'+id
add('corpus',id='square-hole',title='Central Asian Square-Hole Coinage Atlas',scope_note='Chinese-style square-hole cash tradition in Central Asia and related eastern inland zones, broadly post-Han through pre-Qing. Exact temporal cutoffs remain provisional; disputed and boundary records are retained. Includes pierced, intentionally unpierced and pseudo-aperture derivatives when source-supported. Current import is incomplete.')
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
  add('image',id=im['id'],specimen_id=s['id'],view='both' if im['view']!='single face' else 'unknown',local_path=im['path'],source_url=im['sourceUrl'],credit=im['credit'],license_uri=None,rights_source_url=im.get('rightsSourceUrl'),rights_status=im.get('rightsStatus','unverified'),width_px=im['width'],height_px=im['height'],citation_id=ci)
 for src in s['sources']:
  url=src['url'];eid='ext-'+key(url);provider=provider_name(url,src.get('label',''))
  record_key=(s.get('sourceRecordId') or url) if provider=='Zeno' and src['relation']=='same_specimen' else url
  if not db.execute('SELECT 1 FROM external_record WHERE id=?',(eid,)).fetchone():add('external_record',id=eid,provider=provider,record_key=record_key,url=url,record_kind='specimen',verification_status='directly_checked' if src['relation']=='same_specimen' else 'reported_by_source',checked_on='2026-09-16',citation_id=cite(url,src['label']))
  if provider=='Zeno' and src['relation']=='same_specimen' and s.get('sourcePath') and not db.execute('SELECT 1 FROM external_record_classification WHERE external_record_id=? AND scheme=?',(eid,'Zeno breadcrumb')).fetchone():
   path=s['sourcePath'];add('external_record_classification',external_record_id=eid,scheme='Zeno breadcrumb',path_json=json.dumps(path,ensure_ascii=False),leaf_key=str(path[-1].get('categoryId') or '') if path else None,leaf_label=path[-1].get('title') if path else None,citation_id=cite(url,src['label']))
  add('specimen_external_record',specimen_id=s['id'],external_record_id=eid,relation=src['relation'])
 for feature in s['facets']:add('specimen_feature',specimen_id=s['id'],label=feature,citation_id=ci)
 if s.get('findContextClaim'):
  fc=s['findContextClaim'];fid='find-'+s['id']
  add('find_context',id=fid,kind='reported_find',place_id=None,description=fc.get('rawText') or fc.get('note') or 'Source-reported find context',citation_id=ci,confidence='unassessed')
  add('specimen_find_claim',specimen_id=s['id'],find_context_id=fid,citation_id=ci,note=(fc.get('place') or '')+'; '+(fc.get('note') or ''))
# Related / held / excluded source records remain first-class external records
# even though they do not contribute to the main specimen count.
for r in d.get('relatedRecords',[]):
 url=r['sourceUrl'];eid='ext-'+key(url);ci=cite(url,r.get('sourceRecordId') or r.get('title'))
 if not db.execute('SELECT 1 FROM external_record WHERE id=?',(eid,)).fetchone():
  add('external_record',id=eid,provider=r.get('sourceName') or 'external',record_key=r.get('sourceRecordId') or url,url=url,record_kind='specimen',verification_status='directly_checked',checked_on='2026-09-16',citation_id=ci)
 if r.get('sourcePath') and not db.execute('SELECT 1 FROM external_record_classification WHERE external_record_id=? AND scheme=?',(eid,'Zeno breadcrumb')).fetchone():
  path=r['sourcePath'];add('external_record_classification',external_record_id=eid,scheme='Zeno breadcrumb',path_json=json.dumps(path,ensure_ascii=False),leaf_key=str(r.get('leafCategoryId') or path[-1].get('categoryId') or ''),leaf_label=r.get('leafCategoryTitle') or path[-1].get('title'),citation_id=ci)

# Every saved Zeno manifest becomes an independently scoped coverage snapshot.
# This keeps Lady Nana 14/14 separate from later Semirechye batches and permits
# partial crawls to be represented without claiming category completeness.
scope_baselines={str(row['categoryId']):row for row in d.get('scopeCensus',[])}
def linked_specimen(record_id):
 direct=next((s for s in d['specimens'] if s['id']=='zeno-'+record_id),None)
 if direct:return direct
 target='showphoto.php?photo='+record_id
 return next((s for s in d['specimens'] if any(target in src['url'] and src.get('relation')=='same_specimen' for src in s['sources'])),None)
for manifest_path in sorted((root/'research/zeno').glob('manifest-*.json')):
 manifest=json.loads(manifest_path.read_text());cat=str(manifest.get('categoryId') or manifest_path.stem.split('-',1)[-1]);date=manifest.get('retrievedOn') or 'unknown'
 snapshot_id='zeno'+cat+'-'+date.replace('-','')
 baseline=scope_baselines.get(cat,{}).get('sourcePhotoCount')
 expected=manifest.get('sourceReportedCount')
 if expected is None:expected=baseline
 if cat=='3106' and expected is None:expected=d['coverage']['zenoRecordCount']
 scope_note=(manifest.get('countSemantics') or 'Observed source records; completeness not asserted.')+' Coverage status: '+manifest.get('coverageStatus','legacy_manifest')+'.'
 add('coverage_snapshot',id=snapshot_id,provider='Zeno',category_url=manifest.get('url') or ('https://www.zeno.ru/showgallery.php?cat='+cat),retrieved_on=date,expected_record_count=expected,scope_note=scope_note)
 record_ids=[str(x) for x in (manifest.get('recordIds') or [str(r['id']) for r in manifest.get('records',[]) if r.get('id')])]
 # #503 has a bounded recovery file for seven scope-relevant pagination gaps.
 # Keep one coverage snapshot and union the recovered source IDs into it rather than
 # inventing a second category snapshot or counting them as new specimens.
 if cat=='503':
  recovered_path=root/'research/zeno/recovered-records-503.json'
  if recovered_path.exists():
   recovered=json.loads(recovered_path.read_text())
   record_ids=list(dict.fromkeys(record_ids+[str(r['id']) for r in recovered.get('recoveredRecords',[]) if r.get('id')]))
   scope_note+=f' Scope-relevant perpage=90 recovery adds {len(recovered.get("recoveredRecords",[]))} non-overlapping source records; remaining non-target repeated-page gaps stay unresolved.'
 for record_id in record_ids:
  record_id=str(record_id);spec=linked_specimen(record_id);image=None
  if spec:image=next((im for im in spec['images'] if im['path']==f'/coins/zeno/{record_id}.jpg'),None)
  status='image_imported' if image else 'specimen_linked_no_image' if spec else 'pending'
  add('coverage_record',snapshot_id=snapshot_id,source_record_key=record_id,specimen_id=spec['id'] if spec else None,image_id=image['id'] if image else None,status=status)
assert not db.execute('PRAGMA foreign_key_check').fetchall();db.commit();print('Relational export:',out,';',len(d['specimens']),'specimen records;',len(list((root/'research/zeno').glob('manifest-*.json'))),'Zeno coverage snapshot(s)')
