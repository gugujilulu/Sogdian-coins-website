import type {Atlas,Specimen,RelatedRecord} from './atlas';
export type GeoDimension='region'|'polity'|'place';
export type GeoSelection=Record<GeoDimension,string[]>;
export type GeoStatus='confirmed'|'probable'|'candidate'|'contextual'|'unresolved'|'not yet reviewed';
export type PlaceRole='display anchor'|'political center'|'mint candidate'|'mint'|'findspot'|'hoard'|'archaeological site'|'modern discovery location'|'uncertain place';
export type GeoReference={reference:string;source_status:'atlas_field'|'source_label'|'user_scope'|'unresolved';note:string};
export type GeoNode={id:string;dimension:GeoDimension;name:string;zh:string;aliases:string[];status:GeoStatus;source_status:GeoReference['source_status'];references:GeoReference[];note:string;relatedRegions:string[];relatedPlaces:string[];relatedFamilies:string[];evidenceState:string;roles:PlaceRole[]};
export type GeoMembership=Record<GeoDimension,string[]>;
export type GeographyIndex={nodes:GeoNode[];main:Map<string,GeoMembership>;related:Map<string,GeoMembership>};
export const noGeography:GeoSelection={region:[],polity:[],place:[]};
const dimensions:GeoDimension[]=['region','polity','place'];
// Fixed IDs and translations of existing literal labels. Composite/disputed labels remain intact.
const regionLabels=`semirechye|Semirechye|七河
sogdian-turkic|Semirechye / Sogdian-Turkic milieu|七河／粟特—突厥背景
western-liao-semirechye|Western Liao / Semirechye|西辽／七河归属
chach|Chach|石国
ferghana|Ferghana|费尔干纳
east-sogdiana|Eastern Sogdiana|东粟特
barkat|Eastern Sogdiana / Barkat|东粟特／Barkat
kabudan|Eastern Sogdiana / Kabudan|东粟特／Kabudan
samarkand|Eastern Sogdiana / Samarkand|东粟特／撒马尔罕
sogdiana-or-tokharistan|Eastern Sogdiana or northern Tokharistan?|东粟特或北吐火罗？
ferghana-chach|Ferghana / Chach attribution disputed|费尔干纳／石国归属有争议
termez|Northern Tokharistan / Termez|北吐火罗／怛蜜
vakhsh|Northern Tokharistan / Vakhsh|北吐火罗／瓦赫什
vakhsh-valley|Northern Tokharistan / Vakhsh valley|北吐火罗／瓦赫什河谷
north-tokharistan-uncertain|Northern Tokharistan?|北吐火罗？
badakhshan|Badakhshan / Northern Tokharistan|巴达赫尚／北吐火罗
panch|Panch / Panjikent|潘治／片治肯特
panch-samarkand|Panch / Samarkand Sogd|潘治／撒马尔罕粟特
kucha|Qiuci / Kucha, Xinjiang|新疆龟兹／库车
samarkand-uncertain|Samarkand Sogd / uncertain|撒马尔罕粟特／未定
sayram|Sayram / Isfijab|赛兰／白水城
sayram-keder|Sayram / Isfijab / Keder|赛兰／白水城／Keder
kesh|Southern Sogd / Kesh|南粟特／渴石（亟失）
bukhara|Western Sogd / Bukhara|西粟特／布哈拉
paykand|Western Sogd / Paykand|西粟特／佩肯特
investigation|Central Asia / attribution under investigation|中亚／归属研究中
unresolved|Central Asia · attribution unresolved|中亚／归属未定
imports|Central Asia · context-specific finds|中亚／具体输入语境
unassigned|Unassigned Central Asian region|中亚地区未定`;
const polityLabels=`turgesh|Türgesh|突骑施
qarluq|Qarluq / Karluk|葛逻禄
samarkand|Samarkand Sogd|康国／撒马尔罕体系
bukhara|Bukhara Sogd|安国／布哈拉体系
chach|Chach|石国体系
ferghana|Ferghana|费尔干纳
panch|Panch|潘治
paykand|Paykand local system|佩肯特地方体系
kesh|Kesh|渴石（亟失）
barkat|Barkat local system|Barkat 地方体系
kabudan|Kabudan local system|Kabudan 地方体系
badakhshan|Badakhshan local system|巴达赫尚地方体系
fansar-pargar|Fansar / Pargar local systems|Fansar／Pargar 地方体系
proto-qarakhanid-liao|Disputed proto-Qarakhanid / Western Liao|原黑汗／西辽归属有争议
ferghana-chach|Ferghana / Chach disputed|费尔干纳／石国归属有争议
imports|Imported East Asian cash|中国等东亚输入钱语境
keder|Keder / Sayram-Isfijab|Keder／赛兰—白水城
north-tokharistan|Northern Tokharistan local systems|北吐火罗地方体系
kucha|Qiuci / Kucha|龟兹／库车
samarkand-unresolved|Samarkand Sogd / unresolved|撒马尔罕粟特／未定
sayram|Sayram / Isfijab|赛兰／白水城
semirechye-unresolved|Semirechye / unresolved|七河／未定
semirechye-turkic|Semirechye Turkic-Sogdian|七河突厥—粟特背景
semirechye-imitation|Semirechye local imitation|七河本地仿制
termez|Termez / Tirmidh local system|怛蜜地方体系
unresolved|Unresolved|未定体系
vakhsh|Vakhsh local system|瓦赫什地方体系
qara-khitai|Western Liao / Qara Khitai attribution|西辽归属体系
yaghlaqar|Yaghlaqar clan / Turkic|药罗葛氏／突厥背景`;
const scope: [GeoDimension,string,string,string,string[]][]=[
 ['region','sogdiana','Sogdiana','粟特',['Soghd','粟特绿洲与地方体系']],
 ['region','west-sogdiana','Western Sogdiana','西粟特',['Western Sogd']],
 ['region','south-sogdiana','Southern Sogdiana','南粟特',['Southern Sogd']],
 ['region','xinjiang','Xinjiang','新疆',[]],
 ['region','tokharistan','Tokharistan','吐火罗',[]],['region','north-tokharistan','Northern Tokharistan','北吐火罗',[]],
 ['region','north-tokharistan-badakhshan','Northern Tokharistan & Badakhshan','北吐火罗与巴达赫尚',[]],
 ['region','bactria','Bactria','巴克特里亚',[]],['region','north-afghanistan','Northern Afghanistan','阿富汗北部',[]],['region','northeast-afghanistan','Northeastern Afghanistan','阿富汗东北部',[]],
 ['region','tarim','Tarim Basin','塔里木盆地',[]],['region','khotan','Khotan','于阗',[]],['region','kashgar','Kashgar and surroundings','喀什及周边',[]],['region','xinjiang-other','Other relevant Xinjiang regions','新疆其他相关历史区域',[]],['region','talas','Talas and surroundings','怛罗斯及周边',['Taraz']],
 ['polity','turkic-khaganate','Turkic Khaganates','突厥汗国体系',[]],['polity','western-turkic','Western Turkic systems','西突厥体系',[]],['polity','uyghur','Uyghur systems','回鹘体系',[]],['polity','qarakhanid','Qarakhanid','黑汗体系',[]],['polity','bactrian','Bactrian-related systems','巴克特里亚相关体系',[]],
];
const categoryMap:Record<string,string[]>={
 '800':['region:sogdiana'],'868':['region:samarkand'],'2146':['region:panch'],
 '2141':['region:semirechye'],'795':['polity:turgesh'],'870':['region:chach','polity:chach'],'2145':['region:chach','polity:chach'],
 '866':['region:bukhara'],'803':['region:ferghana'],'867':['region:kesh'],
 '2142':['region:north-tokharistan-badakhshan'],'9299':['polity:qara-khitai'],
};
/** Search ancestry explicitly present in existing labels, not a new historical attribution.
 * Alternatives, disputed labels and the broad Northern Tokharistan & Badakhshan union
 * are deliberately not converted to definite membership of either alternative.
 */
