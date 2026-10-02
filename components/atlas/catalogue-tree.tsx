'use client';
import {useCopy,useLanguage} from './language';
import {countLabel} from '@/lib/i18n';
import {useEffect,useRef,useState} from 'react';
import {catalogueGroupTitle,familyTitle,catalogueExpansion} from '@/lib/browse-copy';
import CopyLink from './copy-link';
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
  <p>{countLabel(tree.families.length,'families',locale)} · {countLabel(tree.recordCount,'records',locale)}</p>
  <details><summary>{tr("目录说明")}</summary><p>{tr("来源/目录组不是已审定 variant；major type / variant 尚未审定。")}</p></details>
  {!tree.recordCount&&<p role="status">{tr("没有匹配的主库记录。请清空目录搜索或调整筛选。")}</p>}
  {tree.families.map(f=><div key={f.id}>
   <button className={selectedFamily===f.family.id?'active':''} data-tree-id={f.id} aria-expanded={expanded.has(f.id)} aria-label={tr("家族 {name}",{name:familyTitle(f.family,locale)})} onClick={()=>{toggle(f.id);onFamily(f.family.id)}}><span>{expanded.has(f.id)?'▾':'▸'} {familyTitle(f.family,locale)}</span><small>{countLabel(f.recordCount,'records',locale)}</small></button>
   {expanded.has(f.id)&&<div className="atlas-tree-groups">{f.groups.map(g=><div key={g.id}>
    <button className={selectedGroup===g.id?'active':''} data-tree-id={g.id} aria-expanded={expanded.has(g.id)} aria-label={tr("目录组 {name}",{name:catalogueGroupTitle(g,locale)})} onClick={()=>{toggle(g.id);onGroup(f.family.id,g.id)}}><span>{expanded.has(g.id)?'▾':'▸'} {catalogueGroupTitle(g,locale)}</span><small>{countLabel(g.recordCount,'records',locale)}</small></button>
    {expanded.has(g.id)&&<div className="atlas-tree-records">{g.records.map(item=><button key={item.id} className={selectedId===item.id?'active':''} aria-label={tr("记录 {id}",{id:item.id})} onClick={()=>{onFamily(f.family.id);onOpen(item.record)}}><span>{item.id} · {item.record.title}</span></button>)}</div>}
   </div>)}</div>}
  </div>)}
 </div>;
}

export function CatalogueTreeContent({node,onOpen,onCompare,compareIds,selectedGroup}:{selectedGroup:string|null;node:CatalogueFamily|undefined;onOpen:(record:Specimen)=>void;onCompare:(id:string)=>void;compareIds:readonly string[]}) {
 const tr=useCopy();const {locale}=useLanguage();
 const content=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(selectedGroup)Array.from(content.current?.querySelectorAll<HTMLElement>('[data-group-id]')||[]).find(el=>el.dataset.groupId===selectedGroup)?.scrollIntoView({block:'start'})},[selectedGroup]);
 if(!node)return <div className="empty-state"><h1>{tr("Atlas 钱币纲目")}</h1><p>{tr("从左侧展开家族、来源/目录组和记录。所有时期的无年代、无坐标记录仍可访问；数量表示主库记录。")}</p></div>;
 return <div ref={content}><h1>{familyTitle(node.family,locale)}</h1><CopyLink link={{view:'catalogue',family:node.family.id}}/><p className="family-zh">{node.family.zh}</p><p>{node.family.description}</p>{node.family.question&&<div className="question-note">{node.family.question}</div>}<p>{node.family.dateLabel} · {tr("地域")}：{node.family.region||tr("未明确")} · {tr("政权")}：{node.family.polity||tr("未明确")}</p><p>{countLabel(node.recordCount,'records',locale)}</p>
 {node.groups.map(g=><section key={g.id} data-group-id={g.id} className="group-list"><h2>{catalogueGroupTitle(g,locale)} · {countLabel(g.recordCount,'records',locale)}</h2><CopyLink link={{view:'catalogue',family:node.family.id,group:g.id}}/><small>{g.group?.id||g.id}</small>{g.group?.description&&<p>{g.group.description}</p>}<div className="catalogue-gallery atlas-tree-gallery">{g.records.map(item=><article key={item.id} className="specimen-tile">
  <button className="specimen-image" onClick={()=>onOpen(item.record)} aria-label={tr("打开记录 {id}",{id:item.id})}><img src={item.record.images[0]?.path} loading="lazy" alt={item.record.title}/></button>
  <div className="specimen-copy"><strong>{item.id} · {item.record.title}</strong><p>{tr("重量")}：{item.record.weightG!=null?`${item.record.weightG} g`:tr("未记录")} · {tr("直径")}：{item.record.diameterMm!=null?`${item.record.diameterMm} mm`:tr("未记录")}</p><div className="tile-actions"><button className={compareIds.includes(item.id)?'active':''} aria-pressed={compareIds.includes(item.id)} onClick={()=>onCompare(item.id)}>{compareIds.includes(item.id)?tr("取消对比"):tr("加入对比")}</button></div><p>{tr("实际来源")}：</p>{item.sources.length?item.sources.map(({source})=><p key={source.id}>{source.provider} · {source.identityStatus==='resolved'?source.recordKey:tr("编号待解析")} {source.urls.map(url=><a key={url} href={url} target="_blank" rel="noreferrer">{tr("来源")} ↗ </a>)}</p>):<p>{tr("来源索引未加载或未记录")}</p>}</div>
 </article>)}</div></section>)}</div>;
}
