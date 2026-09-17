"""Reproducible, source-preserving display export. No web calls; all imports reviewed separately."""
import json,shutil,re,hashlib
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
def read(p):return json.loads((root/p).read_text())
legacy=read('public/data/coins.json');raw={s['id']:s for s in read('research/source-register.json')['specimens']}
a={'families':[],'variants':[],'specimens':[],'places':read('research/places.json'),'evidence':[],'areas':[]}
for c in legacy:
 id=c['id'];p='suyab' if id.startswith('sr') else 'samarkand' if id.startswith('es') else 'kucha' if id=='dali' else None
 f={'id':id,'title':c['name'],'zh':'目录候选类型','region':c['region'],'start':c['start'],'end':c['end'],'dateLabel':c['dateLabel'],'description':c['description'],'anchor':{'placeId':p,'role':'City display anchor · 城市展示锚点','note':'依据地区归属选取的浏览锚点；具体铸地与本类型出土地尚待核定。'} if p else None,'image':c['image'],'status':c['status'],'question':c['question'],'publications':[{'title':c['reference']+' · source catalogue','url':c['source'],'role':'Specimen description / legacy classification'},{'title':'IICAS 2024 Catalogue' if 'iicas' in c['research'] else 'Related numismatic study','url':c['research'],'role':'Background; exact type correspondence not yet verified'}]}
 a['families'].append(f)
 v={'id':id+'-catalogue','familyId':id,'title':c['reference'],'reference':c['reference'],'status':'source_group','facets':[],'description':'来源目录分组；与其他目录的等价关系待核。'};a['variants'].append(v)
 im=Image.open(root/'public'/c['image'].lstrip('/'));r=raw[id]
 a['specimens'].append({'id':id,'familyId':id,'variantId':v['id'],'title':c['name'],'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[{'id':id+'-photo','path':c['image'],'sourceUrl':r.get('imageUrl',c['source']),'width':im.width,'height':im.height,'credit':c['credit'],'rightsStatus':'unverified','rightsSourceUrl':None,'view':c.get('imageView','both')}],'sources':[{'label':'Original catalogue','url':c['source'],'relation':'same_specimen'}]+([{'label':'Zeno '+c['zeno'].split('=')[-1],'url':c['zeno'],'relation':'comparison'}] if c['zeno'] else []),'description':c['description'],'catalogue':c['reference'],'facets':[],'duplicateStatus':'not_exhaustively_checked'})
nana={'id':'lady-nana','title':'Lady Nana of Panch','zh':'潘治的娜娜夫人 · 方孔铜钱','region':'Panch / Samarkand Sogd','start':600,'end':799,'dateLabel':'7th–8th century; often attributed c.709–722 / 728','description':'Square-holed cast bronze with a Sogdian legend and the Panch tamgha. Sources differ in date, face order and the interpretation of Nana. The gallery preserves catalogue groupings and individual specimens.','anchor':{'placeId':'panjakent','role':'Attributed city · 归属城市展示锚点','note':'以古代潘治中心片治肯特展示该类型。此坐标不代表下列每一枚标本的出土地。'},'image':'/coins/nana/cng611-576.jpg','status':'catalogue_linked','question':'“Lady Nana”作为人物、头衔或女神的解释仍需结合铭文及研究；不自动套用 Zeno 的 Divashtich 归属。年代采用来源的宽区间，709–722 是常见归属之一。','legend':"pncy nnδβ’mpnh / pncy nnδβ’npnwh",'legendNote':'CNG 611/576 原文所列不同读法，意译为“潘治的娜娜夫人”。正反面命名因目录而异。','publications':[{'title':'CNG 611/576 · Shagalov Variant 2, 245','url':'https://auctions.cngcoins.com/lots/view/4-LGIJRO/local-issues-panjakent-lady-nana-7th-8th-century-19mm-167-g-3h-cash-type-near-vf','role':'Specimen description and legend reading'},{'title':'Smirnova · General Catalogue of Sogdian Coins: Bronze (1981)','url':'https://sogdcoins.narod.ru/english/sogdiana/e_coins4.html','role':'Legacy online entry cites Smirnova 769; original volume not fully digitised here'},{'title':'Panjikant · Boris Marshak','url':'https://www.iranicaonline.org/articles/panjikant/','role':'Historical / archaeological background; discusses Nana interpretation'},{'title':'IICAS · Catalogue (2024)','url':'https://iicas.int/book/177','role':'Modern academic framework; detailed crosswalk pending'}]}
a['families'].insert(0,nana)
groups=[('sm769','Smirnova 769 / 769 ff.','Source reference group; not yet split by legend layout.'),('sm834','Smirnova 834 / 834 ff.','Catalogue reference group. “ff.” denotes following entries, not one proven variant.'),('sm846','Smirnova 846 ff.','Source catalogue reference group; may overlap broader groups in other sources.'),('sm890','Smirnova 890','Exact number reported by Zeno54031.'),('sm894','Smirnova 894','Exact number reported by Zeno54032.'),('sh245','Shagalov Variant 2 · 245','Variant explicitly cited by CNG. No automatic equivalence with Smirnova numbering.')]
for id,t,n in groups:a['variants'].append({'id':'nana-'+id,'familyId':'lady-nana','title':t,'reference':t,'status':'source_group','facets':[],'description':n})
z=read('research/zeno/manifest-3106.json')
vm={'182898':'sm769','77712':'sm769','29609':'sm834','54031':'sm890','54032':'sm894'}
for r in z['records']:
 if not r.get('image'):continue
 id=r['id'];im=r['image'];ref={'182898':'Smirnova 769 (source title: Type II)','130578':'Smirnova type 3, 834–996 (broad group)','77712':'Smirnova 769','57887':'Smirnova 834–836 comparison','54031':'Smirnova 890','54032':'Smirnova 894','29609':'Smirnova 834'}.get(id,'')
 # 334987 source Size field says 1.8 mm; retain raw value in manifest but do not silently normalize to 18.
 a['specimens'].append({'id':'zeno-'+id,'familyId':'lady-nana','variantId':'nana-'+vm[id] if id in vm else None,'title':'Zeno '+id,'weightG':r.get('weightG'),'diameterMm':None if id=='334987' else r.get('diameterMm'),'images':[{'id':'z'+id,'path':im['path'],'sourceUrl':im['url'],'width':im['width'],'height':im['height'],'credit':im.get('credit') or ((r.get('uploader') or {}).get('name')) or 'Zeno.ru uploader unknown','rightsStatus':'unverified','rightsSourceUrl':im.get('sourceTermsUrl') or (r.get('rights') or {}).get('sourceTermsUrl'),'view':'source photograph'}],'sources':[{'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}],'description':r.get('description') or 'Primary Zeno record; description and classification preserved in the source.','catalogue':ref,'facets':['Panch tamgha · 潘治徽记']+(['Semi-italic legend · 半草书铭文'] if id=='77712' else []),'duplicateStatus':'not_exhaustively_checked'})
non=read('research/nana-source-register.json');out=root/'public/coins/nana';out.mkdir(parents=True,exist_ok=True)
vm={'cng611-576':'sh245','sarc28-145':'sm846','sarc22-55':'sm834','sarc52-1614':'sm846','sogdcoins-es28':'sm769'}
for r in non['records']:
 target=r['id']+'.jpg';image_path='/coins/nana/'+target
 # Assets are copied into the repository before export, so the export is reproducible without scratch paths.
 if not (out/target).exists():raise RuntimeError('Missing asset: '+target)
 zi=next((s for s in a['specimens'] if s['id']=='zeno-'+str(r.get('zeno_id'))),None)
 im=Image.open(out/target);pic={'id':r['id']+'-photo','path':image_path,'sourceUrl':r.get('image_url') or r.get('source_pdf') or r['source_page'],'width':im.width,'height':im.height,'credit':r['source_credit'],'rightsStatus':'unverified','rightsSourceUrl':None,'view':'both as arranged in source'}
 sources=[{'label':r['source_credit'].split(';')[0],'url':r['source_page'],'relation':'same_specimen'}]+[{'label':'Zeno '+str(n),'url':'https://www.zeno.ru/showphoto.php?photo='+str(n),'relation':'comparison'} for n in r['zeno_comparison_references']]+[{'label':'Numista 197126','url':n['source_page'],'relation':'same_specimen'} for n in r.get('duplicate_sources',[])]
 if zi:
  zi['sources']+=sources;zi['duplicateStatus']='same_specimen_explicitly_identified';zi['images'].append(pic);continue
 s={'id':r['id'],'familyId':'lady-nana','variantId':'nana-'+vm[r['id']] if r['id'] in vm else None,'title':r['title'].replace('Lady Nana · ',''),'weightG':r.get('weight_g'),'diameterMm':r.get('diameter_mm'),'images':[pic],'sources':sources,'description':r.get('visual_notes') or r.get('reverse_design') or 'Source specimen.','catalogue':r.get('catalogue_reference') or '', 'facets':['Panch tamgha · 潘治徽记']+(['Semi-italic legend · 半草书铭文'] if r['id']=='sarc28-146' else []),'duplicateStatus':'not_exhaustively_checked'}
 alt=out/(r['id']+'-alternate.jpg')
 if alt.exists():
  ai=Image.open(alt);s['images'].append({**pic,'id':r['id']+'-alternate','path':'/coins/nana/'+alt.name,'width':ai.width,'height':ai.height,'sourceUrl':r['alternate_image']['image_url']})
 a['specimens'].append(s)

# Reviewed Zeno #795 (Turgesh / Runic tamgha) expansion. Raw source records stay
# in the manifest; only records explicitly approved in review-795.json enter Atlas.
review795=read('research/zeno/review-795.json');z795=read('research/zeno/manifest-795.json')
review_by_id={str(r['id']):r for r in review795['records']};z795_by_id={str(r['id']):r for r in z795['records']}
# Reuse stable family IDs rather than creating duplicate families for source branches.
for f in a['families']:
 if f['id']=='sr3':
  f['title']='Vahshutava series';f['zh']='瓦赫什图瓦系列 · 元／prn'
  f['description']='Vahshutava square-hole bronze series. The legacy Kamyshev 21 / Yuan type remains one source group; Zeno #795 also preserves a prn subgroup under the same ruler-level family.'
  f['question']='Kamyshev 21 / Yuan and the Zeno prn subgroup are retained as separate source groups; cross-catalogue equivalence is not assumed.'
 if f['id']=='sr6':
  f['description']='Sogdian Türgesh-qaghan legend with Türgesh tamgha. Zeno #795 source groups preserve standard, degraded, one-sided and additional-sign subseries; the legacy Kamyshev 24 record is one catalogue group, not a label for every imported specimen.'
  f['question']='Imported #795 source groups are not automatically academic variants; catalogue-number crosswalks remain source-specific.'
 if f['id']=='sr9':
  f['title']='Arslan Irkin / legacy Inal-Tegin';f['zh']='阿尔斯兰·伊尔金／旧称 Inal-Tegin'
  f['question']='Legacy sr9 follows Kamyshev 33 / “Inal-Tegin”. Zeno files the same catalogue complex as Arslan Irkin (ex. “Inal Tegin”); the attribution conflict is preserved rather than silently resolved.'
 if f['id']=='sr20':
  f['question']='Zeno #795 separates normal and inverted/retrograde legend source groups and cites Kamyshev 46–48 across records. The legacy chronology remains contested and source-specific.'
new_families=[
 {'id':'alp-tagh','title':'Alp Tagh','zh':'Alp Tagh · 七河方孔钱','region':'Semirechye','start':None,'end':None,'dateLabel':'Undated in imported Zeno source; Türgesh/Semirechye source classification','description':'Source branch names Alp Tagh and gives the Sogdian ruler legend; the imported record carries a Türgesh tamgha, runic sign and Chinese 元. Broader chronology remains pending.','anchor':{'placeId':'suyab','role':'Regional orientation · 区域浏览锚点','note':'以七河核心区作浏览锚点；不表示本类型铸地或出土地。'},'image':'/coins/zeno/209687.jpg','status':'source_linked','question':'Only the reviewed Zeno #795 source branch is linked so far; independent catalogue crosswalk and chronology remain pending.','publications':[{'title':'Zeno #795 · Alp Tagh source branch','url':'https://www.zeno.ru/showgallery.php?cat=18902','role':'Source classification / specimen branch'},{'title':'IICAS 2024 Catalogue','url':'https://iicas.int/book/177','role':'Modern academic framework; exact crosswalk pending'}]},
 {'id':'arslan-kul-irkin','title':'Arslan Kul Irkin','zh':'Arslan Kul Irkin · 七河方孔钱','region':'Semirechye','start':700,'end':799,'dateLabel':'8th century; some imported source records specify early / first half of the 8th century','description':'Arslan Kul Irkin square-hole bronze series. Zeno #795 records include Kamyshev 45 examples and preserve normal source-level variation without treating the category as one proven die/variant.','anchor':{'placeId':'suyab','role':'Regional orientation · 区域浏览锚点','note':'以七河核心区作浏览锚点；不表示本类型铸地或出土地。'},'image':'/coins/zeno/121668.jpg','status':'source_linked','question':'Date wording and Kamyshev numbering are retained from individual sources; broader cross-catalogue adjudication remains pending.','publications':[{'title':'Zeno #795 · Arslan Kul Irkin source branch','url':'https://www.zeno.ru/showgallery.php?cat=14863','role':'Source classification / specimen branch'},{'title':'IICAS 2024 Catalogue','url':'https://iicas.int/book/177','role':'Modern academic framework; exact crosswalk pending'}]},
]
for f in new_families:
 if not any(x['id']==f['id'] for x in a['families']):a['families'].append(f)
for g in review795['sourceGroups']:
 if not any(v['id']==g['id'] for v in a['variants']):
  a['variants'].append({'id':g['id'],'familyId':g['familyId'],'title':g['title'],'reference':'Zeno category '+g['categoryId'],'status':'source_group','facets':[],'description':g['description']})
def zeno795_image(r):
 im=r['image'];return {'id':'z'+str(r['id']),'path':im['path'],'sourceUrl':im['url'],'width':im['width'],'height':im['height'],'credit':im.get('credit') or ((r.get('uploader') or {}).get('name')) or 'Zeno.ru uploader unknown','rightsStatus':'unverified','rightsSourceUrl':im.get('sourceTermsUrl') or (r.get('rights') or {}).get('sourceTermsUrl'),'view':'source photograph'}
for decision in review795['records']:
 if not decision.get('atlasImport'):continue
 id=str(decision['id']);r=z795_by_id[id];source={'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'};pic=zeno795_image(r)
 merged_id=decision.get('mergeIntoSpecimen')
 if merged_id:
  target=next(s for s in a['specimens'] if s['id']==merged_id)
  target['sources'].append(source);target['images'].append(pic);target['duplicateStatus']='same_specimen_explicitly_identified'
  target['facets'].append('Zeno source group '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'])
  continue
 title=r['title'];prefix='#'+id+' - '
 if title.startswith(prefix):title=title[len(prefix):]
 facets=['Zeno source group '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle']]
 a['specimens'].append({'id':'zeno-'+id,'familyId':decision['familyId'],'variantId':decision['sourceGroupId'],'title':title,'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[pic],'sources':[source],'description':r.get('description') or r.get('photoNote') or 'Primary Zeno record; description and source grouping preserved.','catalogue':'Zeno category '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'facets':facets,'duplicateStatus':'source_record_not_proven_unique'})


# Conservative Central Asia #503 stage-1 expansion. This review imports only records
# whose source taxonomy and/or downloaded-image audit clearly supports the project's
# Chinese-style square-hole cash-tradition scope. Mixed visual groups remain pending.
review503=read('research/zeno/review-503-stage1.json')
z503=read('research/zeno/manifest-503.json')
z503_recovered=read('research/zeno/recovered-records-503.json')
repair503=read('research/zeno/image-repair-run-503.json')
repair503_by_id={str(r['id']):r for r in repair503.get('successful',[]) if r.get('id')}
z503_by_id={str(r['id']):r for r in z503['records']}
z503_by_id.update({str(r['id']):r for r in z503_recovered.get('recoveredRecords',[])})
# Broaden the old single-record Tukhus label without erasing its legacy catalogue identity.
for f in a['families']:
 if f['id']=='sr14':
  f['title']='Ex. “Tukhus” complex / legacy Master of Tukhuses';f['zh']='“Tukhus” 系列／旧目录 Master of Tukhuses'
  f['description']='Reviewed #503 records expand the legacy Kamyshev 39 specimen into the broader Zeno “Ex. Tukhus” source complex. Oghitmish/Bitmish and source Type 1–3 groupings remain source-level classifications pending academic crosswalk.'
  f['question']='The historical identity and equivalence of “Tukhus”, Oghitmish/Bitmish and legacy catalogue groups remain under review; source labels are preserved rather than collapsed.'
 if f['id']=='sr21':
  f['title']='Malik Aram Yinal Qaraj / legacy proto-Qarakhanid cash';f['zh']='Malik Aram Yinal Qaraj／旧称 proto-Qarakhanid 方孔钱'
  f['description']='Arabic/Kufic square-hole cash preserved as a disputed family. Zeno #796 attributes the series to the time of Yelü Dashi / Western Liao (1124–1144), while legacy proto-Qarakhanid, Karluk transitional and uncertain Central Asian attributions remain explicit competing claims.'
  f['dateLabel']='Disputed: legacy 9th–10th c.; Western Liao/Yelü Dashi reattribution c.1124–1144'
  f['question']='Do not collapse the competing attributions: legacy proto-Qarakhanid, Karluk transitional, Western Liao / Yelü Dashi, and uncertain Central Asian remain reviewable alternatives.'
existing_family_ids={f['id'] for f in a['families']}
family_decisions={f['id']:f for f in review503['families']}
records_by_family={}
for d in review503['records']:records_by_family.setdefault(d['familyId'],[]).append(d)
for fd in review503['families']:
 if fd['id'] in existing_family_ids:continue
 ds=records_by_family.get(fd['id'],[])
 image=ds[0]['image']['path'] if ds else None
 sg=next((g for g in review503['sourceGroups'] if g['familyId']==fd['id']),None)
 anchor={'placeId':fd['anchorPlaceId'],'role':'Regional/city orientation · 区域／城市浏览锚点','note':'用于地图浏览；不自动表示铸币地、出土地或流通范围。'} if fd.get('anchorPlaceId') else None
 pubs=[]
 if sg:pubs.append({'title':'Zeno category '+sg['categoryId']+' · '+sg['title'],'url':'https://www.zeno.ru/showgallery.php?cat='+sg['categoryId'],'role':'Source taxonomy / specimen records'})
 pubs.append({'title':'Central Asian square-hole scope / academic crosswalk pending','url':'https://iicas.int/book/177','role':'Modern academic framework; exact family-level correspondence remains under review'})
 a['families'].append({'id':fd['id'],'title':fd['title'],'zh':fd['zh'],'region':fd['region'],'start':fd.get('start'),'end':fd.get('end'),'dateLabel':fd.get('dateLabel') or 'Chronology pending','description':fd['description'],'anchor':anchor,'image':image,'status':fd['status'],'question':fd['question'],'publications':pubs})
 existing_family_ids.add(fd['id'])
for g in review503['sourceGroups']:
 if not any(v['id']==g['id'] for v in a['variants']):
  a['variants'].append({'id':g['id'],'familyId':g['familyId'],'title':g['title'],'reference':'Zeno category '+g['categoryId'],'status':'source_group','facets':[],'description':g['description']})
existing_specimen_ids={s['id'] for s in a['specimens']}
for decision in review503['records']:
 if not decision.get('atlasImport'):continue
 id=str(decision['id']);sid='zeno-'+id
 if sid in existing_specimen_ids:continue
 r=z503_by_id[id];im=decision['image'];u=r.get('uploader') or {};rights=r.get('rights') or {}
 title=r.get('title') or ('Zeno '+id);prefix='#'+id+' - '
 if title.startswith(prefix):title=title[len(prefix):]
 pic={'id':'z'+id,'path':im['path'],'sourceUrl':(repair503_by_id.get(id) or {}).get('url') or r.get('originalImageUrl') or r.get('url'),'width':im['width'],'height':im['height'],'credit':u.get('name') or 'Zeno.ru uploader unknown','rightsStatus':('unverified' if (rights.get('status') or 'unverified') not in {'open_license','permission','public_domain','unverified'} else (rights.get('status') or 'unverified')),'rightsSourceUrl':rights.get('sourceTermsUrl'),'view':'source photograph','sha256':im.get('sha256')}
 source={'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}
 a['specimens'].append({'id':sid,'familyId':decision['familyId'],'variantId':decision['sourceGroupId'],'title':title,'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[pic],'sources':[source],'description':r.get('photoNote') or r.get('description') or 'Primary Zeno source record; source taxonomy preserved.','catalogue':'Zeno category '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'facets':['Zeno source group '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'#503 stage-1 scope reviewed'],'duplicateStatus':decision.get('duplicateStatus','source_record_not_proven_unique')})
 existing_specimen_ids.add(sid)


# Central Asia #503 stage-2 record-level visual review. This pass adds only
# records whose individual image and source taxonomy both support the project's
# Chinese-style square-hole cash-tradition scope. Circular/special apertures
# reviewed in the same source groups remain related/held, outside the main count.
review5032=read('research/zeno/review-503-stage2.json')
for f in a['families']:
 if f['id']=='sr9':
  f['description']=(f.get('description') or '')+' Zeno category 14905 adds ten source records explicitly filed as Inal Tegin; this source crosswalk does not resolve the Arslan Irkin / Inal-Tegin attribution conflict.'
 if f['id']=='ferghana-anon-khagan':
  f['description']=(f.get('description') or '')+' Zeno category 15156 adds ten visually confirmed square-hole source records under the anonymous khaqan source taxonomy.'
existing_family_ids={f['id'] for f in a['families']}
records2_by_family={}
for d in review5032['records']:records2_by_family.setdefault(d['familyId'],[]).append(d)
for fd in review5032['families']:
 if fd['id'] in existing_family_ids:continue
 ds=records2_by_family.get(fd['id'],[])
 image=ds[0]['image']['path'] if ds else None
 sg=next((g for g in review5032['sourceGroups'] if g['familyId']==fd['id']),None)
 anchor={'placeId':fd['anchorPlaceId'],'role':'Regional/city orientation · 区域／城市浏览锚点','note':'用于地图浏览；不自动表示铸币地、出土地或流通范围。'} if fd.get('anchorPlaceId') else None
 pubs=[]
 if sg:pubs.append({'title':'Zeno category '+sg['categoryId']+' · '+sg['title'],'url':'https://www.zeno.ru/showgallery.php?cat='+sg['categoryId'],'role':'Source taxonomy / reviewed specimen records'})
 pubs.append({'title':'Central Asian square-hole scope / academic crosswalk pending','url':'https://iicas.int/book/177','role':'Modern academic framework; exact attribution remains under review'})
 a['families'].append({'id':fd['id'],'title':fd['title'],'zh':fd['zh'],'region':fd['region'],'start':fd.get('start'),'end':fd.get('end'),'dateLabel':fd.get('dateLabel') or 'Chronology pending','description':fd['description'],'anchor':anchor,'image':image,'status':fd['status'],'question':fd['question'],'publications':pubs})
 existing_family_ids.add(fd['id'])
for g in review5032['sourceGroups']:
 if not any(v['id']==g['id'] for v in a['variants']):
  a['variants'].append({'id':g['id'],'familyId':g['familyId'],'title':g['title'],'reference':'Zeno category '+g['categoryId'],'status':'source_group','facets':[],'description':g['description']})
existing_specimen_ids={s['id'] for s in a['specimens']}
for decision in review5032['records']:
 if not decision.get('atlasImport'):continue
 id=str(decision['id']);sid='zeno-'+id
 if sid in existing_specimen_ids:continue
 r=z503_by_id[id];im=decision['image'];u=r.get('uploader') or {};rights=r.get('rights') or {}
 title=r.get('title') or ('Zeno '+id);prefix='#'+id+' - '
 if title.startswith(prefix):title=title[len(prefix):]
 pic={'id':'z'+id,'path':im['path'],'sourceUrl':(repair503_by_id.get(id) or {}).get('url') or r.get('originalImageUrl') or r.get('url'),'width':im['width'],'height':im['height'],'credit':u.get('name') or 'Zeno.ru uploader unknown','rightsStatus':('unverified' if (rights.get('status') or 'unverified') not in {'open_license','permission','public_domain','unverified'} else (rights.get('status') or 'unverified')),'rightsSourceUrl':rights.get('sourceTermsUrl'),'view':'source photograph','sha256':im.get('sha256')}
 source={'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}
 a['specimens'].append({'id':sid,'familyId':decision['familyId'],'variantId':decision['sourceGroupId'],'title':title,'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[pic],'sources':[source],'description':r.get('photoNote') or r.get('description') or 'Primary Zeno source record; source taxonomy preserved.','catalogue':'Zeno category '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'facets':['Zeno source group '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'#503 stage-2 record-level visual review'],'duplicateStatus':decision.get('duplicateStatus','source_record_not_proven_unique')})
 existing_specimen_ids.add(sid)


# Central Asia #503 stage-3: prune large false-positive regional coin groups
# from the unresolved image queue and import the explicit Kanka Kaiyuan site-find
# as an imported-coin occurrence. Related solid local coinage remains outside main count.
review5033=read('research/zeno/review-503-stage3.json')
existing_family_ids={f['id'] for f in a['families']}
for fd in review5033['families']:
 if fd['id'] in existing_family_ids:continue
 ds=[d for d in review5033['records'] if d['familyId']==fd['id']]
 image=ds[0]['image']['path'] if ds else None
 anchor={'placeId':fd['anchorPlaceId'],'role':'Regional orientation · 区域浏览锚点','note':'用于区域浏览；具体出土语境以 source claim 为准，不把展示锚点当成出土地或铸币地。'} if fd.get('anchorPlaceId') else None
 a['families'].append({'id':fd['id'],'title':fd['title'],'zh':fd['zh'],'region':fd['region'],'start':fd.get('start'),'end':fd.get('end'),'dateLabel':fd['dateLabel'],'description':fd['description'],'anchor':anchor,'image':image,'status':fd['status'],'question':fd['question'],'publications':[{'title':'Zeno #1070 · Kanka Kaiyuan find report','url':'https://www.zeno.ru/showphoto.php?photo=1070','role':'Source-reported regional find context; archaeological verification pending'}]})
 existing_family_ids.add(fd['id'])
for g in review5033['sourceGroups']:
 if not any(v['id']==g['id'] for v in a['variants']):
  a['variants'].append({'id':g['id'],'familyId':g['familyId'],'title':g['title'],'reference':'Zeno category '+g['categoryId']+' / record-level subset','status':'source_group','facets':[],'description':g['description']})
existing_specimen_ids={s['id'] for s in a['specimens']}
for decision in review5033['records']:
 id=str(decision['id']);sid='zeno-'+id
 if sid in existing_specimen_ids:continue
 r=z503_by_id[id];im=decision['image'];u=r.get('uploader') or {};rights=r.get('rights') or {}
 title=r.get('title') or ('Zeno '+id);prefix='#'+id+' - '
 if title.startswith(prefix):title=title[len(prefix):]
 pic={'id':'z'+id,'path':im['path'],'sourceUrl':(repair503_by_id.get(id) or {}).get('url') or r.get('originalImageUrl') or r.get('url'),'width':im['width'],'height':im['height'],'credit':u.get('name') or 'Zeno.ru uploader unknown','rightsStatus':('unverified' if (rights.get('status') or 'unverified') not in {'open_license','permission','public_domain','unverified'} else (rights.get('status') or 'unverified')),'rightsSourceUrl':rights.get('sourceTermsUrl'),'view':'source photograph','sha256':im.get('sha256')}
 source={'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}
 a['specimens'].append({'id':sid,'familyId':decision['familyId'],'variantId':decision['sourceGroupId'],'title':title,'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[pic],'sources':[source],'description':r.get('photoNote') or r.get('description') or 'Source-reported Central Asian occurrence.','catalogue':'Zeno category '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'facets':['Imported coin · 区域输入钱','#503 stage-3 site-context review'],'duplicateStatus':decision.get('duplicateStatus','source_record_not_proven_unique'),'coinRole':decision.get('coinRole','imported_coin'),'findContextClaim':decision.get('findContextClaim')})
 existing_specimen_ids.add(sid)


# Central Asia #503 stage-4: resolve a large bounded block of the remaining
# downloaded-image queue. Clear square/pseudo-square cash enters the Atlas;
# visually coherent non-square regional coinage remains related evidence.
review5034=read('research/zeno/review-503-stage4.json')
existing_family_ids={f['id'] for f in a['families']}
for fd in review5034['families']:
 if fd['id'] in existing_family_ids:continue
 ds=[d for d in review5034['records'] if d['familyId']==fd['id']]
 image=ds[0]['image']['path'] if ds else None
 anchor={'placeId':fd['anchorPlaceId'],'role':'Regional/city orientation · 区域／城市浏览锚点','note':'用于地图浏览；不自动表示铸币地、出土地或流通范围。'} if fd.get('anchorPlaceId') else None
 a['families'].append({'id':fd['id'],'title':fd['title'],'zh':fd['zh'],'region':fd['region'],'start':fd.get('start'),'end':fd.get('end'),'dateLabel':fd.get('dateLabel') or 'Chronology pending','description':fd['description'],'anchor':anchor,'image':image,'status':fd['status'],'question':fd['question'],'publications':[{'title':'Zeno category source taxonomy · stage-4 visual review','url':'https://www.zeno.ru/showgallery.php?cat=503','role':'Source taxonomy / specimen discovery; canonical attribution pending'}]})
 existing_family_ids.add(fd['id'])
for g in review5034['sourceGroups']:
 if not any(v['id']==g['id'] for v in a['variants']):
  a['variants'].append({'id':g['id'],'familyId':g['familyId'],'title':g['title'],'reference':'Zeno category '+g['categoryId']+' / stage-4 reviewed subset','status':'source_group','facets':[],'description':g['description']})
existing_specimen_ids={s['id'] for s in a['specimens']}
for decision in review5034['records']:
 if not decision.get('atlasImport'):continue
 id=str(decision['id']);sid='zeno-'+id
 if sid in existing_specimen_ids:continue
 r=z503_by_id[id];im=decision['image'];u=r.get('uploader') or {};rights=r.get('rights') or {}
 title=r.get('title') or ('Zeno '+id);prefix='#'+id+' - '
 if title.startswith(prefix):title=title[len(prefix):]
 pic={'id':'z'+id,'path':im['path'],'sourceUrl':(repair503_by_id.get(id) or {}).get('url') or r.get('originalImageUrl') or r.get('url'),'width':im['width'],'height':im['height'],'credit':u.get('name') or 'Zeno.ru uploader unknown','rightsStatus':('unverified' if (rights.get('status') or 'unverified') not in {'open_license','permission','public_domain','unverified'} else (rights.get('status') or 'unverified')),'rightsSourceUrl':rights.get('sourceTermsUrl'),'view':'source photograph','sha256':im.get('sha256')}
 source={'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}
 a['specimens'].append({'id':sid,'familyId':decision['familyId'],'variantId':decision['sourceGroupId'],'title':title,'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[pic],'sources':[source],'description':r.get('photoNote') or r.get('description') or 'Primary Zeno source record; source taxonomy preserved.','catalogue':'Zeno category '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'facets':['#503 stage-4 record-level visual review'],'duplicateStatus':decision.get('duplicateStatus','source_record_not_proven_unique')})
 existing_specimen_ids.add(sid)


# Central Asia #503 stage-5: import remaining clear square-hole/cash-derived groups
# and prune visually coherent non-square/background blocks.
review5035=read('research/zeno/review-503-stage5.json')
existing_family_ids={f['id'] for f in a['families']}
for fd in review5035['families']:
 if fd['id'] in existing_family_ids:continue
 ds=[d for d in review5035['records'] if d['familyId']==fd['id']]
 image=ds[0]['image']['path'] if ds else None
 anchor={'placeId':fd['anchorPlaceId'],'role':'Regional/city orientation · 区域／城市浏览锚点','note':'用于地图浏览；不自动表示铸币地、出土地或流通范围。'} if fd.get('anchorPlaceId') else None
 a['families'].append({'id':fd['id'],'title':fd['title'],'zh':fd['zh'],'region':fd['region'],'start':fd.get('start'),'end':fd.get('end'),'dateLabel':fd.get('dateLabel') or 'Chronology pending','description':fd['description'],'anchor':anchor,'image':image,'status':fd['status'],'question':fd['question'],'publications':[{'title':'Zeno #503 source taxonomy · stage-5 visual review','url':'https://www.zeno.ru/showgallery.php?cat=503','role':'Source taxonomy / specimen discovery; canonical attribution pending'}]})
 existing_family_ids.add(fd['id'])
for g in review5035['sourceGroups']:
 if not any(v['id']==g['id'] for v in a['variants']):
  a['variants'].append({'id':g['id'],'familyId':g['familyId'],'title':g['title'],'reference':'Zeno category '+g['categoryId']+' / stage-5 reviewed subset','status':'source_group','facets':[],'description':g['description']})
existing_specimen_ids={s['id'] for s in a['specimens']}
for decision in review5035['records']:
 id=str(decision['id']);sid='zeno-'+id
 if sid in existing_specimen_ids:continue
 r=z503_by_id[id];im=decision['image'];u=r.get('uploader') or {};rights=r.get('rights') or {}
 title=r.get('title') or ('Zeno '+id);prefix='#'+id+' - '
 if title.startswith(prefix):title=title[len(prefix):]
 pic={'id':'z'+id,'path':im['path'],'sourceUrl':(repair503_by_id.get(id) or {}).get('url') or r.get('originalImageUrl') or r.get('url'),'width':im['width'],'height':im['height'],'credit':u.get('name') or 'Zeno.ru uploader unknown','rightsStatus':('unverified' if (rights.get('status') or 'unverified') not in {'open_license','permission','public_domain','unverified'} else (rights.get('status') or 'unverified')),'rightsSourceUrl':rights.get('sourceTermsUrl'),'view':'source photograph','sha256':im.get('sha256')}
 a['specimens'].append({'id':sid,'familyId':decision['familyId'],'variantId':decision['sourceGroupId'],'title':title,'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[pic],'sources':[{'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}],'description':r.get('photoNote') or r.get('description') or 'Primary Zeno source record; source taxonomy preserved.','catalogue':'Zeno category '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'facets':['#503 stage-5 record-level visual review'],'duplicateStatus':decision.get('duplicateStatus','source_record_not_proven_unique')})
 existing_specimen_ids.add(sid)


# Central Asia #503 stage-6: resolve the final downloaded-image queue.
review5036=read('research/zeno/review-503-stage6.json')
existing_family_ids={f['id'] for f in a['families']}
for fd in review5036['families']:
 if fd['id'] in existing_family_ids:continue
 ds=[d for d in review5036['records'] if d['familyId']==fd['id']]
 image=ds[0]['image']['path'] if ds else None
 anchor={'placeId':fd['anchorPlaceId'],'role':'Regional/city orientation · 区域／城市浏览锚点','note':'用于地图浏览；不自动表示铸币地、出土地或流通范围。'} if fd.get('anchorPlaceId') else None
 a['families'].append({'id':fd['id'],'title':fd['title'],'zh':fd['zh'],'region':fd['region'],'start':fd.get('start'),'end':fd.get('end'),'dateLabel':fd.get('dateLabel') or 'Chronology pending','description':fd['description'],'anchor':anchor,'image':image,'status':fd['status'],'question':fd['question'],'publications':[{'title':'Zeno #503 source taxonomy · stage-6 visual review','url':'https://www.zeno.ru/showgallery.php?cat=503','role':'Source taxonomy / specimen discovery; canonical attribution pending'}]})
 existing_family_ids.add(fd['id'])
for g in review5036['sourceGroups']:
 if not any(v['id']==g['id'] for v in a['variants']):
  a['variants'].append({'id':g['id'],'familyId':g['familyId'],'title':g['title'],'reference':'Zeno category '+g['categoryId']+' / stage-6 reviewed subset','status':'source_group','facets':[],'description':g['description']})
existing_specimen_ids={s['id'] for s in a['specimens']}
for decision in review5036['records']:
 id=str(decision['id']);sid='zeno-'+id
 if sid in existing_specimen_ids:continue
 r=z503_by_id[id];im=decision['image'];u=r.get('uploader') or {};rights=r.get('rights') or {}
 title=r.get('title') or ('Zeno '+id);prefix='#'+id+' - '
 if title.startswith(prefix):title=title[len(prefix):]
 pic={'id':'z'+id,'path':im['path'],'sourceUrl':(repair503_by_id.get(id) or {}).get('url') or r.get('originalImageUrl') or r.get('url'),'width':im['width'],'height':im['height'],'credit':u.get('name') or 'Zeno.ru uploader unknown','rightsStatus':('unverified' if (rights.get('status') or 'unverified') not in {'open_license','permission','public_domain','unverified'} else (rights.get('status') or 'unverified')),'rightsSourceUrl':rights.get('sourceTermsUrl'),'view':'source photograph','sha256':im.get('sha256')}
 a['specimens'].append({'id':sid,'familyId':decision['familyId'],'variantId':decision['sourceGroupId'],'title':title,'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[pic],'sources':[{'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}],'description':r.get('photoNote') or r.get('description') or 'Primary Zeno source record; source taxonomy preserved.','catalogue':'Zeno category '+decision['leafCategoryId']+' · '+decision['leafCategoryTitle'],'facets':['#503 stage-6 final downloaded-image review'],'duplicateStatus':decision.get('duplicateStatus','source_record_not_proven_unique')})
 existing_specimen_ids.add(sid)

a['scopeCensus']=read('research/coverage-scopes.json')
nana_specimens=[s for s in a['specimens'] if s['familyId']=='lady-nana']
nana_zeno=[s for s in nana_specimens if s['id'].startswith('zeno-')]
a['coverage']={'categoryUrl':z['url'],'zenoRecordCount':len(z['records']),'importedZenoRecords':len(nana_zeno),'images':sum(len(s['images']) for s in nana_specimens),'scope':'Lady Nana category 3106 only; corpus-wide comparison pending','date':z.get('retrievedOn','2026-09-16'),'status':'snapshot'}
# Broad find report is retained without inventing an exact findspot or circulation polygon.
for s in a['specimens']:
 if s['id']=='zeno-264184':s['description']='Source reports “Unearthed in N. Afghanistan”. This is an unverified regional find report with no specific site, coordinates or archaeological context. No findspot marker is inferred.'
(root/'public/data/atlas.json').write_text(json.dumps(a,ensure_ascii=False,indent=2))
print('Exported',len(a['families']),'families',len(a['variants']),'reference groups',len(a['specimens']),'specimen records',sum(len(s['images']) for s in a['specimens']),'images; Nana',a['coverage']['importedZenoRecords'],'Zeno records /',a['coverage']['images'],'images')
