'use client';
import {useCopy,useLanguage} from './language';
import {countLabel,copyKnown} from '@/lib/i18n';
import {useEffect,useRef,useState} from 'react';
import {catalogueGroupTitle,familyTitle,catalogueExpansion,familyDescription} from '@/lib/browse-copy';
import ArtIcon from '@/components/visual/ArtIcon';
import BrowseCoinImage from '@/components/visual/BrowseCoinImage';
import type {Specimen} from '@/lib/atlas';
import type {CatalogueTree,CatalogueFamily} from '@/lib/catalogue-tree';

export function CatalogueTreeSidebar({tree,query,onFamily,onGroup,onOpen,selectedId,reveal,selectedFamily,selectedGroup}:{selectedFamily:string|null;selectedGroup:string|null;reveal:{family:string;group?:string;serial:number}|null;onGroup:(family:string,group:string)=>void;tree:CatalogueTree;query:string;onFamily:(id:string)=>void;onOpen:(record:Specimen)=>void;selectedId:string|null}) {
 const tr=useCopy();const {locale}=useLanguage();
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!reveal)return;setExpanded(old=>new Set([...old,'taxonomy:family:'+reveal.family,...(reveal.group?[reveal.group]:[])]));},[reveal]);
 useEffect(()=>{if(!reveal)return;const target=reveal.group||'taxonomy:family:'+reveal.family;const frame=requestAnimationFrame(()=>{Array.from(container.current?.querySelectorAll<HTMLElement>('[data-tree-id]')||[]).find(el=>el.dataset.treeId===target)?.scrollIntoView({block:'nearest'})});return()=>cancelAnimationFrame(frame)},[reveal]);
 const ancestors=tree.families.flatMap(f=>[f.id,...f.groups.map(g=>g.id)]);
 const searchReveal=query+'|'+ancestors.join('|');
 const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(query.trim()?ancestors:[]));
 const [previousQuery,setPreviousQuery]=useState(searchReveal);
 // Reveal only necessary search ancestors without erasing unrelated expanded nodes.
 if(previousQuery!==searchReveal){
  setPreviousQuery(searchReveal);
  setExpanded(old=>catalogueExpansion(old,previousQuery,searchReveal,query,ancestors));
 }
 const toggle=(id:string)=>setExpanded(old=>{const next=new Set(old);if(next.has(id))next.delete(id);else next.add(id);return next});
 return <div ref={container} className="tree-scroll atlas-record-tree">
  <div className="tree-overview"><p>{countLabel(tree.families.length,'families',locale)} · {countLabel(tree.recordCount,'records',locale)}</p><details><summary aria-label={tr("目录说明")} title={tr("目录说明")}><ArtIcon name="info" collection="r3" size={17}/></summary><p>{tr("来源/目录组不是已审定 variant；major type / variant 尚未审定。")}</p></details></div>
  {!tree.recordCount&&<p role="status">{tr("没有匹配的主库记录。请清空目录搜索或调整筛选。")}</p>}
  {tree.families.map(f=><div key={f.id}>
   <button className={selectedFamily===f.family.id?'active':''} data-tree-id={f.id} aria-expanded={expanded.has(f.id)} aria-label={tr("家族 {name}",{name:familyTitle(f.family,locale)})} onClick={()=>{toggle(f.id);onFamily(f.family.id)}}><span><ArtIcon name="chevron" collection="r3" size={14} className={expanded.has(f.id)?'node-chevron expanded':'node-chevron'}/>{familyTitle(f.family,locale)}</span><small>{countLabel(f.recordCount,'records',locale)}</small></button>
   {expanded.has(f.id)&&<div className="atlas-tree-groups">{f.groups.map(g=><div key={g.id}>
    <button className={selectedGroup===g.id?'active':''} data-tree-id={g.id} aria-expanded={expanded.has(g.id)} aria-label={tr("目录组 {name}",{name:catalogueGroupTitle(g,locale)})} onClick={()=>{toggle(g.id);onGroup(f.family.id,g.id)}}><span><ArtIcon name="chevron" collection="r3" size={12} className={expanded.has(g.id)?'node-chevron expanded':'node-chevron'}/>{catalogueGroupTitle(g,locale)}</span><small>{countLabel(g.recordCount,'records',locale)}</small></button>
    {expanded.has(g.id)&&<div className="atlas-tree-records">{g.records.map(item=><button key={item.id} className={selectedId===item.id?'active':''} aria-label={tr("记录 {id}",{id:item.id})} onClick={()=>{onFamily(f.family.id);onOpen(item.record)}}><span>{item.record.title}</span></button>)}</div>}
   </div>)}</div>}
  </div>)}
 </div>;
}

