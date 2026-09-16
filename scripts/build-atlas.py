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
 a['specimens'].append({'id':id,'familyId':id,'variantId':v['id'],'title':c['name'],'weightG':r.get('weightG'),'diameterMm':r.get('diameterMm'),'images':[{'id':id+'-photo','path':c['image'],'sourceUrl':r.get('imageUrl',c['source']),'width':im.width,'height':im.height,'credit':c['credit'],'view':c.get('imageView','both')}],'sources':[{'label':'Original catalogue','url':c['source'],'relation':'same_specimen'}]+([{'label':'Zeno '+c['zeno'].split('=')[-1],'url':c['zeno'],'relation':'comparison'}] if c['zeno'] else []),'description':c['description'],'catalogue':c['reference'],'facets':[],'duplicateStatus':'not_exhaustively_checked'})
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
 a['specimens'].append({'id':'zeno-'+id,'familyId':'lady-nana','variantId':'nana-'+vm[id] if id in vm else None,'title':'Zeno '+id,'weightG':r.get('weightG'),'diameterMm':None if id=='334987' else r.get('diameterMm'),'images':[{'id':'z'+id,'path':im['path'],'sourceUrl':im['url'],'width':im['width'],'height':im['height'],'credit':'Zeno.ru · Z-'+id,'view':'source photograph'}],'sources':[{'label':'Zeno '+id,'url':r['url'],'relation':'same_specimen'}],'description':r.get('description') or 'Primary Zeno record; description and classification preserved in the source.','catalogue':ref,'facets':['Panch tamgha · 潘治徽记']+(['Semi-italic legend · 半草书铭文'] if id=='77712' else []),'duplicateStatus':'not_exhaustively_checked'})
non=read('research/nana-source-register.json');out=root/'public/coins/nana';out.mkdir(parents=True,exist_ok=True)
vm={'cng611-576':'sh245','sarc28-145':'sm846','sarc22-55':'sm834','sarc52-1614':'sm846','sogdcoins-es28':'sm769'}
for r in non['records']:
 target=r['id']+'.jpg';image_path='/coins/nana/'+target
 # Assets are copied into the repository before export, so the export is reproducible without scratch paths.
 if not (out/target).exists():raise RuntimeError('Missing asset: '+target)
 zi=next((s for s in a['specimens'] if s['id']=='zeno-'+str(r.get('zeno_id'))),None)
 im=Image.open(out/target);pic={'id':r['id']+'-photo','path':image_path,'sourceUrl':r.get('image_url') or r.get('source_pdf') or r['source_page'],'width':im.width,'height':im.height,'credit':r['source_credit'],'view':'both as arranged in source'}
 sources=[{'label':r['source_credit'].split(';')[0],'url':r['source_page'],'relation':'same_specimen'}]+[{'label':'Zeno '+str(n),'url':'https://www.zeno.ru/showphoto.php?photo='+str(n),'relation':'comparison'} for n in r['zeno_comparison_references']]+[{'label':'Numista 197126','url':n['source_page'],'relation':'same_specimen'} for n in r.get('duplicate_sources',[])]
 if zi:
  zi['sources']+=sources;zi['duplicateStatus']='same_specimen_explicitly_identified';zi['images'].append(pic);continue
 s={'id':r['id'],'familyId':'lady-nana','variantId':'nana-'+vm[r['id']] if r['id'] in vm else None,'title':r['title'].replace('Lady Nana · ',''),'weightG':r.get('weight_g'),'diameterMm':r.get('diameter_mm'),'images':[pic],'sources':sources,'description':r.get('visual_notes') or r.get('reverse_design') or 'Source specimen.','catalogue':r.get('catalogue_reference') or '', 'facets':['Panch tamgha · 潘治徽记']+(['Semi-italic legend · 半草书铭文'] if r['id']=='sarc28-146' else []),'duplicateStatus':'not_exhaustively_checked'}
 alt=out/(r['id']+'-alternate.jpg')
 if alt.exists():
  ai=Image.open(alt);s['images'].append({**pic,'id':r['id']+'-alternate','path':'/coins/nana/'+alt.name,'width':ai.width,'height':ai.height,'sourceUrl':r['alternate_image']['image_url']})
 a['specimens'].append(s)
a['scopeCensus']=read('research/coverage-scopes.json')
a['coverage']={'categoryUrl':z['url'],'zenoRecordCount':14,'importedZenoRecords':len([s for s in a['specimens'] if s['id'].startswith('zeno-')]),'images':sum(len(s['images']) for s in a['specimens']),'scope':'Lady Nana category 3106 only; corpus-wide comparison pending','date':'2026-09-16','status':'snapshot'}
# Broad find report is retained without inventing an exact findspot or circulation polygon.
for s in a['specimens']:
 if s['id']=='zeno-264184':s['description']='Source reports “Unearthed in N. Afghanistan”. This is an unverified regional find report with no specific site, coordinates or archaeological context. No findspot marker is inferred.'
(root/'public/data/atlas.json').write_text(json.dumps(a,ensure_ascii=False,indent=2))
print('Exported',len(a['families']),'families',len(a['variants']),'reference groups',len(a['specimens']),'specimen records',a['coverage']['images'],'images')
