'use client';
import {useEffect,useRef,useState} from 'react';
import CopyLink from './copy-link';
import type {Specimen} from '@/lib/atlas';
import type {CatalogueTree,CatalogueFamily} from '@/lib/catalogue-tree';

export function CatalogueTreeSidebar({tree,query,onFamily,onGroup,onOpen,selectedId,reveal}:{reveal:{family:string;group?:string;serial:number}|null;onGroup:(family:string,group:string)=>void;tree:CatalogueTree;query:string;onFamily:(id:string)=>void;onOpen:(record:Specimen)=>void;selectedId:string|null}) {
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
  if(query.trim())setExpanded(old=>new Set([...old,...ancestors]));
 }
 const toggle=(id:string)=>setExpanded(old=>{const next=new Set(old);if(next.has(id))next.delete(id);else next.add(id);return next});
 return <div ref={container} className="tree-scroll atlas-record-tree">
  <p>{tree.families.length} 家族 · {tree.recordCount} 主库记录</p>
  <p>来源/目录组不是已审定 variant；major type / variant 尚未审定。</p>
  {!tree.recordCount&&<p role="status">没有匹配的主库记录。请清空目录搜索或调整筛选。</p>}
  {tree.families.map(f=><div key={f.id}>
   <button data-tree-id={f.id} aria-expanded={expanded.has(f.id)} aria-label={`家族 ${f.family.title}`} onClick={()=>{toggle(f.id);onFamily(f.family.id)}}><span>{expanded.has(f.id)?'▾':'▸'} {f.family.title}</span><small>{f.recordCount} 条</small></button>
   {expanded.has(f.id)&&<div className="atlas-tree-groups">{f.groups.map(g=><div key={g.id}>
    <button data-tree-id={g.id} aria-expanded={expanded.has(g.id)} aria-label={`目录组 ${g.title}`} onClick={()=>{toggle(g.id);onGroup(f.family.id,g.id)}}><span>{expanded.has(g.id)?'▾':'▸'} {g.title}</span><small>{g.recordCount} 条</small></button>
    {expanded.has(g.id)&&<div className="atlas-tree-records">{g.records.map(item=><button key={item.id} className={selectedId===item.id?'active':''} aria-label={`记录 ${item.id}`} onClick={()=>{onFamily(f.family.id);onOpen(item.record)}}><span>{item.id} · {item.record.title}</span></button>)}</div>}
   </div>)}</div>}
  </div>)}
 </div>;
}

export function CatalogueTreeContent({node,onOpen,onCompare,compareIds,selectedGroup}:{selectedGroup:string|null;node:CatalogueFamily|undefined;onOpen:(record:Specimen)=>void;onCompare:(id:string)=>void;compareIds:readonly string[]}) {
 const content=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(selectedGroup)Array.from(content.current?.querySelectorAll<HTMLElement>('[data-group-id]')||[]).find(el=>el.dataset.groupId===selectedGroup)?.scrollIntoView({block:'start'})},[selectedGroup]);
 if(!node)return <div className="empty-state"><h1>Atlas 钱币纲目</h1><p>从左侧展开家族、来源/目录组和记录。所有时期的无年代、无坐标记录仍可访问；数量表示主库记录。</p></div>;
 return <div ref={content}><h1>{node.family.title}</h1><CopyLink link={{view:'catalogue',family:node.family.id}}/><p className="family-zh">{node.family.zh}</p><p>{node.family.description}</p>{node.family.question&&<div className="question-note">{node.family.question}</div>}<p>{node.family.dateLabel} · 地域：{node.family.region||'未明确'} · 政权：{node.family.polity||'未明确'}</p><p>{node.recordCount} 条当前匹配主库记录。来源/目录组不是已审定学术 variant。</p>
 {node.groups.map(g=><section key={g.id} data-group-id={g.id} className="group-list"><h2>{g.title} · {g.recordCount} 条</h2><CopyLink link={{view:'catalogue',family:node.family.id,group:g.id}}/><small>{g.group?.id||g.id}</small>{g.group?.description&&<p>{g.group.description}</p>}<div className="catalogue-gallery atlas-tree-gallery">{g.records.map(item=><article key={item.id} className="specimen-tile">
  <button className="specimen-image" onClick={()=>onOpen(item.record)} aria-label={`图片详情 ${item.id}`}><img src={item.record.images[0]?.path} loading="lazy" alt={item.record.title}/></button>
  <div className="specimen-copy"><strong>{item.id} · {item.record.title}</strong><p>重量：{item.record.weightG!=null?`${item.record.weightG} g`:'未记录'} · 直径：{item.record.diameterMm!=null?`${item.record.diameterMm} mm`:'未记录'}</p><div className="tile-actions"><button className={compareIds.includes(item.id)?'active':''} aria-pressed={compareIds.includes(item.id)} onClick={()=>onCompare(item.id)}>{compareIds.includes(item.id)?'取消对比':'加入对比'}</button></div><p>实际来源：</p>{item.sources.length?item.sources.map(({source})=><p key={source.id}>{source.provider} · {source.identityStatus==='resolved'?source.recordKey:'编号待解析'} {source.urls.map(url=><a key={url} href={url} target="_blank" rel="noreferrer">来源 ↗ </a>)}</p>):<p>来源索引未加载或未记录</p>}</div>
 </article>)}</div></section>)}</div>;
}
