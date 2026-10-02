'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {X,MapPin,BookOpen,Maximize2,GitCompareArrows,ChevronUp,ChevronDown,Clock3} from 'lucide-react';
import {sheetHeight,snapSheet,type SheetState} from '@/lib/mobile-sheet';
import {galleryCaption} from '@/lib/gallery-presentation';
import {sheetKey} from '@/lib/keyboard';
import CopyLink from './copy-link';
import type {Family,Specimen,Variant} from '@/lib/atlas';
import type {SourceEntry} from '@/lib/source-index';

type Props={sheetState?:SheetState;onSheetState?:(s:SheetState)=>void;onTools?:()=>void;mapBackground?:ReactNode;family:Family;placeName:string|null;specimens:Specimen[];allSpecimens:Specimen[];fullSpecimens:Specimen[];variants:Variant[];facets:string[];variant:string;facet:string;setVariant:(x:string)=>void;setFacet:(x:string)=>void;onClose:()=>void;onCatalogue:()=>void;onOpen:(s:Specimen)=>void;onCompare:(id:string)=>void;compareIds:string[];onFullFamily:()=>void;onRestore?:()=>void;onReturnCollection?:()=>void;onLocate?:()=>void;sources:Map<string,SourceEntry[]>;sourceIndexError:boolean};
export default function FamilyDrawer(p:Props){
 const {family,specimens,allSpecimens,fullSpecimens,variants,variant,facet}=p;
 const sheet=useRef<HTMLElement>(null),drag=useRef<{id:number;y:number;height:number;available:number}|null>(null);
 const [dragHeight,setDragHeight]=useState<number|null>(null);
 const state=p.sheetState||'half';
 const [mobile,setMobile]=useState(false);
 useEffect(()=>{const media=matchMedia('(max-width:760px), (max-width:1000px) and (max-height:500px)');const update=()=>setMobile(media.matches);update();media.addEventListener('change',update);return ()=>media.removeEventListener('change',update)},[]);
 const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{scroll.current?.scrollTo({top:0});if(!document.querySelector('dialog[open]'))sheet.current?.querySelector<HTMLButtonElement>('.family-title>button')?.focus({preventScroll:true})},[family.id]);
 useEffect(()=>{if(state==='summary'&&scroll.current?.contains(document.activeElement))sheet.current?.querySelector<HTMLElement>('.sheet-handle')?.focus({preventScroll:true})},[state]);
 const activeGroup=variants.find(v=>v.id===variant);
 const overview=<>   <div className="drawer-secondary"><CopyLink link={{view:'atlas',family:family.id}}/><button onClick={p.onCatalogue}><BookOpen size={14}/>目录</button>{p.onReturnCollection&&<button onClick={p.onReturnCollection}>返回此集合</button>}</div>
   <div className="family-meta"><span>{family.dateLabel||'年代未记录'}</span><span>{family.region||'地区未记录'}</span><span>{family.polity||'政权未记录'}</span><span className="family-research-status">{family.status}</span></div>
   <div className="family-location"><MapPin size={14}/><span>{p.placeName||'位置未记录'} · {family.anchor?.role||'位置角色未记录'}</span>{p.onLocate?<button onClick={p.onLocate}>定位</button>:<span>暂无地图定位</span>}</div>
