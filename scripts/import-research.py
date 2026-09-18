"""Rebuild a local research database from recorded legacy observations.
Run: python scripts/import-research.py /tmp/sogdian-research.sqlite
The output must not exist, to avoid overwriting edited research data.
"""
import json, pathlib, sqlite3, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(sys.argv[1])
if out.exists(): raise SystemExit('Output exists; choose a new output path.')
con=sqlite3.connect(out)
con.executescript((ROOT/'db/schema.sql').read_text())
raw=json.loads((ROOT/'research/source-register.json').read_text())['specimens']
flat={c['id']:c for c in json.loads((ROOT/'public/data/coins.json').read_text())}
def put(table,**values):
    keys=','.join(values); marks=','.join('?' for _ in values)
    con.execute(f'INSERT INTO {table} ({keys}) VALUES ({marks})',tuple(values.values()))
with con:
    put('corpus',id='semirechye-and-neighbours',title='Semirechye and neighbouring square-hole traditions',scope_note='Research candidates; initial legacy records, not a reviewed complete corpus.')
    put('publication',id='iicas2024',title='A Catalogue of Sogdian Coin Legends and Countermarks of Central Asia',authors='Begmatov; Boboyorov; Goyibov; Kulish; Lurje; Naymark',year=2024,publication_kind='book',url='https://iicas.int/book/177',accessed_on='2026-09-16',verification_status='metadata_only')
    put('citation',id='iicas-context',publication_id='iicas2024',note='Background only; no entry-level linkage verified.')
    placeinfo={'Semirechye':('semirechye',43,75),'Eastern Sogdiana':('eastern-sogdiana',39.7,67),'Qiuci / Kucha, Xinjiang':('kucha',41.72,82.96)}
    for label,(pid,lat,lon) in placeinfo.items():
        put('place',id=pid,historical_name=label,kind='region' if pid!='kucha' else 'city')
        put('place_geometry',id=pid+'-display',place_id=pid,label_lat=lat,label_lon=lon,precision='region',confidence='unassessed',note='Editorial display anchor only; not a verified mint or findspot.')
    sourceids={}
    for s in raw:
        sid=s['id'];c=flat[sid];url=s['sourceUrl']
        if url not in sourceids:
            sourceids[url]='source-'+str(len(sourceids)+1)
            put('publication',id=sourceids[url],title='Source catalogue page: '+url,publication_kind='web_catalogue',url=url,accessed_on='2026-09-16',verification_status='partly_read')
        citation='cite-'+sid
        put('citation',id=citation,publication_id=sourceids[url],locator=sid.upper(),note='Web catalogue entry; original cited print publication not inspected.')
        tid='candidate-'+sid;spid='specimen-'+sid
        put('coin_type',id=tid,corpus_id='semirechye-and-neighbours',title=s['title'],aperture='square',classification_status='candidate',exploration_reason=c.get('question'),created_on='2026-09-16',updated_on='2026-09-16')
        put('specimen',id=spid,title=s['title'],collection_name='British Museum' if sid=='dali' else None,inventory_number=s.get('museumNumber'),material_text='copper alloy (source description)',weight_g=s.get('weightG'),diameter_mm=s.get('diameterMm'),citation_id=citation,observed_on='2026-09-16')
        put('specimen_type_claim',id='classification-'+sid,specimen_id=spid,type_id=tid,citation_id=citation,confidence='unassessed',is_preferred=1,note='Provisional alignment with the source entry; not independently classified.')
        put('image',id='image-'+sid,specimen_id=spid,view='unknown' if sid=='dali' else 'both',local_path=c['image'],source_url=s['imageUrl'],credit=s['attribution'],rights_status='unverified',citation_id=citation)
        if s['region'] in placeinfo:
            put('type_place_claim',id='place-'+sid,type_id=tid,place_id=placeinfo[s['region']][0],role='attributed_region',confidence='unassessed',citation_id=citation,is_preferred=1,note='Source attribution; no mint inferred.')
        put('dating_claim',id='date-'+sid,type_id=tid,start_year=c['start'],end_year=c['end'],display_text=c['dateLabel'],interval_semantics='century_normalization' if sid.startswith('sr') and c['start'] else 'issue_range' if c['start'] else 'unknown',precision='year' if sid=='dali' else 'range' if c['start'] else 'unknown',confidence='unassessed',citation_id=citation,is_preferred=1,normalization_note='Original description retained; numeric bounds are display approximations where applicable.')
        put('type_publication',type_id=tid,citation_id=citation,role='specimen_description')
        put('type_publication',type_id=tid,citation_id='iicas-context',role='background')
        if s.get('catalogue'):
            put('type_reference',id='reference-'+sid,type_id=tid,citation_id=citation,reference_number=s['catalogue'],relation='unreviewed')
        if s.get('zenoId'):
            eid='zeno-'+str(s['zenoId'])
            put('external_record',id=eid,provider='Zeno',record_key=str(s['zenoId']),url=s['zenoUrl'],record_kind='specimen',verification_status='reported_by_source',citation_id=citation)
            put('type_external_record',type_id=tid,external_record_id=eid,relation='comparison')
assert con.execute('PRAGMA foreign_key_check').fetchall()==[]
assert con.execute('SELECT count(*) FROM specimen').fetchone()[0]==12
assert con.execute("SELECT count(*) FROM coin_type WHERE classification_status='reviewed'").fetchone()[0]==0
assert con.execute("SELECT count(*) FROM type_place_claim WHERE role='mint'").fetchone()[0]==0
assert con.execute('SELECT count(*) FROM specimen_find_claim').fetchone()[0]==0
# Multiple later specimens can reference one type without duplicating type rows.
con.execute('SAVEPOINT validation')
con.execute("INSERT INTO specimen SELECT 'validation-second',title,collection_name,NULL,material_text,weight_g,diameter_mm,axis_hours,citation_id,observed_on FROM specimen LIMIT 1")
con.execute("INSERT INTO specimen_type_claim VALUES ('validation-link','validation-second','candidate-sr3','cite-sr3','possible',0,'validation only')")
assert con.execute("SELECT count(*) FROM specimen_type_claim WHERE type_id='candidate-sr3'").fetchone()[0]==2
con.execute('ROLLBACK TO validation');con.execute('RELEASE validation')
# One interval intersecting 750; queries operate on type IDs, not image counts.
rows=con.execute('''SELECT DISTINCT t.id,t.title,d.display_text FROM coin_type t JOIN dating_claim d ON d.type_id=t.id WHERE d.is_preferred=1 AND d.start_year<=? AND d.end_year>=?''',(750,750)).fetchall()
print(json.dumps({'specimens':12,'candidate_types':12,'reviewed_types':0,'mint_claims':0,'findspot_claims':0,'year_750_candidates':rows,'foreign_key_errors':0},ensure_ascii=False,indent=2))
con.close()
