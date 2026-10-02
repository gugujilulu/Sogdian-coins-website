'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {viewedRecord,emptyFilters,galleryRecords,validGallerySelection,keepFullFamilySession,type FilterContext,type FullFamilySession,type CollectionContext} from '@/lib/map-selection';
import {buildMapBackground} from '@/lib/map-layers';
import {useRangeSelection} from '@/components/atlas/use-range-selection';
import FamilyMapBackground from '@/components/atlas/family-map-background';
import type {SheetState} from '@/lib/mobile-sheet';
import FamilyDrawer from '@/components/atlas/family-drawer';
import DetailDialog from '@/components/atlas/detail-dialog';
import ImageViewer from '@/components/atlas/image-viewer';
import ImageProvenance from '@/components/atlas/image-provenance';
import {selectedImage} from '@/lib/image-viewer';
import GeographyFilters from '@/components/atlas/geography-filters';
import {buildGeographyIndex,geographyRecordIds,geographyCounts,filterRelatedGeography,resolveGeography} from '@/lib/geography-index';
import CopyLink,{FilterLinkContext} from '@/components/atlas/copy-link';
import {useDeepLinks} from '@/lib/use-deep-links';
import {validateLink,ancestorNodes,type DeepLink} from '@/lib/deep-links';
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
 const [filters,setFilters]=useState<FilterContext>(emptyFilters);
 const {query,region,polity,city,familyFilter,sourceFilter,inscriptionFilter,tamghaFilter,featureFilter,statusFilter,year,dateMode}=filters;
 const setQuery=(value:FilterContext['query'])=>setFilters(old=>({...old,query:value}));
 const setFamilyFilter=(value:FilterContext['familyFilter'])=>setFilters(old=>({...old,familyFilter:value}));
 const setSourceFilter=(value:FilterContext['sourceFilter'])=>setFilters(old=>({...old,sourceFilter:value}));
 const setInscriptionFilter=(value:FilterContext['inscriptionFilter'])=>setFilters(old=>({...old,inscriptionFilter:value}));
 const setTamghaFilter=(value:FilterContext['tamghaFilter'])=>setFilters(old=>({...old,tamghaFilter:value}));
 const setFeatureFilter=(value:FilterContext['featureFilter'])=>setFilters(old=>({...old,featureFilter:value}));
 const setStatusFilter=(value:FilterContext['statusFilter'])=>setFilters(old=>({...old,statusFilter:value}));
 const setYear=(value:FilterContext['year'])=>setFilters(old=>({...old,year:value}));
 const setDateMode=(value:FilterContext['dateMode'])=>setFilters(old=>({...old,dateMode:value}));
 const [filtersOpen,setFiltersOpen]=useState(false);
 const [collectionContext,setCollectionContext]=useState<CollectionContext|null>(null),[returnCollection,setReturnCollection]=useState<{context:CollectionContext;serial:number}|null>(null);
 const [fullSession,setFullSession]=useState<FullFamilySession|null>(null);
 useEffect(()=>{setFullSession(old=>keepFullFamilySession(old,selectedId,filters))},[filters,selectedId]);
 const [variant,setVariant]=useState('all'),[facet,setFacet]=useState('all');
 const [lightbox,setLightbox]=useState<Specimen|null>(null),[compareIds,setCompareIds]=useState<string[]>([]);
 const lastSourceQuery=useRef('');
 const [sourceNodeId,setSourceNodeId]=useState<string|null>(null),[sourceExpanded,setSourceExpanded]=useState<Set<string>>(()=>new Set());
 const [sourceReturn,setSourceReturn]=useState<{query:string;selection:string|null;node:string|null}|null>(null);
 const [sourceCoverage,setSourceCoverage]=useState<SourceCoverage[]>([]);
 useEffect(()=>{fetch('/data/source-coverage.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setSourceCoverage(d as SourceCoverage[])).catch(()=>setSourceCoverage([]))},[]);
 const [catalogueRecord,setCatalogueRecord]=useState<string|null>(null);
 const [catalogueMode,setCatalogueMode]=useState<'atlas'|'source'>('atlas'),[catalogueFamily,setCatalogueFamily]=useState<string|null>(null),[catalogueSource,setCatalogueSource]=useState<string|null>(null),[catalogueQuery,setCatalogueQuery]=useState('');
 useEffect(()=>{fetch('/data/atlas.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setData(d as Atlas)).catch(()=>setLoadError(true))},[]);

 const [catalogueGroup,setCatalogueGroup]=useState<string|null>(null),[relatedId,setRelatedId]=useState<string|null>(null);
 const [reveal,setReveal]=useState<{family:string;group?:string;serial:number}|null>(null);
 const [linkNotice,setLinkNotice]=useState('');
 const sources=useMemo<string[]>(()=>Array.from(new Set((data?.specimens||[]).flatMap(s=>s.sources.filter(src=>src.relation==='same_specimen').map(recordSourceProvider).filter((name):name is string=>name!==null)))).sort(),[data]);
 const inscriptions=useMemo<string[]>(()=>Array.from(new Set([...(data?.specimens||[]).flatMap(s=>s.facets.filter(x=>visibleFacet(x)&&facetKind(x)==='inscription'))])).sort(),[data]);
 const tamghas=useMemo<string[]>(()=>Array.from(new Set((data?.specimens||[]).flatMap(s=>s.facets.filter(x=>visibleFacet(x)&&facetKind(x)==='tamgha')))).sort(),[data]);
 const features=useMemo<string[]>(()=>Array.from(new Set((data?.specimens||[]).flatMap(s=>s.facets.filter(x=>visibleFacet(x)&&facetKind(x)==='feature')))).sort(),[data]);
 const researchStatuses=useMemo<string[]>(()=>Array.from(new Set((data?.families||[]).map(f=>f.status))).sort(),[data]);
 const [sheetState,setSheetState]=useState<SheetState>('half');
 useEffect(()=>{setSheetState('half')},[selectedId]);
 function revealMap(){if(matchMedia('(max-width:760px)').matches)setSheetState('summary')}
 const [backgroundFamily,setBackgroundFamily]=useState<string|null>(null),[rangeFocus,setRangeFocus]=useState(0),[backgroundObject,setBackgroundObject]=useState('');
 useEffect(()=>{setBackgroundFamily(null);setBackgroundObject('')},[selectedId]);
 const rangeControl=useRangeSelection(JSON.stringify([selectedId,backgroundObject,dateMode,dateMode==='year'?year:null]));
 const geography=useMemo(()=>data?buildGeographyIndex(data):null,[data]);
 const mapBackground=useMemo(()=>data&&geography?buildMapBackground(data,geography):null,[data,geography]);
 const geoSelection=useMemo(()=>({region,polity,place:city}),[region,polity,city]);
 const recordFilters=useMemo(()=>{
  const choice=(v:string)=>v==='all'?undefined:v, choices=(v:string)=>v==='all'?[]:[v];
  return {query,status:choice(statusFilter),familyIds:choices(familyFilter),sources:choices(sourceFilter),inscriptions:choices(inscriptionFilter),tamghas:choices(tamghaFilter),features:choices(featureFilter),date:(dateMode==='year'?{mode:'year',year}:{mode:dateMode}) as DateFilter};
 },[query,statusFilter,familyFilter,sourceFilter,inscriptionFilter,tamghaFilter,featureFilter,year,dateMode]);
 const baseResult=useMemo(()=>data?filterAtlasRecords(data,recordFilters):null,[data,recordFilters]);
 const result=useMemo(()=>data&&geography?filterAtlasRecords(data,{...recordFilters,geographyRecordIds:geographyRecordIds(geography,geoSelection)}):null,[data,geography,recordFilters,geoSelection]);
 const geoCounts=useMemo(()=>geography?geographyCounts(geography,baseResult?.records||[],geoSelection):new Map<string,number>(),[geography,baseResult,geoSelection]);
 const relatedRecords=useMemo(()=>data&&geography?filterRelatedGeography(data.relatedRecords,geography,geoSelection):[],[data,geography,geoSelection]);
 const filteredFamilies=result?.families||[];
 const matchedRecords=result?.records||[];
 const specimensByFamily=result?.recordsByFamily||new Map<string,Specimen[]>();
 const catalogueTree=useMemo(()=>data?buildCatalogueTree(data,matchedRecords,projectSourceIndex(sourceIndex||{version:1,sources:[],links:[]},matchedRecords).byRecord,catalogueQuery):{families:[],recordCount:0,groupCount:0,unassignedCount:0},[data,result,sourceIndex,catalogueQuery]);
 const catalogueIds=new Set(catalogueTree.families.flatMap(f=>f.groups.flatMap(g=>g.records.map(r=>r.id))));
 const activeCatalogueNode=catalogueTree.families.find(f=>f.family.id===catalogueFamily);
 const viewed= viewedRecord(data?.specimens||[],lightbox?.id||null,matchedRecords);
 const activeLightbox=viewed.record;
 const selected=data?.families.find(f=>f.id===selectedId)||null;
 const selectedSpecimens=selected?specimensByFamily.get(selected.id)||[]:[];
 const selectedVariants=selected?data?.variants.filter(v=>v.familyId===selected.id)||[]:[];
 const fullSpecimens=selected?data?.specimens.filter(s=>s.familyId===selected.id)||[]:[];
 const selectedFacets:string[]=Array.from(new Set(fullSpecimens.flatMap(s=>s.facets.filter(visibleFacet))));
 const shownSpecimens=galleryRecords(selectedSpecimens,variant,facet);
 const actualSources=useMemo(()=>projectSourceIndex(sourceIndex||{version:1,sources:[],links:[]},matchedRecords).byRecord,[sourceIndex,result]);
 const selectedPlace=selected?.anchor?data?.places.find(p=>p.id===selected.anchor?.placeId):null;
 const compare=matchedRecords.filter(s=>compareIds.includes(s.id));
 const sourceProjection=useMemo(()=>projectSourceIndex(sourceIndex||{version:1,sources:[],links:[]},matchedRecords,catalogueQuery),[sourceIndex,result,catalogueQuery]);
 const catalogueSourceGroups=sourceProjection.groups;
 const sourceTree=useMemo(()=>buildSourceTree(projectSourceIndex(sourceIndex||{version:1,sources:[],links:[]},matchedRecords).groups.flatMap(g=>g.entries),catalogueQuery),[sourceIndex,result,catalogueQuery]);
 const sourceNode=sourceNodeId?sourceTree.nodes.get(sourceNodeId):undefined;
 const fullCatalogue=useMemo(()=>data?buildCatalogueTree(data,data.specimens,new Map()):null,[data]);
 const fullSources=useMemo(()=>sourceIndex&&data?buildSourceTree(projectSourceIndex(sourceIndex,data.specimens).groups.flatMap(g=>g.entries)):null,[sourceIndex,data]);
 const filterLink={region,polity,city,filters:{query,familyFilter,sourceFilter,inscriptionFilter,tamghaFilter,featureFilter,statusFilter,year,dateMode}};
 const currentLink:DeepLink={view,...filterLink};
 if(view==='atlas'&&selectedId)currentLink.family=selectedId;
 if(view==='catalogue'){
  if(catalogueMode==='atlas'){if(catalogueFamily)currentLink.family=catalogueFamily;if(catalogueGroup&&fullCatalogue?.families.some(f=>f.groups.some(g=>g.id===catalogueGroup)))currentLink.group=catalogueGroup}
  else {currentLink.panel=catalogueSource==='__related__'?'related':catalogueSource==='__references__'?'references':'sources';if(currentLink.panel==='sources'&&sourceNodeId)currentLink.node=sourceNodeId;if(currentLink.panel==='related'&&relatedId)currentLink.related=relatedId}
 }
 if(lightbox){currentLink.record=lightbox.id;if(!currentLink.panel)currentLink.family=lightbox.familyId;}
 const navigation=useDeepLinks(currentLink,!!data,link=>{if(!data||!fullCatalogue||!geography)return 'waiting';resolveGeography(geography,{region:link.region||[],polity:link.polity||[],place:link.city||[]});return validateLink(link,data,fullCatalogue,fullSources?.nodes??null,sourceIndexError)},link=>{
  if(!data||!fullCatalogue)return;
  const record=data.specimens.find(r=>r.id===link.record);
  const owner=fullCatalogue.families.find(f=>f.groups.some(g=>g.id===link.group));
  const family=link.family||owner?.family.id||record?.familyId||null;
  const restoredGroup=link.group||(!link.panel&&record?fullCatalogue.families.find(f=>f.family.id===record.familyId)?.groups.find(g=>g.records.some(r=>r.id===record.id))?.id:undefined);
  if(!geography)return;
  const restored=resolveGeography(geography,{region:link.region||[],polity:link.polity||[],place:link.city||[]});
  setFilters({...emptyFilters,...link.filters,region:restored.region,polity:restored.polity,city:restored.place});
  if(catalogueQuery){setCatalogueQuery('');setLinkNotice('已恢复链接筛选并清除目录搜索。')}else setLinkNotice('');
  setView(link.view);setCatalogueMode(link.panel?'source':'atlas');setCatalogueSource(link.panel==='related'?'__related__':link.panel==='references'?'__references__':link.node?'__tree__':null);
  setSourceNodeId(link.node||null);setCatalogueGroup(restoredGroup||null);setSelectedId(family);setCatalogueFamily(family);setCatalogueRecord(record?.id||null);setLightbox(record||null);setRelatedId(link.related||null);setSourceReturn(null);
  if(link.node)setSourceExpanded(old=>new Set([...old,...ancestorNodes(link.node!)]));
  if(family)setReveal(old=>({family,group:restoredGroup,serial:(old?.serial||0)+1}));
  if(family!==selectedId){setCollectionContext(null);setReturnCollection(null);setFullSession(null);setVariant('all');setFacet('all')}
 });


 useEffect(()=>{if(catalogueMode!=='source'||!sourceIndex||lastSourceQuery.current===catalogueQuery)return;lastSourceQuery.current=catalogueQuery;if(catalogueQuery.trim())setSourceExpanded(old=>new Set([...old,...sourceTree.nodes.keys()]))},[sourceTree,catalogueMode,catalogueQuery,sourceIndex]);
 useEffect(()=>{if(!selected)return;const local=validGallerySelection(fullSpecimens,variant,facet);if(local.group!==variant)setVariant(local.group);if(local.facet!==facet)setFacet(local.facet)},[result,selectedId]);
 const referenceGroup:SourceGroup={key:'__references__',source:'参考资料（非实际来源）',entries:sourceProjection.references,sourceCount:new Set(sourceProjection.references.map(e=>e.source.id)).size,recordCount:new Set(sourceProjection.references.map(e=>e.specimen.id)).size};
 const sourceGroup=catalogueSource==='__references__'?referenceGroup:catalogueSource==='__tree__'?(sourceNode?{key:sourceNode.id,source:sourceNode.title,entries:sourceNode.entries,sourceCount:sourceNode.sourceCount,recordCount:sourceNode.recordCount}:null):catalogueSourceGroups.find(g=>g.key===catalogueSource)||null;
 const relatedMatches=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return[];return relatedRecords.filter(r=>[r.sourceRecordId,r.title,r.reviewStatus,r.reason,r.leafCategoryTitle,...r.sourcePath.map(x=>x.title)].join(' ').toLowerCase().includes(q))},[relatedRecords,query]);
 const quickSpecimens=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return[];return matchedRecords.filter(s=>[s.title,s.sourceRecordId||'',s.catalogue,s.description,sourcePathLabel(s),...s.sources.map(x=>x.label),...s.facets].join(' ').toLowerCase().includes(q)).slice(0,6)},[result,query]);

 function chooseFamily(id:string,context?:CollectionContext){setFiltersOpen(false);setSelectedId(id);setCollectionContext(context||null);setReturnCollection(null);if(id!==selectedId){setVariant('all');setFacet('all');setFullSession(null)}if(view==='catalogue')setCatalogueFamily(id)}
 function closeFamily(){setSelectedId(null);setCollectionContext(null);setFullSession(null)}
 function returnToCollection(){if(!collectionContext)return;setSelectedId(null);setFullSession(null);setReturnCollection(old=>({context:collectionContext,serial:(old?.serial||0)+1}))}
 function showFullFamily(){if(!selected)return;const expanded={...emptyFilters,year:filters.year};setFullSession({familyId:selected.id,filters:{...filters},group:variant,facet,expandedSignature:JSON.stringify(expanded)});setFilters(expanded);setVariant('all');setFacet('all')}
 function restoreFamilyFilters(){if(!fullSession||!data)return;setFilters(fullSession.filters);setVariant(fullSession.group);setFacet(fullSession.facet);setFullSession(null)}
 function openSpecimen(s:Specimen){setLightbox(s);if(view==='catalogue'&&catalogueMode==='atlas'){setCatalogueFamily(s.familyId);setCatalogueGroup(fullCatalogue?.families.find(f=>f.family.id===s.familyId)?.groups.find(g=>g.records.some(r=>r.id===s.id))?.id||null)}}
 function toggleCompare(id:string){setCompareIds(xs=>xs.includes(id)?xs.filter(x=>x!==id):xs.length>=3?[xs[1],xs[2],id]:[...xs,id])}
 function clearFilters(){setFilters({...emptyFilters,year});setFullSession(null);setVariant('all');setFacet('all');setCatalogueQuery('')}
 const imageCount=data?.specimens.reduce((n,s)=>n+s.images.length,0)||0;
 if(!data)return <main className="boot-state"><div><Database size={30}/><p>{loadError?'Catalogue could not load. Please reload.':'Loading Central Asian Square-Hole Coinage Atlas…'}</p></div></main>;

 return <FilterLinkContext.Provider value={filterLink}><main className={'atlas-app view-'+view}>
  {navigation.error&&<div className="deep-link-notice" role="alert">{navigation.error} <button onClick={navigation.home}>返回目录</button></div>}{linkNotice&&<div className="deep-link-notice" role="status">{linkNotice}<button onClick={()=>setLinkNotice('')}>关闭提示</button></div>}
  <header className="app-header"><button className="brand-button" onClick={()=>setView('atlas')}><span className="brand-mark">◈</span><span><strong>CENTRAL ASIAN SQUARE-HOLE COINAGE ATLAS</strong><small>中亚方孔钱地图与图像资料库</small></span></button><nav>{([['atlas','Atlas'],['catalogue','Catalogue'],['research','Research']] as [View,string][]).map(([id,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}>{label}</button>)}</nav><div className="header-stats"><span>{filteredFamilies.length} families</span><b>·</b><span>{matchedRecords.length} records</span></div></header>

  <section hidden={view!=='atlas'} data-sheet-state={sheetState} className={'atlas-screen'+(selected?' has-family':'')}><div className="atlas-map-stage">
   <TerrainMap rangeControl={rangeControl} backgroundObject={backgroundObject} background={mapBackground||undefined} backgroundEnabled={backgroundFamily===selectedId&&!!selectedId} rangeFocus={rangeFocus} dateMode={dateMode} returnCollection={returnCollection} onCollectionEmpty={()=>setLinkNotice('原集合当前无匹配结果')} sourceFilter={sourceFilter} active={view==='atlas'} data={data} records={matchedRecords} families={filteredFamilies} selected={selected} onSelect={chooseFamily} year={dateMode==='year'?year:null} focus={focus}/>
   <div className="atlas-search-panel"><div className="atlas-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索类型、铭文、编号、来源…"/><button aria-label="Filters" aria-expanded={filtersOpen} aria-controls="atlas-filter-options" className={filtersOpen?'active':''} onClick={()=>setFiltersOpen(x=>!x)}><SlidersHorizontal size={16}/></button>{(query||region.length>0||polity.length>0||city.length>0||familyFilter!=='all'||sourceFilter!=='all'||inscriptionFilter!=='all'||tamghaFilter!=='all'||featureFilter!=='all'||statusFilter!=='all'||dateMode!=='all')&&<button aria-label="Clear filters" onClick={clearFilters}><X size={15}/></button>}</div>
    {filtersOpen&&<div id="atlas-filter-options" className="filter-grid">{geography&&<GeographyFilters index={geography} selection={geoSelection} counts={geoCounts} onChange={(d,values)=>setFilters(old=>({...old,[d==='place'?'city':d]:values}))} onClear={()=>setFilters(old=>({...old,region:[],polity:[],city:[]}))}/>}<label>类型家族<select value={familyFilter} onChange={e=>setFamilyFilter(e.target.value)}><option value="all">全部家族</option>{data.families.map(f=><option key={f.id} value={f.id}>{f.title}</option>)}</select></label><label>来源<select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)}><option value="all">全部来源</option>{sources.map(s=><option key={s}>{s}</option>)}</select></label><label>研究状态<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">全部状态</option>{researchStatuses.map(s=><option key={s}>{s}</option>)}</select></label>{inscriptions.length>0&&<label>铭文 / Legend<select value={inscriptionFilter} onChange={e=>setInscriptionFilter(e.target.value)}><option value="all">全部已标注铭文</option>{inscriptions.map(f=><option key={f}>{f}</option>)}</select></label>}{tamghas.length>0&&<label>Tamgha / 徽记<select value={tamghaFilter} onChange={e=>setTamghaFilter(e.target.value)}><option value="all">全部已标注徽记</option>{tamghas.map(f=><option key={f}>{f}</option>)}</select></label>}{features.length>0&&<label className="filter-wide">其他特征<select value={featureFilter} onChange={e=>setFeatureFilter(e.target.value)}><option value="all">全部其他特征</option>{features.map(f=><option key={f}>{f}</option>)}</select></label>}</div>}
    <div className="filter-result-line"><span><strong>{filteredFamilies.length}</strong> 家族 · <strong>{matchedRecords.length}</strong> 主库记录{filteredFamilies.some(f=>!f.anchor)&&<> · {filteredFamilies.filter(f=>!f.anchor).length} 家族无坐标</>}</span><button onClick={clearFilters}>清除筛选</button></div>
    <details className="filter-summary"><summary>筛选摘要</summary><p>{[query&&`搜索：${query}`,...[...region,...polity,...city].map(id=>geography?.nodes.find(n=>n.id===id)?.zh||id),familyFilter!=='all'&&familyFilter,sourceFilter!=='all'&&sourceFilter,statusFilter!=='all'&&statusFilter,inscriptionFilter!=='all'&&inscriptionFilter,tamghaFilter!=='all'&&tamghaFilter,featureFilter!=='all'&&featureFilter,dateMode==='year'?`${year} CE`:dateMode==='unknown'?'年代未知':'全部时期'].filter(Boolean).join(' · ')}</p><CopyLink link={currentLink}/></details>
    {(query||familyFilter!=='all')&&(!selected||query)&&<div className="quick-results">{filteredFamilies.slice(0,5).map(f=><button key={f.id} onClick={()=>chooseFamily(f.id)}><img src={f.image} alt=""/><span><strong>{f.title}</strong><small>{f.region} · {specimensByFamily.get(f.id)?.length||0} records</small></span><ChevronRight size={14}/></button>)}{quickSpecimens.map(s=><button key={'record-'+s.id} onClick={()=>openSpecimen(s)}><img src={s.images[0]?.path} alt=""/><span><strong>{s.sourceRecordId||s.id}</strong><small>{s.title} · {s.sourceName||sourceName(s.sources[0])}</small></span><Maximize2 size={13}/></button>)}{relatedMatches.length>0&&<button onClick={()=>{setCatalogueQuery(query);setCatalogueMode('source');setCatalogueSource('__related__');setView('catalogue')}}><span className="related-search-icon">R</span><span><strong>相关 / held / excluded</strong><small>{relatedMatches.length} 条来源记录匹配当前搜索</small></span><ChevronRight size={14}/></button>}</div>}
   </div>
   <details className="timeline-floating"><summary>年代：{dateMode==='all'?'全部时期':dateMode==='unknown'?'年代未知':`${year} CE`}</summary><div className="time-options" role="group" aria-label="年代筛选">
    <button aria-pressed={dateMode==='all'} className={dateMode==='all'?'active':''} onClick={()=>setDateMode('all')}>全部时期</button>
    <button aria-pressed={dateMode==='unknown'} className={dateMode==='unknown'?'active':''} onClick={()=>setDateMode('unknown')}>年代未知</button>
    <button aria-pressed={dateMode==='year'} className={dateMode==='year'?'active':''} onClick={()=>setDateMode('year')}>指定年份</button>
    <input aria-label="Issue date filter" aria-describedby="date-filter-note" type="range" min="200" max="1650" step="10" value={year} onChange={e=>{setYear(Number(e.target.value));setDateMode('year')}}/>
    <strong>{dateMode==='all'?'全部时期':dateMode==='unknown'?'年代未知':`${year} CE`}</strong>
    <small id="date-filter-note">按家族区间筛选；“未知”指缺少完整有效区间，不代表学术上无法断代。</small>
    {!!result?.dateAnomalies.length&&<small role="status">数据异常：{result.dateAnomalies.map(a=>a.familyId).join('、')} 的区间非法或倒置，列入未知模式待核。</small>}
   </div></details>
   {matchedRecords.length===0&&<p className="map-empty" role="status">没有匹配记录。请调整或清除筛选。</p>}
   </div>{selected&&<FamilyDrawer sheetState={sheetState} onSheetState={setSheetState} onTools={()=>{revealMap();const time=document.querySelector<HTMLDetailsElement>('.timeline-floating');if(time){time.open=true;time.querySelector('summary')?.focus({preventScroll:true})}}} mapBackground={mapBackground&&<FamilyMapBackground time={{mode:dateMode,year}} control={rangeControl} object={backgroundObject} onObject={setBackgroundObject} background={mapBackground} familyId={selected.id} enabled={backgroundFamily===selected.id} onEnabled={v=>setBackgroundFamily(v?selected.id:null)} onRange={()=>{revealMap();setBackgroundFamily(selected.id);requestAnimationFrame(()=>requestAnimationFrame(()=>setRangeFocus(n=>n+1)))}}/>} onFullFamily={showFullFamily} onRestore={fullSession?restoreFamilyFilters:undefined} fullSpecimens={fullSpecimens} onReturnCollection={collectionContext?returnToCollection:undefined} onLocate={selectedPlace?()=>setFocus(n=>n+1):undefined} sources={actualSources} sourceIndexError={sourceIndexError} family={selected} placeName={selectedPlace?.name||null} specimens={shownSpecimens} allSpecimens={selectedSpecimens} variants={selectedVariants} facets={selectedFacets} variant={variant} facet={facet} setVariant={setVariant} setFacet={setFacet} onClose={closeFamily} onCatalogue={()=>{setCatalogueMode('atlas');setCatalogueFamily(selected.id);setView('catalogue')}} onOpen={openSpecimen} onCompare={toggleCompare} compareIds={compareIds}/>}
  </section>

  {view==='catalogue'&&<section className="catalogue-page"><aside className="catalogue-tree"><div className="catalogue-title"><BookOpen size={18}/><div><strong>Catalogue</strong><small>纲目与来源目录 · 当前 Atlas 筛选同步</small></div></div><div className="catalogue-switch"><button className={catalogueMode==='atlas'?'active':''} onClick={()=>setCatalogueMode('atlas')}>Atlas 纲目</button><button className={catalogueMode==='source'?'active':''} onClick={()=>setCatalogueMode('source')}>来源目录</button></div><div className="catalogue-search"><Search size={14}/><input value={catalogueQuery} onChange={e=>setCatalogueQuery(e.target.value)} placeholder="搜索名称、编号、来源…"/></div>{catalogueMode==='atlas'?<><div className="catalogue-tree-actions"><button className="text-button" onClick={()=>setCatalogueQuery('')}>清空目录搜索</button><button className="text-button" onClick={clearFilters}>清除全部筛选</button></div>{sourceIndexError&&<p role="status">来源索引加载失败，仍可按主库ID或名称浏览。</p>}<CatalogueTreeSidebar selectedFamily={catalogueFamily} selectedGroup={catalogueGroup} reveal={reveal} onGroup={(family,group)=>{chooseFamily(family);setCatalogueGroup(group)}} tree={catalogueTree} query={catalogueQuery} selectedId={catalogueIds.has(catalogueRecord||'')?catalogueRecord:null} onFamily={id=>{chooseFamily(id);setCatalogueGroup(null);setCatalogueSource(null)}} onOpen={s=>{setCatalogueRecord(s.id);openSpecimen(s)}}/></>:<div className="tree-scroll"><button className={'special-tree-node '+(catalogueSource==='__related__'?'active':'')} onClick={()=>{setCatalogueSource('__related__');setCatalogueFamily(null)}}><span>相关 / held / excluded</span><small>{data.relatedRecords.length}</small></button>{sourceIndexError?<p role="status">来源索引加载失败；主库与相关资料仍可访问。</p>:!sourceIndex?<p role="status">来源索引加载中…</p>:<><div className="catalogue-tree-actions"><button onClick={()=>setCatalogueQuery('')}>清空目录搜索</button></div><p>{sourceTree.sourceCount} 实际来源记录 · {sourceTree.associationCount} 来源关联 · {sourceTree.recordCount} 去重主库记录</p><SourceTree roots={sourceTree.roots} expanded={sourceExpanded} selected={sourceNodeId} onToggle={id=>setSourceExpanded(old=>{const next=new Set(old);if(next.has(id))next.delete(id);else next.add(id);return next})} onSelect={id=>{setSourceNodeId(id);setCatalogueSource('__tree__');setCatalogueFamily(null)}}/><button onClick={()=>{setCatalogueSource('__references__');setCatalogueFamily(null)}}><span>参考资料 comparison / 其他非实际关系</span><small>{sourceProjection.references.length}</small></button></>}</div>}</aside>
   <div className="catalogue-content">{catalogueMode==='atlas'&&sourceReturn&&<button className="text-button" onClick={()=>{setCatalogueQuery(sourceReturn.query);setCatalogueSource(sourceReturn.selection);setSourceNodeId(sourceReturn.node);setCatalogueMode('source');setSourceReturn(null)}}>返回来源目录</button>}{catalogueMode==='atlas'?<CatalogueTreeContent selectedGroup={catalogueGroup} onCompare={toggleCompare} compareIds={compareIds} node={activeCatalogueNode} onOpen={s=>{setCatalogueRecord(s.id);openSpecimen(s)}}/>:catalogueSource==='__related__'?<RelatedGallery selectedId={relatedId} onSelect={setRelatedId} records={relatedRecords} allRecords={data.relatedRecords} filterKey={JSON.stringify(geoSelection)} query={catalogueQuery} mainRecordCount={matchedRecords.length}/>:sourceGroup?<>{catalogueSource==='__tree__'&&sourceNode&&<CopyLink link={{view:'catalogue',panel:'sources',node:sourceNode.id}}/>}{catalogueSource==='__tree__'&&sourceNode&&<SourceCoverageNote node={sourceNode} coverage={sourceCoverage}/>}<SourceCatalogue group={sourceGroup} data={data} onOpen={openSpecimen} onFamily={id=>{setSourceReturn({query:catalogueQuery,selection:catalogueSource,node:sourceNodeId});setCatalogueQuery('');setCatalogueMode('atlas');setCatalogueFamily(id);setCatalogueGroup(null);chooseFamily(id)}}/></>:<EmptyCatalogue/>}</div>
  </section>}

  {view==='research'&&<ResearchView data={data} imageCount={imageCount} sources={sources}/>}

  {compare.length>0&&<details className="compare-disclosure"><summary>已选对比 {compare.length} 条</summary><CompareTray items={compare} data={data} onRemove={toggleCompare} onClear={()=>setCompareIds([])} onOpen={openSpecimen}/></details>}
  {activeLightbox&&<SpecimenLightbox matches={viewed.matches} key={activeLightbox.id} onCompare={toggleCompare} compared={compareIds.includes(activeLightbox.id)} link={currentLink} specimen={activeLightbox} family={data.families.find(f=>f.id===activeLightbox.familyId)||null} onClose={()=>setLightbox(null)}/>}
 </main></FilterLinkContext.Provider>
}









function EmptyCatalogue(){return <div className="empty-catalogue"><BookOpen size={28}/><h1>请选择有匹配记录的目录节点</h1><p>当前选择可能已被筛掉。请从左侧重新选择，或返回 Atlas 调整筛选。</p></div>}

function ResearchView({data,imageCount,sources}:{data:Atlas;imageCount:number;sources:string[]}){const sourceCounts=Array.from(data.specimens.reduce((m,s)=>{const k=s.sourceName||sourceName(s.sources[0]);m.set(k,(m.get(k)||0)+1);return m},new Map<string,number>()).entries()).sort((a,b)=>b[1]-a[1]);return <section className="research-page"><div className="research-hero"><span className="eyebrow">RESEARCH CORPUS · CURRENT EDITION</span><h1>来源可追溯的中亚方孔钱研究资料库</h1><p>当前版本把来源资料层、研究整理层和产品展示层分开。重复、未定归属和字段缺失可以保留；主 Atlas 的收录数量不作为稀有度判断。</p></div><div className="metrics-row"><div><strong>{data.families.length}</strong><span>families</span></div><div><strong>{data.variants.length}</strong><span>source / catalogue groups</span></div><div><strong>{data.specimens.length}</strong><span>specimen records</span></div><div><strong>{imageCount}</strong><span>images</span></div><div><strong>{sources.length}</strong><span>visible source systems</span></div><div><strong>{data.relatedRecords.length}</strong><span>related / held source records</span></div></div><div className="research-columns"><article><h2>来源资料层</h2><p>每条记录保留来源链接；Zeno 记录额外保留 source record ID 和原始 breadcrumb 分类路径。Atlas 的重新分类只增加研究关系，不覆盖来源树。</p><ul><li>原始来源记录和图片持续保留</li><li>related / held / excluded 不触发原始资料删除</li><li>same-image / same-specimen 关系只在有明确证据时增加</li></ul></article><article><h2>当前地图证据</h2><p>地图已经区分展示锚点、findspot / hoard evidence 与 area layers。没有可靠 polygon 的政权或类型继续显示在 Catalogue 与搜索中，不制造疆域或流通范围。</p><ul><li>{data.evidence.length} 条结构化空间证据</li><li>{data.areas.length} 个当前 area layer records</li><li>{data.families.filter(f=>!f.anchor).length} 个 family 暂无展示锚点</li></ul></article><article><h2>下一阶段</h2><p>一期优先完善 Atlas、Catalogue、来源与已有铭文/tamgha 检索。随后按地区和专题补充 IICAS、Smirnova、Kamyshev、Zeimal、考古报告、博物馆与拍卖资料。</p><ul><li>Learning：文字系统、铭文、tamgha 与真实钱币联动</li><li>Market：拍卖记录与履历，正式建设后每四个自然月增量更新</li><li>历史 GIS：只在来源支持时加入分期 polygon</li></ul></article></div><h2 className="research-section-title">Primary source records</h2><p className="research-footnote">以下数量表示当前主库记录的主要来源，不代表独立实物数量或稀有度。</p><div className="source-coverage-grid">{sourceCounts.map(([name,count])=><div key={name}><strong>{count}</strong><span>{name}</span></div>)}</div><h2 className="research-section-title">Source coverage snapshots</h2><div className="coverage-table"><table><thead><tr><th>Scope</th><th>Source snapshot</th><th>Observed</th><th>Status</th></tr></thead><tbody>{data.scopeCensus.map((c,i)=><tr key={`${c.categoryId}-${i}`}><td>{c.title}</td><td><OutLink url={c.url}>Zeno #{c.categoryId}</OutLink></td><td>{c.sourcePhotoCount}</td><td>source snapshot</td></tr>)}</tbody></table></div><div className="research-footnote">Lady Nana snapshot: {data.coverage.importedZenoRecords}/{data.coverage.zenoRecordCount} observed Zeno records imported · {data.coverage.images} images across its current source-linked corpus. Coverage snapshots describe captured source material, not global surviving populations.</div></section>}

function CompareTray({items,data,onRemove,onClear,onOpen}:{items:Specimen[];data:Atlas;onRemove:(id:string)=>void;onClear:()=>void;onOpen:(s:Specimen)=>void}){return <div className="compare-tray"><div className="compare-head"><strong><GitCompareArrows size={15}/>Compare · {items.length}/3</strong><button onClick={onClear}>清空</button></div><div className="compare-items">{items.map(s=>{const f=data.families.find(x=>x.id===s.familyId);return <article key={s.id}><button onClick={()=>onOpen(s)}><img src={s.images[0]?.path} alt=""/></button><div><strong>{s.title}</strong><small>{f?.title}</small><span>{s.weightG!=null?`${s.weightG} g`:'—'} · {s.diameterMm!=null?`${s.diameterMm} mm`:'—'}</span><span>{s.sourceName||(s.sources[0]?sourceName(s.sources[0]):'—')} · {s.sourceRecordId||s.id}</span><span>{s.catalogue||'catalogue pending'}</span></div><button className="remove-compare" onClick={()=>onRemove(s.id)}><X size={13}/></button></article>})}</div></div>}

function SpecimenLightbox({matches,link,specimen,family,onClose,onCompare,compared}:{matches:boolean;link:DeepLink;specimen:Specimen;family:Family|null;onCompare:(id:string)=>void;compared:boolean;onClose:()=>void}){const [imageId,setImageId]=useState<string|null>(null);const image=selectedImage(specimen.images,imageId);return <DetailDialog title="主库图片详情" onClose={onClose}><ImageViewer images={specimen.images} imageId={imageId} onSelect={setImageId}/><div className="modal-info">{!matches&&<p role="status">此记录不符合当前筛选；不计入当前匹配数量。</p>}<span className="eyebrow">{family?.title}</span><h1>{specimen.title}</h1><CopyLink link={link}/><button aria-pressed={compared} onClick={()=>onCompare(specimen.id)}>{compared?'取消对比':'加入对比'}</button><div className="family-meta"><span>{specimen.weightG!=null?`${specimen.weightG} g`:'weight unknown'}</span><span>{specimen.diameterMm!=null?`${specimen.diameterMm} mm`:'size unknown'}</span><span>{specimen.sourceRecordId||specimen.id}</span></div><p>{specimen.description}</p>{specimen.catalogue&&<div className="metadata-row"><strong>Catalogue</strong><span>{specimen.catalogue}</span></div>}{specimen.coinRole&&<div className="metadata-row"><strong>Coin role</strong><span>{specimen.coinRole}</span></div>}{specimen.findContextClaim&&<div className="metadata-row"><strong>Find context</strong><span>{typeof specimen.findContextClaim==='string'?specimen.findContextClaim:[specimen.findContextClaim.rawText,specimen.findContextClaim.status,specimen.findContextClaim.note].filter(Boolean).join(' · ')}</span></div>}{specimen.sourcePath&&specimen.sourcePath.length>0&&<div className="metadata-row"><strong>Source path</strong><span>{specimen.sourcePath.map(x=>`${x.title} [${x.categoryId}]`).join(' › ')}</span></div>}<ImageProvenance image={image}/><h3>Source records</h3><div className="modal-sources">{specimen.sources.map((s,i)=><OutLink key={s.url+i} url={s.url}>{sourceName(s)} · {s.label}</OutLink>)}</div>{specimen.facets.filter(visibleFacet).length>0&&<><h3>Inscription / tamgha / features</h3><div className="facet-chips">{specimen.facets.filter(visibleFacet).map(x=><span key={x}>{x}</span>)}</div></>}</div></DetailDialog>}