</>;
 return <aside ref={sheet} data-sheet-state={state} style={dragHeight===null?undefined:{height:dragHeight}} className="family-drawer"
 aria-label={`家族详情 ${family.title}`}>
  {p.onSheetState&&<div className="sheet-handle" role="slider" tabIndex={0} aria-label="详情面板高度" aria-valuemin={0} aria-valuemax={2} aria-valuenow={state==='summary'?0:state==='half'?1:2} aria-valuetext={state==='summary'?'收起摘要':state==='half'?'半展开浏览':'展开阅读'}
   onKeyDown={e=>{const next=sheetKey(state,e.key);if(next){e.preventDefault();p.onSheetState?.(next)}}}
   onPointerDown={e=>{if(!e.isPrimary)return;e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,y:e.clientY,height:sheet.current?.clientHeight||0,available:sheet.current?.parentElement?.clientHeight||0}}}
   onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;e.stopPropagation();setDragHeight(Math.max(sheetHeight('summary',d.available),Math.min(sheetHeight('reading',d.available),d.height+d.y-e.clientY)))}}
   onPointerUp={e=>{const d=drag.current;if(!d)return;p.onSheetState?.(snapSheet(d.height+d.y-e.clientY,d.available));drag.current=null;setDragHeight(null)}}
   onPointerCancel={()=>{drag.current=null;setDragHeight(null)}}><span/></div>}
  <header className="drawer-head family-title"><div><h1>{family.title}</h1>{family.zh&&<p>{family.zh}</p>}</div><button onClick={p.onClose} aria-label="Close details"><X size={20}/></button></header>
  {p.onSheetState&&<div className="sheet-actions"><small className="sheet-summary-count">{galleryCaption(specimens,fullSpecimens.length)}</small><div>{state!=='reading'&&<button aria-label="展开家族详情" onClick={()=>p.onSheetState?.(state==='summary'?'half':'reading')}><ChevronUp size={16}/>展开</button>}{state!=='summary'&&<button aria-label="收起家族详情" onClick={()=>p.onSheetState?.(state==='reading'?'half':'summary')}><ChevronDown size={16}/>收起</button>}<button onClick={p.onTools}><Clock3 size={15}/>时间 / 地图</button>{p.onReturnCollection&&<button onClick={p.onReturnCollection}>返回集合</button>}</div></div>}

  <div ref={scroll} className="drawer-scroll">
   {!mobile&&overview}
   <div className="gallery-scope"><strong>{galleryCaption(specimens,fullSpecimens.length)}</strong>
   {p.onRestore?<button onClick={p.onRestore}>返回筛选结果</button>:specimens.length<fullSpecimens.length&&<button onClick={p.onFullFamily}>查看全部 {fullSpecimens.length} 条</button>}
   </div>
   <div className="drawer-filters"><select aria-label="家族来源／目录组" value={variant} onChange={e=>p.setVariant(e.target.value)}><option value="all">全部来源／目录组</option>{variants.map(v=><option key={v.id} value={v.id}>{v.title} ({allSpecimens.filter(s=>s.variantId===v.id).length})</option>)}{fullSpecimens.some(s=>s.variantId===null)&&<option value="unassigned">分组待定</option>}</select>{p.facets.length>0&&<select aria-label="家族铭文／徽记／特征" value={facet} onChange={e=>p.setFacet(e.target.value)}><option value="all">全部铭文 / 徽记 / 特征</option>{p.facets.map(f=><option key={f}>{f}</option>)}</select>}</div>
   <div className="drawer-gallery">{specimens.map(s=><article key={s.id} className="specimen-tile"><button className="specimen-image" onClick={()=>p.onOpen(s)} aria-label={`打开图片 ${s.id}`}>
    {s.images[0]?<img src={s.images[0].path} alt={s.title} loading="lazy" onError={e=>{e.currentTarget.hidden=true}}/>:<small>图片未记录，仍可查看详情</small>}<span><Maximize2 size={12}/><span className="photo-action-label">图片详情</span></span>
   </button><div className="specimen-copy"><strong>{s.title}</strong><small>{s.id} · {s.weightG==null?'重量未记录':`${s.weightG} g`} · {s.diameterMm==null?'直径未记录':`${s.diameterMm} mm`}</small>
   <div className="tile-source-list">{p.sources.get(s.id)?.map(e=><a key={e.source.id} href={e.source.urls[0]} target="_blank" rel="noreferrer">{e.source.provider} · {e.source.recordKey}{e.source.identityStatus!=='resolved'?'（待解析）':''}</a>)||<small>{p.sourceIndexError?'来源索引加载失败；原始来源见详情':'来源索引加载中'}</small>}</div>
   <div className="tile-actions"><button aria-pressed={p.compareIds.includes(s.id)} onClick={()=>p.onCompare(s.id)}><GitCompareArrows size={13}/>{p.compareIds.includes(s.id)?'取消对比':'对比'}</button></div></div></article>)}</div>
   {!specimens.length&&<p role="status">没有符合条件的记录。<button onClick={()=>{p.setVariant('all');p.setFacet('all')}}>清除家族内筛选</button></p>}
   {mobile&&overview}
   {p.mapBackground}
   <details className="research-block"><summary>家族说明与研究问题</summary><p>来源／目录组不等同于已审定学术 variant。</p><p>{family.description}</p>{family.question&&<div className="question-note">{family.question}</div>}{family.anchor&&<p>{family.anchor.note}</p>}</details>
   {activeGroup&&<details className="research-block"><summary>目录组说明 · {activeGroup.title}</summary><p>{activeGroup.status} · {activeGroup.reference}</p><p>{activeGroup.description}</p></details>}
   <details className="research-block"><summary>铭文、文献与来源</summary>{family.legend&&<><h3>铭文 / Inscription</h3><p className="inscription">{family.legend}</p><p>{family.legendNote}</p></>}{family.publications.map(pub=><div className="publication" key={pub.url}><a href={pub.url} target="_blank" rel="noreferrer">{pub.title}</a><small>{pub.role}</small></div>)}</details>
  </div>
 </aside>
}