export function CatalogueTreeContent({node,onOpen,onCompare,compareIds,selectedGroup}:{selectedGroup:string|null;node:CatalogueFamily|undefined;onOpen:(record:Specimen)=>void;onCompare:(id:string)=>void;compareIds:readonly string[]}) {
 const tr=useCopy();const {locale}=useLanguage();
 const content=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(selectedGroup)Array.from(content.current?.querySelectorAll<HTMLElement>('[data-group-id]')||[]).find(el=>el.dataset.groupId===selectedGroup)?.scrollIntoView({block:'start'})},[selectedGroup]);
 if(!node)return <div className="empty-state"><h1>{tr("Atlas 钱币纲目")}</h1><p>{tr("从左侧展开家族、来源/目录组和记录。所有时期的无年代、无坐标记录仍可访问；数量表示主库记录。")}</p></div>;
 return <div ref={content} className="catalogue-family-content"><header className="catalogue-family-heading"><h1>{familyTitle(node.family,locale)}</h1><p className="browse-date">{copyKnown(node.family.dateLabel,locale)} · {node.family.region||tr("未明确")} · {node.family.polity||tr("未明确")}</p></header>
 {node.groups.map(g=><section key={g.id} data-group-id={g.id} className="group-list"><div className="group-heading"><ArtIcon name="rosette" collection="r3" size={28}/><h2>{catalogueGroupTitle(g,locale)}</h2><span>{countLabel(g.recordCount,'records',locale)}</span>{g.group?.description&&<details className="browse-notes group-info"><summary aria-label={tr("目录组说明")} title={tr("目录组说明")}><ArtIcon name="info" collection="r3" size={18}/></summary><p>{g.group.description}</p></details>}</div><div className="catalogue-gallery atlas-tree-gallery">{g.records.map(item=><article key={item.id} className="browse-card">
  <button className="browse-image" onClick={()=>onOpen(item.record)} aria-label={tr("打开记录 {id}",{id:item.id})}><BrowseCoinImage key={item.record.images[0]?.id||item.id} path={item.record.images[0]?.path} title={item.record.title}/></button>
  <div className="browse-card-copy"><strong>{item.record.title}</strong><p className="browse-measure">{[item.record.weightG!=null?`${item.record.weightG} g`:null,item.record.diameterMm!=null?`${item.record.diameterMm} mm`:null].filter(Boolean).join(" · ")}</p>{item.sources.length?item.sources.map(({source})=><div key={source.id} className="browse-source-links">{source.identityStatus!=='resolved'&&<small>{tr("编号待解析")}</small>}{source.urls.map(url=><a key={url} href={url} target="_blank" rel="noreferrer" aria-label={`${source.provider} ${source.recordKey}`}>{item.sources.length===1?tr("打开原始记录"):source.provider}<ArtIcon name="external" collection="r3" size={15}/></a>)}</div>):<p>{tr("来源索引未加载或未记录")}</p>}</div>
 </article>)}</div></section>)}<details className="browse-notes"><summary>{tr("家族说明与研究问题")}</summary><p>{countLabel(node.recordCount,'records',locale)}</p><p>{familyDescription(node.family.description,locale)}</p>{familyDescription(node.family.description,locale)!==node.family.description&&<details><summary>{tr("类型介绍原文")}</summary><p>{node.family.description}</p></details>}{node.family.question&&<p>{node.family.question}</p>}</details></div>;
}
