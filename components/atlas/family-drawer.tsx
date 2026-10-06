'use client';
import PaperSelect,{PaperOption} from './paper-select';
import {motion,useIsPresent} from './ui-motion';
import {motionTiming,motionEase} from '@/lib/motion';
import {familyIntroduction} from '@/lib/detail-content';
import {copyKnown,countLabel} from '@/lib/i18n';
import {familyTitle,familyCount,referenceTitle} from '@/lib/browse-copy';
import {useLanguage,useCopy} from './language';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import ArtIcon from '@/components/visual/ArtIcon';
import {sheetHeight,snapSheet,type SheetState} from '@/lib/mobile-sheet';
import {motionQuery,watchMotion} from '@/lib/motion';
import {sheetKey} from '@/lib/keyboard';
import CopyLink from './copy-link';
import type {Family,Specimen,Variant} from '@/lib/atlas';
import type {SourceEntry} from '@/lib/source-index';

type Props={sheetState?:SheetState;onSheetState?:(s:SheetState)=>void;onTools?:()=>void;mapBackground?:ReactNode;family:Family;placeName:string|null;specimens:Specimen[];allSpecimens:Specimen[];fullSpecimens:Specimen[];variants:Variant[];facets:string[];variant:string;facet:string;setVariant:(x:string)=>void;setFacet:(x:string)=>void;onClose:()=>void;onCatalogue:()=>void;onOpen:(s:Specimen)=>void;onCompare:(id:string)=>void;compareIds:string[];onFullFamily:()=>void;onRestore?:()=>void;onReturnCollection?:()=>void;onLocate?:()=>void;sources:Map<string,SourceEntry[]>;sourceIndexError:boolean};
export default function FamilyDrawer(p:Props){
 const present=useIsPresent();
 const tr=useCopy();const {locale}=useLanguage();
 const {family,specimens,allSpecimens,fullSpecimens,variants,variant,facet}=p;
 const caption=familyCount(specimens.length,fullSpecimens.length,specimens.reduce((n,s)=>n+s.images.length,0),locale);

 const sheet=useRef<HTMLElement>(null),drag=useRef<{id:number;y:number;height:number;available:number}|null>(null);
 const [dragHeight,setDragHeight]=useState<number|null>(null),[reduceMotion,setReduceMotion]=useState(false);
 useEffect(()=>watchMotion(matchMedia(motionQuery),setReduceMotion),[]);
 const state=p.sheetState||'half';
 const [mobile,setMobile]=useState(false);
 useEffect(()=>{const media=matchMedia('(max-width:760px), (max-width:1000px) and (max-height:500px)');const update=()=>setMobile(media.matches);update();media.addEventListener('change',update);return ()=>media.removeEventListener('change',update)},[]);
 const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{scroll.current?.scrollTo({top:0});if(!document.querySelector('dialog[open]'))sheet.current?.querySelector<HTMLButtonElement>('.detail-actions>button')?.focus({preventScroll:true})},[family.id]);
 useEffect(()=>{if(state==='summary'&&scroll.current?.contains(document.activeElement))sheet.current?.querySelector<HTMLElement>('.sheet-handle')?.focus({preventScroll:true})},[state]);
 // The reading sheet covers the map canvas; keep its markers out of keyboard navigation.
 useEffect(()=>{const map=sheet.current?.closest('.atlas-screen')?.querySelector<HTMLElement>('.terrain-map');if(!map)return;if(present&&mobile&&state==='reading'&&map.contains(document.activeElement))sheet.current?.querySelector<HTMLElement>('.sheet-handle')?.focus({preventScroll:true});map.inert=present&&mobile&&state==='reading';return()=>{map.inert=false}},[mobile,state,present]);
 const activeGroup=variants.find(v=>v.id===variant);
 const metadata=<div className="family-meta">{family.dateLabel&&<span>{copyKnown(family.dateLabel,locale)}</span>}{family.region&&<span>{family.region}</span>}{family.polity&&family.polity!==family.region&&<span>{family.polity}</span>}</div>;
 const navigation=<div className="drawer-secondary"><button onClick={p.onCatalogue}><ArtIcon name="book" size={14}/>{tr("目录")}</button>{!mobile&&p.onReturnCollection&&<button onClick={p.onReturnCollection}>{tr("返回此集合")}</button>}</div>;
 const location=p.placeName&&<div className="family-location"><ArtIcon name="pin" size={14}/><span>{p.placeName}</span>{p.onLocate&&<button onClick={p.onLocate}><ArtIcon name="locate" size={17}/>{tr("定位")}</button>}</div>;
 return <motion.aside initial={reduceMotion?false:{opacity:0,x:mobile?0:16,y:mobile?8:0}} animate={{opacity:1,x:0,y:0}} exit={{opacity:0,x:mobile?0:12,y:mobile?8:0,transition:{duration:reduceMotion?0:motionTiming.close/1000}}} transition={{duration:reduceMotion?0:motionTiming.panel/1000,ease:motionEase.enter}} inert={!present} aria-hidden={!present||undefined} data-exiting={!present||undefined} ref={sheet} data-sheet-state={state} style={{height:dragHeight??undefined,transition:reduceMotion||dragHeight!==null?'none':undefined,pointerEvents:present?undefined:'none'}} className="family-drawer"
 aria-label={`${tr('家族详情')} ${familyTitle(family,locale)}`}>
  {p.onSheetState&&<div className="sheet-handle" role="slider" tabIndex={0} aria-label={tr("详情面板高度")} aria-orientation="vertical" aria-valuemin={0} aria-valuemax={2} aria-valuenow={state==='summary'?0:state==='half'?1:2} aria-valuetext={state==='summary'?tr("收起摘要"):state==='half'?tr("半展开浏览"):tr("展开阅读")}
   onKeyDown={e=>{const next=sheetKey(state,e.key);if(next){e.preventDefault();p.onSheetState?.(next)}}}
   onPointerDown={e=>{if(!e.isPrimary)return;e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,y:e.clientY,height:sheet.current?.clientHeight||0,available:sheet.current?.parentElement?.clientHeight||0}}}
   onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;e.stopPropagation();setDragHeight(Math.max(sheetHeight('summary',d.available),Math.min(sheetHeight('reading',d.available),d.height+d.y-e.clientY)))}}
   onPointerUp={e=>{const d=drag.current;if(!d)return;p.onSheetState?.(snapSheet(d.height+d.y-e.clientY,d.available));drag.current=null;setDragHeight(null)}}
   onPointerCancel={()=>{drag.current=null;setDragHeight(null)}}><span/></div>}
  <header className="drawer-head family-title"><div><h1>{familyTitle(family,locale)}</h1></div><div className="detail-actions"><CopyLink label="分享家族" link={{view:'atlas',family:family.id}}/><button onClick={p.onClose} aria-label={tr("Close details")}><ArtIcon name="close" size={20}/></button></div></header>
  {p.onSheetState&&<div className="sheet-actions"><small className="sheet-summary-count">{caption}</small><div>{state!=='reading'&&<button className="sheet-expand" aria-label={tr("展开家族详情")} onClick={()=>p.onSheetState?.(state==='summary'?'half':'reading')}><ArtIcon name="chevron" size={16}/>{tr("展开")}</button>}{state!=='summary'&&<button aria-label={tr("收起家族详情")} onClick={()=>p.onSheetState?.(state==='reading'?'half':'summary')}><ArtIcon name="chevron" size={16}/>{tr("收起")}</button>}<button onClick={p.onTools}><ArtIcon name="clock" size={15}/>{tr("时间 / 地图")}</button>{p.onReturnCollection&&<button onClick={p.onReturnCollection}>{tr("返回集合")}</button>}</div></div>}

  <div ref={scroll} className="drawer-scroll">
   {metadata}
   <div className="gallery-scope"><strong>{caption}</strong>
   {p.onRestore?<button onClick={p.onRestore}>{tr("返回筛选结果")}</button>:specimens.length<fullSpecimens.length&&<button onClick={p.onFullFamily}>{tr('查看全部记录',{records:countLabel(fullSpecimens.length,'records',locale)})}</button>}
   </div>
   {(family.description||family.legend||family.question)&&<section className="family-introduction">
    {family.description&&<><h2>{tr("类型介绍")}</h2><p>{familyIntroduction(family.id,locale)}</p></>}

   </section>}
   {location}
   {navigation}
   <div className="drawer-filters"><FamilyFilter label={tr("家族来源／目录组")} value={variant} onChange={p.setVariant} caption={variant==='all'?tr(mobile?"全部来源":"全部来源／目录组"):activeGroup?.title||tr("分组待定")}><PaperOption value="all">{tr("全部来源／目录组")}</PaperOption>{variants.map(v=><PaperOption key={v.id} value={v.id}>{v.title} ({allSpecimens.filter(s=>s.variantId===v.id).length})</PaperOption>)}{fullSpecimens.some(s=>s.variantId===null)&&<PaperOption value="unassigned">{tr("分组待定")}</PaperOption>}</FamilyFilter>{p.facets.length>0&&<FamilyFilter label={tr("家族铭文／徽记／特征")} value={facet} onChange={p.setFacet} caption={facet==='all'?tr(mobile?"全部特征":"全部铭文 / 徽记 / 特征"):copyKnown(facet,locale)}><PaperOption value="all">{tr("全部铭文 / 徽记 / 特征")}</PaperOption>{p.facets.map(f=><PaperOption key={f} value={f}>{copyKnown(f,locale)}</PaperOption>)}</FamilyFilter>}</div>
   <div className="drawer-gallery">{specimens.map(s=><article key={s.id} className="specimen-tile"><button className="specimen-image" onClick={()=>p.onOpen(s)} aria-label={`${tr('打开图片')} ${s.title}`}>
    {s.images[0]?<img src={s.images[0].path} alt={s.title} loading="lazy" onError={e=>{e.currentTarget.hidden=true}}/>:<small>{tr("图片未记录，仍可查看详情")}</small>}<span><ArtIcon name="expand" size={12}/><span className="photo-action-label">{tr("图片详情")}</span></span>
   </button><div className="specimen-copy"><strong>{s.title}</strong><small>{[s.weightG!=null?`${s.weightG} g`:null,s.diameterMm!=null?`${s.diameterMm} mm`:null].filter(Boolean).join(' · ')}</small>
   <details className="tile-sources"><summary>{tr("来源")}</summary><div className="tile-source-list">{p.sources.get(s.id)?.map(e=><a key={e.source.id} href={e.source.urls[0]} target="_blank" rel="noreferrer" aria-label={`${e.source.provider} ${e.source.recordKey}`}>{e.source.provider}{e.source.identityStatus!=='resolved'?tr('（待解析）'):''}</a>)||<small>{p.sourceIndexError?tr("来源索引加载失败；原始来源见详情"):tr("来源索引加载中")}</small>}{s.images[0]?.credit&&<small>{tr("图片署名")} · {s.images[0].credit}</small>}</div></details></div></article>)}</div>
   {!specimens.length&&<p role="status">{tr("没有符合条件的记录。")}<button onClick={()=>{p.setVariant('all');p.setFacet('all')}}>{tr("清除家族内筛选")}</button></p>}
   {family.legend&&<details className="research-block"><summary>{tr("铭文 / Inscription")}</summary><p className="inscription">{family.legend}</p>{family.legendNote&&<p>{copyKnown(family.legendNote,locale)}</p>}</details>}
   {family.question&&<details className="research-block"><summary>{tr("研究问题")}</summary><p>{copyKnown(family.question,locale)}</p></details>}
   {p.mapBackground}
   {(family.publications.length>0||family.anchor?.note||activeGroup?.description)&&<details className="research-block"><summary>{tr("资料与方法")}</summary>
    {activeGroup?.description&&<p>{activeGroup.description}</p>}
    {family.description&&familyIntroduction(family.id,locale)!==family.description&&<details><summary>{tr("类型介绍原文")}</summary><p>{family.description}</p></details>}
    {family.publications.map(pub=><div className="publication" key={pub.url}><a href={pub.url} target="_blank" rel="noreferrer">{referenceTitle(pub.title,locale)}</a><small>{copyKnown(pub.role,locale)}</small></div>)}
    {family.anchor?.note&&<p>{family.anchor.note}</p>}
   </details>}

  </div>
 </motion.aside>
}

function FamilyFilter(p:{label:string;value:string;caption:string;onChange:(value:string)=>void;children:ReactNode}){
 return <PaperSelect className="drawer-filter" {...p}/>;
}
