'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {Search,SlidersHorizontal,X,ExternalLink,MapPin,BookOpen,Images,GitCompareArrows,ChevronRight,Database,Maximize2} from 'lucide-react';
import {CatalogueTreeSidebar,CatalogueTreeContent} from '@/components/atlas/catalogue-tree';
import {buildCatalogueTree} from '@/lib/catalogue-tree';
import {SourceTree,SourceCoverageNote} from '@/components/atlas/source-tree';
import {buildSourceTree,type SourceCoverage} from '@/lib/source-tree';
import SourceCatalogue from '@/components/atlas/source-catalogue';
import {projectSourceIndex,type SourceIndex,type SourceGroup} from '@/lib/source-index';
import RelatedGallery from '@/components/atlas/related-gallery';
import TerrainMap from '@/components/atlas/terrain-map';
import {type Atlas,type Family,type Specimen,type Variant} from '@/lib/atlas';

import {filterAtlasRecords,recordSourceProvider,type DateFilter} from '@/lib/record-filters';

type View='atlas'|'catalogue'|'research';


function OutLink({url,children}:{url:string;children:ReactNode}){return <a className="out-link" href={url} target="_blank" rel="noreferrer">{children}<ExternalLink size={12}/></a>}
function sourceName(s:{label:string;url:string}){
 if(/^Zeno\s/i.test(s.label)||s.url.includes('zeno.ru'))return 'Zeno';
 if(s.url.includes('cngcoins.com'))return 'CNG';
 if(s.url.includes('numista.com'))return 'Numista';
 if(s.url.includes('sogdcoins.'))return 'Coins of Central Asia';
 if(s.url.includes('bactrianumis'))return 'Bactrianumis';
 if(/album|sarc/i.test(s.label+s.url))return 'Stephen Album';
 try{return new URL(s.url).hostname.replace(/^www\./,'')||s.label}catch{return s.label||'Other source'}
}
function visibleFacet(x:string){return !x.startsWith('#503')&&!x.startsWith('Zeno source group')&&!/record-level visual review/i.test(x)}
function facetKind(x:string):'inscription'|'tamgha'|'feature'{
 const v=x.toLowerCase();
 if(/tamgha|徽记|tamga/.test(v))return 'tamgha';
 if(/legend|铭文|inscription|script|转写|translit/.test(v))return 'inscription';
 return 'feature';
}
function sourcePathLabel(s:Specimen){
 const p=s.sourcePath||[];
 if(p.length)return p.map(x=>x.title).join(' › ');
 return s.catalogue||'Unclassified source record';
}