export const regionParents:Readonly<Record<string,readonly string[]>>={
 'region:termez':['region:north-tokharistan'],
 'region:vakhsh':['region:north-tokharistan'],
 'region:vakhsh-valley':['region:north-tokharistan'],
 'region:badakhshan':['region:north-tokharistan'],
 'region:north-tokharistan':['region:tokharistan'],
 'region:barkat':['region:east-sogdiana'],
 'region:kabudan':['region:east-sogdiana'],
 'region:samarkand':['region:east-sogdiana'],
 'region:east-sogdiana':['region:sogdiana'],
 'region:bukhara':['region:west-sogdiana'],
 'region:paykand':['region:west-sogdiana'],
 'region:west-sogdiana':['region:sogdiana'],
 'region:kesh':['region:south-sogdiana'],
 'region:south-sogdiana':['region:sogdiana'],
 'region:panch-samarkand':['region:sogdiana'],
 'region:sogdian-turkic':['region:semirechye'],
 'region:western-liao-semirechye':['region:semirechye'],
 'region:kucha':['region:xinjiang'],
};
export const geoStateLabels:Record<string,string>={unknown:'未标注／未定',unresolved:'未定／多种归属',research:'研究中／资料不足',source_only:'仅来源标签，尚未完成学术确认',candidate:'候选／尚未审阅',multiple:'多种关联（不表示已确认）'};
export const stateId=(d:GeoDimension,state:string)=>`${d}:state:${state}`;
const uncertain=(s:string)=>/\?|unresolved|unassigned|uncertain|disputed|under investigation/i.test(s);
const reference=(reference:string,source_status:GeoReference['source_status'],note:string):GeoReference=>({reference,source_status,note});
export function buildGeographyIndex(data:Atlas):GeographyIndex{
 const nodes=new Map<string,GeoNode>(),literal:Record<GeoDimension,Map<string,string>>={region:new Map(),polity:new Map(),place:new Map()};
 function node(d:GeoDimension,id:string,name:string,zh:string,aliases:string[]=[],status:GeoStatus='candidate'){
  const key=`${d}:${id}`;if(nodes.has(key))return nodes.get(key)!;
  const value:GeoNode={id:key,dimension:d,name,zh,aliases:[name,...aliases],status,source_status:'user_scope',references:[reference('docs/workflow/T20-geography-filters.md#数据与建设范围登记','user_scope','用户指定建设范围；不证明方孔钱发行或任何地理关系')],note:'研究导航项；不证明发行、铸地、出土或政治疆域。相关地区／地点仅为已有记录字段共现。',relatedRegions:[],relatedPlaces:[],relatedFamilies:[],evidenceState:'not yet mapped',roles:[]};nodes.set(key,value);return value;
 }
 for(const [d,table] of [['region',regionLabels],['polity',polityLabels]] as const)for(const line of table.split('\n')){const [id,name,zh]=line.split('|');node(d,id,name,zh);literal[d].set(name,`${d}:${id}`)}
 for(const [d,id,name,zh,aliases] of scope)node(d,id,name,zh,aliases);
 for(const p of data.places){const n=node('place',p.id,p.name,p.zh,[p.id],'contextual');n.references=[reference(p.source||`public/data/atlas.json#places/${p.id}`,p.source?'atlas_field':'unresolved',p.note)];n.source_status=p.source?'atlas_field':'unresolved';n.evidenceState='existing place; relationship roles remain separate';literal.place.set(p.id,n.id)}
 for(const d of dimensions)for(const [state,zh] of Object.entries(geoStateLabels)){const n=node(d,'state:'+state,state,zh,[], 'unresolved');n.source_status='unresolved';n.evidenceState='explicit missing/research state';n.note='派生筛选状态，不是地理实体或排除结论。'}
 function add(m:GeoMembership,d:GeoDimension,id:string,ref:GeoReference, familyId?:string){
  const n=nodes.get(id);if(!n)return;if(!m[d].includes(id))m[d].push(id);
  if(!n.references.some(r=>r.reference===ref.reference&&r.note===ref.note))n.references.push(ref);
  if(n.source_status==='user_scope')n.source_status=ref.source_status;
  if(n.status==='candidate')n.status=uncertain(n.name)?'unresolved':'contextual';
  n.evidenceState=ref.source_status==='source_label'?'source classification label; not scholarly confirmation':'inherited existing attribution; not independently confirmed';
  if(familyId&&!n.relatedFamilies.includes(familyId))n.relatedFamilies.push(familyId);
 }
 const familyMap=new Map(data.families.map(f=>[f.id,f]));
 function member(r:Specimen|RelatedRecord,isMain:boolean):GeoMembership{
  const m:GeoMembership={region:[],polity:[],place:[]};const f=isMain?familyMap.get((r as Specimen).familyId):undefined;
  if(f){
   for(const d of ['region','polity'] as const){const value=f[d]?.trim();if(!value)continue;let id=literal[d].get(value);if(!id){id=node(d,'literal:'+encodeURIComponent(value),value,'原始标签（中文未记录）',[],'unresolved').id;literal[d].set(value,id)}
    add(m,d,id,reference(`public/data/atlas.json#families/${f.id}/${d}`,'atlas_field','继承家族归属，未新增学术确认'),f.id);
    if(uncertain(value))m[d].push(stateId(d,'unresolved'));
    if(/exploration|candidate|pending|unresolved/.test(f.status)||uncertain(value))m[d].push(stateId(d,'research'));
   }
   if(f.anchor){const id=literal.place.get(f.anchor.placeId);if(id){add(m,'place',id,reference(`public/data/atlas.json#families/${f.id}/anchor`,'atlas_field',`display anchor；原角色：${f.anchor.role}；${f.anchor.note}`),f.id);const n=nodes.get(id)!;if(!n.roles.includes('display anchor'))n.roles.push('display anchor')}}
   for(const e of data.evidence.filter(e=>e.familyId===f.id)){const id=literal.place.get(e.placeId);if(!id)continue;add(m,'place',id,reference(e.source,'atlas_field',`${e.kind}: ${e.note}`),f.id);const n=nodes.get(id)!,role:PlaceRole=e.kind==='context'?'uncertain place':e.kind;if(!n.roles.includes(role))n.roles.push(role)}
  }
  // Provider-qualified, exact original category IDs only. No title or slash parsing.
  const isZeno=isMain?(r as Specimen).sourceName==='Zeno':(r as RelatedRecord).sourceName==='Zeno';
  if(isZeno)for(const path of r.sourcePath||[])for(const id of categoryMap[path.categoryId]||[]){const n=nodes.get(id);if(n)add(m,n.dimension,id,reference(`public/data/atlas.json#${isMain?'specimens':'relatedRecords'}/${r.id}/sourcePath/${path.categoryId}`,'source_label',`Zeno 分类 ${path.title} [${path.categoryId}]，仅来源标签`),f?.id)}
  for(const d of dimensions){const entities=m[d].filter(id=>!id.includes(':state:'));
   if(!entities.length)m[d].push(stateId(d,'unknown'),stateId(d,'unresolved'),stateId(d,'research'));
   else m[d].push(stateId(d,'source_only'));
   if(entities.length>1)m[d].push(stateId(d,'multiple'));
   if(f&&/candidate|exploration/.test(f.status))m[d].push(stateId(d,'candidate'));
   m[d]=[...new Set(m[d])];
   for(const id of entities){const n=nodes.get(id)!;n.relatedRegions=[...new Set([...n.relatedRegions,...m.region.filter(x=>!x.includes(':state:'))])];n.relatedPlaces=[...new Set([...n.relatedPlaces,...m.place.filter(x=>!x.includes(':state:'))])]}
  }
  // Expand only after deriving direct-label states: an ancestor is not an extra
  // competing attribution and must not manufacture a "multiple" state.
  const visited=new Set(m.region);
  function ancestors(child:string){for(const parent of regionParents[child]||[]){
   if(visited.has(parent))continue;visited.add(parent);
   const origin=nodes.get(child)!;
   add(m,'region',parent,reference(`lib/geography-index.ts#regionParents/${child}`,'atlas_field',`地区检索上级：${origin.name} → ${nodes.get(parent)!.name}；沿用下级证据及状态，不推导政权或地点角色`),f?.id);
   const target=nodes.get(parent)!;
   for(const ref of origin.references)if(!target.references.some(r=>r.reference===ref.reference&&r.note===ref.note))target.references.push(ref);
   target.evidenceState='explicit region search ancestry; inherited labels, not scholarly confirmation';
   target.relatedRegions=[...new Set([...target.relatedRegions,child])];
   target.relatedPlaces=[...new Set([...target.relatedPlaces,...m.place.filter(id=>!id.includes(':state:'))])];
   ancestors(parent);
  }}
  for(const child of [...m.region])ancestors(child);
  return m;
 }
 const main=new Map(data.specimens.map(r=>[r.id,member(r,true)])),related=new Map(data.relatedRecords.map(r=>[r.id,member(r,false)]));
 return {nodes:[...nodes.values()],main,related};
}
export function geographyMatches(m:GeoMembership|undefined,selection:GeoSelection){return dimensions.every(d=>!selection[d].length||selection[d].some(id=>(m?.[d]||[stateId(d,'unknown')]).includes(id)))}
export function geographyRecordIds(index:GeographyIndex,selection:GeoSelection){return new Set([...index.main].filter(([,m])=>geographyMatches(m,selection)).map(([id])=>id))}
export function filterRelatedGeography(records:RelatedRecord[],index:GeographyIndex,selection:GeoSelection){return records.filter(r=>geographyMatches(index.related.get(r.id),selection))}
/** Faceted record counts ignore only the option's own dimension; count stable records, not links. */
export function geographyCounts(index:GeographyIndex,records:readonly Specimen[],selection:GeoSelection){
 const counts=new Map<string,number>();for(const n of index.nodes){const selectionWithoutOwn={...selection,[n.dimension]:[]};counts.set(n.id,records.filter(r=>geographyMatches(index.main.get(r.id),selectionWithoutOwn)&&index.main.get(r.id)?.[n.dimension].includes(n.id)).length)}return counts;
}
/** Accept canonical IDs and exact old field/place labels; never fuzzy-match an attribution. */
export function resolveGeography(index:GeographyIndex,selection:GeoSelection):GeoSelection{
 const resolved={region:[],polity:[],place:[]} as GeoSelection;
 for(const d of dimensions)for(const value of selection[d]){const matches=index.nodes.filter(n=>n.dimension===d&&(n.id===value||n.aliases.includes(value)||n.zh===value));if(matches.length!==1)throw Error(`地区／政权／地点不存在或不唯一：${value}`);if(!resolved[d].includes(matches[0].id))resolved[d].push(matches[0].id)}return resolved;
}