export default function Home(){
 const [sourceIndex,setSourceIndex]=useState<SourceIndex|null>(null),[sourceIndexError,setSourceIndexError]=useState(false);
 useEffect(()=>{fetch('/data/source-index.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setSourceIndex(d as SourceIndex)).catch(()=>setSourceIndexError(true))},[]);
 const [data,setData]=useState<Atlas|null>(null),[loadError,setLoadError]=useState(false);
 const [view,setView]=useState<View>('atlas'),[selectedId,setSelectedId]=useState<string|null>(null),[focus,setFocus]=useState(0);
 const [query,setQuery]=useState(''),[region,setRegion]=useState('all'),[polity,setPolity]=useState('all'),[city,setCity]=useState('all'),[familyFilter,setFamilyFilter]=useState('all'),[sourceFilter,setSourceFilter]=useState('all'),[inscriptionFilter,setInscriptionFilter]=useState('all'),[tamghaFilter,setTamghaFilter]=useState('all'),[featureFilter,setFeatureFilter]=useState('all'),[statusFilter,setStatusFilter]=useState('all');
 const [year,setYear]=useState(750),[dateMode,setDateMode]=useState<DateFilter['mode']>('all'),[filtersOpen,setFiltersOpen]=useState(false);
 const [variant,setVariant]=useState('all'),[facet,setFacet]=useState('all');
 const [lightbox,setLightbox]=useState<Specimen|null>(null),[imageIndex,setImageIndex]=useState(0),[compareIds,setCompareIds]=useState<string[]>([]);
 const lastSourceQuery=useRef('');
 const [sourceNodeId,setSourceNodeId]=useState<string|null>(null),[sourceExpanded,setSourceExpanded]=useState<Set<string>>(()=>new Set());
 const [sourceReturn,setSourceReturn]=useState<{query:string;selection:string|null;node:string|null}|null>(null);
 const [sourceCoverage,setSourceCoverage]=useState<SourceCoverage[]>([]);
 useEffect(()=>{fetch('/data/source-coverage.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setSourceCoverage(d as SourceCoverage[])).catch(()=>setSourceCoverage([]))},[]);
 const [catalogueRecord,setCatalogueRecord]=useState<string|null>(null);
 const [catalogueMode,setCatalogueMode]=useState<'atlas'|'source'>('atlas'),[catalogueFamily,setCatalogueFamily]=useState<string|null>(null),[catalogueSource,setCatalogueSource]=useState<string|null>(null),[catalogueQuery,setCatalogueQuery]=useState('');
 useEffect(()=>{fetch('/data/atlas.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setData(d as Atlas)).catch(()=>setLoadError(true))},[]);
 useEffect(()=>{if(!data)return;const p=new URLSearchParams(window.location.hash.replace(/^#/,''));const v=p.get('view') as View|null;if(v&&['atlas','catalogue','research'].includes(v))setView(v);const f=p.get('family');if(f&&data.families.some(x=>x.id===f)){setSelectedId(f);setCatalogueFamily(f)}const src=p.get('source');if(src){setCatalogueMode('source');setCatalogueSource(src);setView('catalogue')}const rec=p.get('record');if(rec){const hit=data.specimens.find(x=>x.id===rec);if(hit){setLightbox(hit);setImageIndex(0);setSelectedId(hit.familyId)}}},[data]);
 useEffect(()=>{if(!data)return;const p=new URLSearchParams();if(view!=='atlas')p.set('view',view);if(selectedId)p.set('family',selectedId);if(view==='catalogue'&&catalogueMode==='source'&&catalogueSource)p.set('source',catalogueSource);if(lightbox)p.set('record',lightbox.id);const next=p.toString();history.replaceState(null,'',next?`#${next}`:window.location.pathname)},[view,selectedId,catalogueMode,catalogueSource,lightbox,data]);

 const sources=useMemo<string[]>(()=>Array.from(new Set((data?.specimens||[]).flatMap(s=>s.sources.filter(src=>src.relation==='same_specimen').map(recordSourceProvider).filter((name):name is string=>name!==null)))).sort(),[data]);
 const inscriptions=useMemo<string[]>(()=>Array.from(new Set([...(data?.specimens||[]).flatMap(s=>s.facets.filter(x=>visibleFacet(x)&&facetKind(x)==='inscription'))])).sort(),[data]);
 const tamghas=useMemo<string[]>(()=>Array.from(new Set((data?.specimens||[]).flatMap(s=>s.facets.filter(x=>visibleFacet(x)&&facetKind(x)==='tamgha')))).sort(),[data]);
 const features=useMemo<string[]>(()=>Array.from(new Set((data?.specimens||[]).flatMap(s=>s.facets.filter(x=>visibleFacet(x)&&facetKind(x)==='feature')))).sort(),[data]);
 const regions=useMemo<string[]>(()=>Array.from(new Set((data?.families||[]).map(f=>f.region))).sort(),[data]);
 const polities=useMemo<string[]>(()=>Array.from(new Set((data?.families||[]).map(f=>f.polity).filter((x):x is string=>Boolean(x)))).sort(),[data]);
 const researchStatuses=useMemo<string[]>(()=>Array.from(new Set((data?.families||[]).map(f=>f.status))).sort(),[data]);
 const result=useMemo(()=>{
  if(!data)return null;
  const choice=(value:string)=>value==='all'?undefined:value;
  const choices=(value:string)=>value==='all'?[]:[value];
  return filterAtlasRecords(data,{query,region:choice(region),polity:choice(polity),city:choice(city),status:choice(statusFilter),
   familyIds:choices(familyFilter),sources:choices(sourceFilter),inscriptions:choices(inscriptionFilter),tamghas:choices(tamghaFilter),features:choices(featureFilter),
   date:dateMode==='year'?{mode:'year',year}:{mode:dateMode},catalogueGroupIds:variant==='unassigned'?[]:choices(variant),unassignedGroup:variant==='unassigned',facet:choice(facet)});
 },[data,query,region,polity,city,statusFilter,familyFilter,sourceFilter,inscriptionFilter,tamghaFilter,featureFilter,year,dateMode,variant,facet]);
 const filteredFamilies=result?.families||[];
 const matchedRecords=result?.records||[];
 const specimensByFamily=result?.recordsByFamily||new Map<string,Specimen[]>();
 const catalogueTree=useMemo(()=>data?buildCatalogueTree(data,matchedRecords,projectSourceIndex(sourceIndex||{version:1,sources:[],links:[]},matchedRecords).byRecord,catalogueQuery):{families:[],recordCount:0,groupCount:0,unassignedCount:0},[data,result,sourceIndex,catalogueQuery]);
 const catalogueIds=new Set(catalogueTree.families.flatMap(f=>f.groups.flatMap(g=>g.records.map(r=>r.id))));
 const activeCatalogueNode=catalogueTree.families.find(f=>f.family.id===catalogueFamily);
 const activeLightbox=lightbox&&matchedRecords.some(s=>s.id===lightbox.id)&&(!(view==='catalogue'&&catalogueMode==='atlas')||catalogueIds.has(lightbox.id))?lightbox:null;
 const selected=filteredFamilies.find(f=>f.id===selectedId)||null;
 const selectedSpecimens=selected?specimensByFamily.get(selected.id)||[]:[];
 const selectedVariants=selected?data?.variants.filter(v=>v.familyId===selected.id)||[]:[];
 const selectedFacets:string[]=Array.from(new Set(selectedSpecimens.flatMap(s=>s.facets.filter(visibleFacet))));
 const shownSpecimens=selectedSpecimens;
 const selectedPlace=selected?.anchor?data?.places.find(p=>p.id===selected.anchor?.placeId):null;
 const compare=matchedRecords.filter(s=>compareIds.includes(s.id));
 const sourceProjection=useMemo(()=>projectSourceIndex(sourceIndex||{version:1,sources:[],links:[]},matchedRecords,catalogueQuery),[sourceIndex,result,catalogueQuery]);
 const catalogueSourceGroups=sourceProjection.groups;
 const sourceTree=useMemo(()=>buildSourceTree(projectSourceIndex(sourceIndex||{version:1,sources:[],links:[]},matchedRecords).groups.flatMap(g=>g.entries),catalogueQuery),[sourceIndex,result,catalogueQuery]);
 const sourceNode=sourceNodeId?sourceTree.nodes.get(sourceNodeId):undefined;
 useEffect(()=>{if(catalogueMode==='source'&&sourceNodeId&&!sourceTree.nodes.has(sourceNodeId))setSourceNodeId(null)},[sourceTree,catalogueMode,sourceNodeId]);
 useEffect(()=>{if(catalogueMode!=='source'||!sourceIndex||lastSourceQuery.current===catalogueQuery)return;lastSourceQuery.current=catalogueQuery;if(catalogueQuery.trim())setSourceExpanded(old=>new Set([...old,...sourceTree.nodes.keys()]))},[sourceTree,catalogueMode,catalogueQuery,sourceIndex]);
 const referenceGroup:SourceGroup={key:'__references__',source:'参考资料（非实际来源）',entries:sourceProjection.references,sourceCount:new Set(sourceProjection.references.map(e=>e.source.id)).size,recordCount:new Set(sourceProjection.references.map(e=>e.specimen.id)).size};
 const sourceGroup=catalogueSource==='__references__'?referenceGroup:catalogueSource==='__tree__'?(sourceNode?{key:sourceNode.id,source:sourceNode.title,entries:sourceNode.entries,sourceCount:sourceNode.sourceCount,recordCount:sourceNode.recordCount}:null):catalogueSourceGroups.find(g=>g.key===catalogueSource)||null;
 const relatedMatches=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return[];return (data?.relatedRecords||[]).filter(r=>[r.sourceRecordId,r.title,r.reviewStatus,r.reason,r.leafCategoryTitle,...r.sourcePath.map(x=>x.title)].join(' ').toLowerCase().includes(q))},[data,query]);
 const quickSpecimens=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return[];return matchedRecords.filter(s=>[s.title,s.sourceRecordId||'',s.catalogue,s.description,sourcePathLabel(s),...s.sources.map(x=>x.label),...s.facets].join(' ').toLowerCase().includes(q)).slice(0,6)},[result,query]);

 useEffect(()=>{
  if(!result)return;
  if(selectedId&&!result.familyIds.has(selectedId))setSelectedId(null);
  if(catalogueFamily&&!result.familyIds.has(catalogueFamily))setCatalogueFamily(null);
  if(lightbox&&!result.records.some(s=>s.id===lightbox.id))setLightbox(null);
 },[result,selectedId,catalogueFamily,lightbox]);

 useEffect(()=>{
  if(view!=='catalogue'||catalogueMode!=='atlas')return;
  const ids=new Set(catalogueTree.families.flatMap(f=>f.groups.flatMap(g=>g.records.map(r=>r.id))));
  if(catalogueRecord&&!ids.has(catalogueRecord))setCatalogueRecord(null);
  if(catalogueFamily&&!catalogueTree.families.some(f=>f.family.id===catalogueFamily))setCatalogueFamily(null);
  if(lightbox&&!ids.has(lightbox.id))setLightbox(null);
 },[catalogueTree,view,catalogueMode,catalogueRecord,catalogueFamily,lightbox]);

 function chooseFamily(id:string){setSelectedId(id);setVariant('all');setFacet('all');setFocus(x=>x+1);if(view==='catalogue')setCatalogueFamily(id)}
 function openSpecimen(s:Specimen){setLightbox(s);setImageIndex(0)}
 function toggleCompare(id:string){setCompareIds(xs=>xs.includes(id)?xs.filter(x=>x!==id):xs.length>=3?[xs[1],xs[2],id]:[...xs,id])}
 function clearFilters(){setQuery('');setRegion('all');setPolity('all');setCity('all');setFamilyFilter('all');setSourceFilter('all');setInscriptionFilter('all');setTamghaFilter('all');setFeatureFilter('all');setStatusFilter('all');setDateMode('all');setVariant('all');setFacet('all');setCatalogueQuery('')}
 const imageCount=data?.specimens.reduce((n,s)=>n+s.images.length,0)||0;
 if(!data)return <main className="boot-state"><div><Database size={30}/><p>{loadError?'Catalogue could not load. Please reload.':'Loading Central Asian Square-Hole Coinage Atlas…'}</p></div></main>;

 return <main className="atlas-app">
  <header className="app-header"><button className="brand-button" onClick={()=>setView('atlas')}><span className="brand-mark">◈</span><span><strong>CENTRAL ASIAN SQUARE-HOLE COINAGE ATLAS</strong><small>中亚方孔钱地图与图像资料库</small></span></button><nav>{([['atlas','Atlas'],['catalogue','Catalogue'],['research','Research']] as [View,string][]).map(([id,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}>{label}</button>)}</nav><div className="header-stats"><span>{filteredFamilies.length} families</span><b>·</b><span>{matchedRecords.length} records</span></div></header>

  {view==='atlas'&&<section className="atlas-screen">
   <TerrainMap data={data} records={matchedRecords} families={filteredFamilies} selected={selected} onSelect={chooseFamily} year={dateMode==='year'?year:null} focus={focus}/>
   <div className="atlas-search-panel"><div className="atlas-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索类型、铭文、编号、来源…"/><button aria-label="Filters" className={filtersOpen?'active':''} onClick={()=>setFiltersOpen(x=>!x)}><SlidersHorizontal size={16}/></button>{(query||region!=='all'||polity!=='all'||city!=='all'||familyFilter!=='all'||sourceFilter!=='all'||inscriptionFilter!=='all'||tamghaFilter!=='all'||featureFilter!=='all'||statusFilter!=='all'||dateMode!=='all'||variant!=='all'||facet!=='all')&&<button aria-label="Clear filters" onClick={clearFilters}><X size={15}/></button>}</div>
    {filtersOpen&&<div className="filter-grid"><label>历史地区<select value={region} onChange={e=>setRegion(e.target.value)}><option value="all">全部地区</option>{regions.map(r=><option key={r} value={r}>{r}</option>)}</select></label><label>政权 / 地方体系<select value={polity} onChange={e=>setPolity(e.target.value)}><option value="all">全部政权与体系</option>{polities.map(p=><option key={p} value={p}>{p}</option>)}</select></label><label>城市 / 展示锚点<select value={city} onChange={e=>setCity(e.target.value)}><option value="all">全部位置</option>{data.places.map(p=><option key={p.id} value={p.id}>{p.name} · {p.zh}</option>)}</select></label><label>类型家族<select value={familyFilter} onChange={e=>setFamilyFilter(e.target.value)}><option value="all">全部家族</option>{data.families.map(f=><option key={f.id} value={f.id}>{f.title}</option>)}</select></label><label>来源<select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)}><option value="all">全部来源</option>{sources.map(s=><option key={s}>{s}</option>)}</select></label><label>研究状态<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">全部状态</option>{researchStatuses.map(s=><option key={s}>{s}</option>)}</select></label>{inscriptions.length>0&&<label>铭文 / Legend<select value={inscriptionFilter} onChange={e=>setInscriptionFilter(e.target.value)}><option value="all">全部已标注铭文</option>{inscriptions.map(f=><option key={f}>{f}</option>)}</select></label>}{tamghas.length>0&&<label>Tamgha / 徽记<select value={tamghaFilter} onChange={e=>setTamghaFilter(e.target.value)}><option value="all">全部已标注徽记</option>{tamghas.map(f=><option key={f}>{f}</option>)}</select></label>}{features.length>0&&<label className="filter-wide">其他特征<select value={featureFilter} onChange={e=>setFeatureFilter(e.target.value)}><option value="all">全部其他特征</option>{features.map(f=><option key={f}>{f}</option>)}</select></label>}</div>}
    <div className="filter-result-line"><strong>{filteredFamilies.length}</strong> families · <strong>{matchedRecords.length}</strong> records{filteredFamilies.some(f=>!f.anchor)&&<span> · {filteredFamilies.filter(f=>!f.anchor).length} families 暂无地图坐标</span>}</div>
    {(query||familyFilter!=='all')&&<div className="quick-results">{filteredFamilies.slice(0,5).map(f=><button key={f.id} onClick={()=>chooseFamily(f.id)}><img src={f.image} alt=""/><span><strong>{f.title}</strong><small>{f.region} · {specimensByFamily.get(f.id)?.length||0} records</small></span><ChevronRight size={14}/></button>)}{quickSpecimens.map(s=><button key={'record-'+s.id} onClick={()=>openSpecimen(s)}><img src={s.images[0]?.path} alt=""/><span><strong>{s.sourceRecordId||s.id}</strong><small>{s.title} · {s.sourceName||sourceName(s.sources[0])}</small></span><Maximize2 size={13}/></button>)}{relatedMatches.length>0&&<button onClick={()=>{setCatalogueQuery(query);setCatalogueMode('source');setCatalogueSource('__related__');setView('catalogue')}}><span className="related-search-icon">R</span><span><strong>相关 / held / excluded</strong><small>{relatedMatches.length} 条来源记录匹配当前搜索</small></span><ChevronRight size={14}/></button>}</div>}
   </div>
   <div className="timeline-floating" role="group" aria-label="年代筛选">
    <button aria-pressed={dateMode==='all'} className={dateMode==='all'?'active':''} onClick={()=>setDateMode('all')}>全部时期</button>
    <button aria-pressed={dateMode==='unknown'} className={dateMode==='unknown'?'active':''} onClick={()=>setDateMode('unknown')}>年代未知</button>
    <input aria-label="Issue date filter" aria-describedby="date-filter-note" type="range" min="200" max="1650" step="10" value={year} onChange={e=>{setYear(Number(e.target.value));setDateMode('year')}}/>
    <strong>{dateMode==='all'?'全部时期':dateMode==='unknown'?'年代未知':`${year} CE`}</strong>
    <small id="date-filter-note">按家族区间筛选；“未知”指缺少完整有效区间，不代表学术上无法断代。</small>
    {!!result?.dateAnomalies.length&&<small role="status">数据异常：{result.dateAnomalies.map(a=>a.familyId).join('、')} 的区间非法或倒置，列入未知模式待核。</small>}
   </div>
   {matchedRecords.length===0&&<p className="empty-state">没有匹配记录。请调整或清除筛选。</p>}
   {selected&&<FamilyDrawer onFullFamily={()=>{clearFilters();setFamilyFilter(selected.id)}} family={selected} placeName={selectedPlace?.name||null} specimens={shownSpecimens} allSpecimens={selectedSpecimens} variants={selectedVariants} facets={selectedFacets} variant={variant} facet={facet} setVariant={setVariant} setFacet={setFacet} onClose={()=>setSelectedId(null)} onCatalogue={()=>{setCatalogueMode('atlas');setCatalogueFamily(selected.id);setView('catalogue')}} onOpen={openSpecimen} onCompare={toggleCompare} compareIds={compareIds}/>}
  </section>}

  {view==='catalogue'&&<section className="catalogue-page"><aside className="catalogue-tree"><div className="catalogue-title"><BookOpen size={18}/><div><strong>Catalogue</strong><small>纲目与来源目录 · 当前 Atlas 筛选同步</small></div></div><div className="catalogue-switch"><button className={catalogueMode==='atlas'?'active':''} onClick={()=>setCatalogueMode('atlas')}>Atlas 纲目</button><button className={catalogueMode==='source'?'active':''} onClick={()=>setCatalogueMode('source')}>来源目录</button></div><div className="catalogue-search"><Search size={14}/><input value={catalogueQuery} onChange={e=>setCatalogueQuery(e.target.value)} placeholder="搜索名称、编号、来源…"/></div>{catalogueMode==='atlas'?<><div className="catalogue-tree-actions"><button className="text-button" onClick={()=>setCatalogueQuery('')}>清空目录搜索</button><button className="text-button" onClick={clearFilters}>清除全部筛选</button></div>{sourceIndexError&&<p role="status">来源索引加载失败，仍可按主库ID或名称浏览。</p>}<CatalogueTreeSidebar tree={catalogueTree} query={catalogueQuery} selectedId={catalogueIds.has(catalogueRecord||'')?catalogueRecord:null} onFamily={id=>{setCatalogueFamily(id);setCatalogueSource(null);setSelectedId(id)}} onOpen={s=>{setCatalogueRecord(s.id);openSpecimen(s)}}/></>:<div className="tree-scroll"><button className={'special-tree-node '+(catalogueSource==='__related__'?'active':'')} onClick={()=>{setCatalogueSource('__related__');setCatalogueFamily(null)}}><span>相关 / held / excluded</span><small>{data.relatedRecords.length}</small></button>{sourceIndexError?<p role="status">来源索引加载失败；主库与相关资料仍可访问。</p>:!sourceIndex?<p role="status">来源索引加载中…</p>:<><div className="catalogue-tree-actions"><button onClick={()=>setCatalogueQuery('')}>清空目录搜索</button></div><p>{sourceTree.sourceCount} 实际来源记录 · {sourceTree.associationCount} 来源关联 · {sourceTree.recordCount} 去重主库记录</p><SourceTree roots={sourceTree.roots} expanded={sourceExpanded} selected={sourceNodeId} onToggle={id=>setSourceExpanded(old=>{const next=new Set(old);if(next.has(id))next.delete(id);else next.add(id);return next})} onSelect={id=>{setSourceNodeId(id);setCatalogueSource('__tree__');setCatalogueFamily(null)}}/><button onClick={()=>{setCatalogueSource('__references__');setCatalogueFamily(null)}}><span>参考资料 comparison / 其他非实际关系</span><small>{sourceProjection.references.length}</small></button></>}</div>}</aside>
   <div className="catalogue-content">{catalogueMode==='atlas'&&sourceReturn&&<button className="text-button" onClick={()=>{setCatalogueQuery(sourceReturn.query);setCatalogueSource(sourceReturn.selection);setSourceNodeId(sourceReturn.node);setCatalogueMode('source');setSourceReturn(null)}}>返回来源目录</button>}{catalogueMode==='atlas'?<CatalogueTreeContent onCompare={toggleCompare} compareIds={compareIds} node={activeCatalogueNode} onOpen={s=>{setCatalogueRecord(s.id);openSpecimen(s)}}/>:catalogueSource==='__related__'?<RelatedGallery records={data.relatedRecords} query={catalogueQuery} mainRecordCount={data.specimens.length}/>:sourceGroup?<>{catalogueSource==='__tree__'&&sourceNode&&<SourceCoverageNote node={sourceNode} coverage={sourceCoverage}/>}<SourceCatalogue group={sourceGroup} data={data} onOpen={openSpecimen} onFamily={id=>{setSourceReturn({query:catalogueQuery,selection:catalogueSource,node:sourceNodeId});setCatalogueQuery('');setCatalogueMode('atlas');setCatalogueFamily(id);setSelectedId(id)}}/></>:<EmptyCatalogue/>}</div>
  </section>}

  {view==='research'&&<ResearchView data={data} imageCount={imageCount} sources={sources}/>}

  {compare.length>0&&<CompareTray items={compare} data={data} onRemove={toggleCompare} onClear={()=>setCompareIds([])} onOpen={openSpecimen}/>}
  {activeLightbox&&<SpecimenLightbox specimen={activeLightbox} family={data.families.find(f=>f.id===activeLightbox.familyId)||null} index={imageIndex} setIndex={setImageIndex} onClose={()=>setLightbox(null)}/>}
 </main>
}

function FamilyDrawer({onFullFamily,family,placeName,specimens,allSpecimens,variants,facets,variant,facet,setVariant,setFacet,onClose,onCatalogue,onOpen,onCompare,compareIds}:{onFullFamily:()=>void;family:Family;placeName:string|null;specimens:Specimen[];allSpecimens:Specimen[];variants:Variant[];facets:string[];variant:string;facet:string;setVariant:(x:string)=>void;setFacet:(x:string)=>void;onClose:()=>void;onCatalogue:()=>void;onOpen:(s:Specimen)=>void;onCompare:(id:string)=>void;compareIds:string[]}){
 const activeVariant=variants.find(v=>v.id===variant)||null;
 return <aside className="family-drawer"><div className="drawer-head"><span>TYPE FAMILY / 类型家族</span><div className="drawer-head-actions"><button onClick={onFullFamily}>查看完整家族</button><button onClick={onCatalogue}><BookOpen size={15}/>目录</button><button onClick={onClose} aria-label="Close details"><X size={18}/></button></div></div><div className="drawer-scroll"><h1>{family.title}</h1><p className="family-zh">{family.zh}</p><div className="family-meta"><span>{family.dateLabel}</span><span>{family.region}</span>{family.polity&&<span>{family.polity}</span>}<span>{family.status}</span></div><p>{family.description}</p>{family.anchor&&<div className="evidence-note"><MapPin size={16}/><div><strong>{placeName||family.anchor.placeId}</strong><small>{family.anchor.role}</small><p>{family.anchor.note}</p></div></div>}{family.question&&<div className="question-note">{family.question}</div>}
 <div className="drawer-section-title"><div><Images size={15}/><strong>图库</strong></div><span>{allSpecimens.length} records · {allSpecimens.reduce((n,s)=>n+s.images.length,0)} images</span></div><div className="drawer-filters"><select value={variant} onChange={e=>setVariant(e.target.value)}><option value="all">全部 catalogue groups</option>{variants.map(v=><option key={v.id} value={v.id}>{v.title} ({allSpecimens.filter(s=>s.variantId===v.id).length})</option>)}{allSpecimens.some(s=>s.variantId===null)&&<option value="unassigned">分组待定</option>}</select>{facets.length>0&&<select value={facet} onChange={e=>setFacet(e.target.value)}><option value="all">全部铭文 / Tamgha / 特征</option>{facets.map(f=><option key={f}>{f}</option>)}</select>}</div>{activeVariant&&<div className="group-context"><strong>{activeVariant.title}</strong><span>{activeVariant.status}</span>{activeVariant.reference&&<small>{activeVariant.reference}</small>}<p>{activeVariant.description}</p></div>}<div className="drawer-gallery">{specimens.map(s=><SpecimenTile key={s.id} s={s} onOpen={onOpen} onCompare={onCompare} comparing={compareIds.includes(s.id)}/>)}</div>{!specimens.length&&<p className="empty-state">当前分组没有记录。</p>}
 <details className="research-block"><summary><BookOpen size={15}/>研究、铭文与来源</summary>{family.legend&&<><h3>铭文 / Inscription</h3><p className="inscription">{family.legend}</p>{family.legendNote&&<p>{family.legendNote}</p>}</>}<h3>研究与目录</h3>{family.publications.map(p=><div className="publication" key={p.url}><OutLink url={p.url}>{p.title}</OutLink><small>{p.role}</small></div>)}</details></div></aside>
}

function SpecimenTile({s,onOpen,onCompare,comparing}:{s:Specimen;onOpen:(s:Specimen)=>void;onCompare:(id:string)=>void;comparing:boolean}){const primary=s.sources[0];return <article className="specimen-tile"><button className="specimen-image" onClick={()=>onOpen(s)}><img src={s.images[0]?.path} alt={s.title}/><span><Maximize2 size={12}/>原图</span></button><div className="specimen-copy"><strong>{s.title}</strong><small>{[s.weightG!=null?`${s.weightG} g`:null,s.diameterMm!=null?`${s.diameterMm} mm`:null].filter(Boolean).join(' · ')||'尺寸未记录'}</small><small className="source-badge">{s.sourceName||(primary?sourceName(primary):'来源待整理')} · {s.sourceRecordId||s.id}</small><p>{s.catalogue}</p><div className="tile-actions"><button className={comparing?'active':''} onClick={()=>onCompare(s.id)}><GitCompareArrows size={13}/>{comparing?'已加入':'对比'}</button>{(s.sourceRecordUrl||primary?.url)&&<OutLink url={s.sourceRecordUrl||primary!.url}>来源</OutLink>}</div></div></article>}







function EmptyCatalogue(){return <div className="empty-catalogue"><BookOpen size={28}/><h1>请选择有匹配记录的目录节点</h1><p>当前选择可能已被筛掉。请从左侧重新选择，或返回 Atlas 调整筛选。</p></div>}

function ResearchView({data,imageCount,sources}:{data:Atlas;imageCount:number;sources:string[]}){const sourceCounts=Array.from(data.specimens.reduce((m,s)=>{const k=s.sourceName||sourceName(s.sources[0]);m.set(k,(m.get(k)||0)+1);return m},new Map<string,number>()).entries()).sort((a,b)=>b[1]-a[1]);return <section className="research-page"><div className="research-hero"><span className="eyebrow">RESEARCH CORPUS · CURRENT EDITION</span><h1>来源可追溯的中亚方孔钱研究资料库</h1><p>当前版本把来源资料层、研究整理层和产品展示层分开。重复、未定归属和字段缺失可以保留；主 Atlas 的收录数量不作为稀有度判断。</p></div><div className="metrics-row"><div><strong>{data.families.length}</strong><span>families</span></div><div><strong>{data.variants.length}</strong><span>source / catalogue groups</span></div><div><strong>{data.specimens.length}</strong><span>specimen records</span></div><div><strong>{imageCount}</strong><span>images</span></div><div><strong>{sources.length}</strong><span>visible source systems</span></div><div><strong>{data.relatedRecords.length}</strong><span>related / held source records</span></div></div><div className="research-columns"><article><h2>来源资料层</h2><p>每条记录保留来源链接；Zeno 记录额外保留 source record ID 和原始 breadcrumb 分类路径。Atlas 的重新分类只增加研究关系，不覆盖来源树。</p><ul><li>原始来源记录和图片持续保留</li><li>related / held / excluded 不触发原始资料删除</li><li>same-image / same-specimen 关系只在有明确证据时增加</li></ul></article><article><h2>当前地图证据</h2><p>地图已经区分展示锚点、findspot / hoard evidence 与 area layers。没有可靠 polygon 的政权或类型继续显示在 Catalogue 与搜索中，不制造疆域或流通范围。</p><ul><li>{data.evidence.length} 条结构化空间证据</li><li>{data.areas.length} 个当前 area layer records</li><li>{data.families.filter(f=>!f.anchor).length} 个 family 暂无展示锚点</li></ul></article><article><h2>下一阶段</h2><p>一期优先完善 Atlas、Catalogue、来源与已有铭文/tamgha 检索。随后按地区和专题补充 IICAS、Smirnova、Kamyshev、Zeimal、考古报告、博物馆与拍卖资料。</p><ul><li>Learning：文字系统、铭文、tamgha 与真实钱币联动</li><li>Market：拍卖记录与履历，正式建设后每四个自然月增量更新</li><li>历史 GIS：只在来源支持时加入分期 polygon</li></ul></article></div><h2 className="research-section-title">Primary source records</h2><p className="research-footnote">以下数量表示当前主库记录的主要来源，不代表独立实物数量或稀有度。</p><div className="source-coverage-grid">{sourceCounts.map(([name,count])=><div key={name}><strong>{count}</strong><span>{name}</span></div>)}</div><h2 className="research-section-title">Source coverage snapshots</h2><div className="coverage-table"><table><thead><tr><th>Scope</th><th>Source snapshot</th><th>Observed</th><th>Status</th></tr></thead><tbody>{data.scopeCensus.map((c,i)=><tr key={`${c.categoryId}-${i}`}><td>{c.title}</td><td><OutLink url={c.url}>Zeno #{c.categoryId}</OutLink></td><td>{c.sourcePhotoCount}</td><td>source snapshot</td></tr>)}</tbody></table></div><div className="research-footnote">Lady Nana snapshot: {data.coverage.importedZenoRecords}/{data.coverage.zenoRecordCount} observed Zeno records imported · {data.coverage.images} images across its current source-linked corpus. Coverage snapshots describe captured source material, not global surviving populations.</div></section>}

function CompareTray({items,data,onRemove,onClear,onOpen}:{items:Specimen[];data:Atlas;onRemove:(id:string)=>void;onClear:()=>void;onOpen:(s:Specimen)=>void}){return <div className="compare-tray"><div className="compare-head"><strong><GitCompareArrows size={15}/>Compare · {items.length}/3</strong><button onClick={onClear}>清空</button></div><div className="compare-items">{items.map(s=>{const f=data.families.find(x=>x.id===s.familyId);return <article key={s.id}><button onClick={()=>onOpen(s)}><img src={s.images[0]?.path} alt=""/></button><div><strong>{s.title}</strong><small>{f?.title}</small><span>{s.weightG!=null?`${s.weightG} g`:'—'} · {s.diameterMm!=null?`${s.diameterMm} mm`:'—'}</span><span>{s.sourceName||(s.sources[0]?sourceName(s.sources[0]):'—')} · {s.sourceRecordId||s.id}</span><span>{s.catalogue||'catalogue pending'}</span></div><button className="remove-compare" onClick={()=>onRemove(s.id)}><X size={13}/></button></article>})}</div></div>}

function SpecimenLightbox({specimen,family,index,setIndex,onClose}:{specimen:Specimen;family:Family|null;index:number;setIndex:(n:number)=>void;onClose:()=>void}){const image=specimen.images[index]||specimen.images[0];return <div className="lightbox-overlay" role="dialog" aria-modal="true"><div className="specimen-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={20}/></button><div className="modal-image"><img src={image?.path} alt={specimen.title}/></div><div className="modal-info"><span className="eyebrow">{family?.title}</span><h1>{specimen.title}</h1><div className="family-meta"><span>{specimen.weightG!=null?`${specimen.weightG} g`:'weight unknown'}</span><span>{specimen.diameterMm!=null?`${specimen.diameterMm} mm`:'size unknown'}</span><span>{specimen.sourceRecordId||specimen.id}</span></div>{specimen.images.length>1&&<div className="image-strip">{specimen.images.map((im,i)=><button key={im.id} className={i===index?'active':''} onClick={()=>setIndex(i)}><img src={im.path} alt=""/></button>)}</div>}<p>{specimen.description}</p>{specimen.catalogue&&<div className="metadata-row"><strong>Catalogue</strong><span>{specimen.catalogue}</span></div>}{specimen.coinRole&&<div className="metadata-row"><strong>Coin role</strong><span>{specimen.coinRole}</span></div>}{specimen.findContextClaim&&<div className="metadata-row"><strong>Find context</strong><span>{typeof specimen.findContextClaim==='string'?specimen.findContextClaim:[specimen.findContextClaim.rawText,specimen.findContextClaim.status,specimen.findContextClaim.note].filter(Boolean).join(' · ')}</span></div>}{specimen.sourcePath&&specimen.sourcePath.length>0&&<div className="metadata-row"><strong>Source path</strong><span>{specimen.sourcePath.map(x=>`${x.title} [${x.categoryId}]`).join(' › ')}</span></div>}<div className="metadata-row"><strong>Image</strong><span>{image?.width} × {image?.height}px · {image?.credit||'credit pending'} · rights: {image?.rightsStatus||'unverified'}</span></div>{image?.sourceRecordUrl&&<div className="metadata-row"><strong>Image source</strong><span><OutLink url={image.sourceRecordUrl}>{image.sourceName||specimen.sourceName||'Source'} · {image.sourceRecordId||specimen.sourceRecordId||specimen.id}</OutLink>{image.sourceUrl&&image.sourceUrl!==image.sourceRecordUrl&&<> · <OutLink url={image.sourceUrl}>原始图片</OutLink></>}{image.rightsSourceUrl&&<> · <OutLink url={image.rightsSourceUrl}>权利说明</OutLink></>}</span></div>}<h3>Source records</h3><div className="modal-sources">{specimen.sources.map((s,i)=><OutLink key={s.url+i} url={s.url}>{sourceName(s)} · {s.label}</OutLink>)}</div>{specimen.facets.filter(visibleFacet).length>0&&<><h3>Inscription / tamgha / features</h3><div className="facet-chips">{specimen.facets.filter(visibleFacet).map(x=><span key={x}>{x}</span>)}</div></>}</div></div></div>}
