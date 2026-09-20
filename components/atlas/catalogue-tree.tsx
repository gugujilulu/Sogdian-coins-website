'use client';
import {useState} from 'react';
import type {Specimen} from '@/lib/atlas';
import type {CatalogueTree,CatalogueFamily} from '@/lib/catalogue-tree';

export function CatalogueTreeSidebar({tree,query,onFamily,onOpen,selectedId}:{tree:CatalogueTree;query:string;onFamily:(id:string)=>void;onOpen:(record:Specimen)=>void;selectedId:string|null}) {
 const ancestors=tree.families.flatMap(f=>[f.id,...f.groups.map(g=>g.id)]);
 const reveal=query+'|'+ancestors.join('|');
 const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(query.trim()?ancestors:[]));
 const [previousQuery,setPreviousQuery]=useState(reveal);
 // Reveal only necessary search ancestors without erasing unrelated expanded nodes.
 if(previousQuery!==reveal){
  setPreviousQuery(reveal);
  if(query.trim())setExpanded(old=>new Set([...old,...ancestors]));
 }
 const toggle=(id:string)=>setExpanded(old=>{const next=new Set(old);if(next.has(id))next.delete(id);else next.add(id);return next});
 return <div className="tree-scroll atlas-record-tree">
  <p>{tree.families.length} 家族 · {tree.recordCount} 主库记录</p>
  <p>来源/目录组不是已审定 variant；major type / variant 尚未审定。</p>
  {!tree.recordCount&&<p role="status">没有匹配的主库记录。请清空目录搜索或调整筛选。</p>}
  {tree.families.map(f=><div key={f.id}>
   <button aria-expanded={expanded.has(f.id)} aria-label={`家族 ${f.family.title}`} onClick={()=>{toggle(f.id);onFamily(f.family.id)}}><span>{expanded.has(f.id)?'▾':'▸'} {f.family.title}</span><small>{f.recordCount} 条</small></button>
   {expanded.has(f.id)&&<div className="atlas-tree-groups">{f.groups.map(g=><div key={g.id}>
    <button aria-expanded={expanded.has(g.id)} aria-label={`目录组 ${g.title}`} onClick={()=>toggle(g.id)}><span>{expanded.has(g.id)?'▾':'▸'} {g.title}</span><small>{g.recordCount} 条</small></button>
    {expanded.has(g.id)&&<div className="atlas-tree-records">{g.records.map(item=><button key={item.id} className={selectedId===item.id?'active':''} aria-label={`记录 ${item.id}`} onClick={()=>{onFamily(f.family.id);onOpen(item.record)}}><span>{item.id} · {item.record.title}</span></button>)}</div>}
   </div>)}</div>}
  </div>)}
 </div>;
}

export function CatalogueTreeContent({node,onOpen}:{node:CatalogueFamily|undefined;onOpen:(record:Specimen)=>void}) {
 if(!node)return <div className="empty-state"><h1>Atlas 钱币纲目</h1><p>从左侧展开家族、来源/目录组和记录。所有时期的无年代、无坐标记录仍可访问；数量表示主库记录。</p></div>;
 return <><h1>{node.family.title}</h1><p>{node.family.dateLabel} · 地域：{node.family.region||'未明确'} · 政权：{node.family.polity||'未明确'}</p><p>{node.recordCount} 条当前匹配主库记录。来源/目录组不是已审定学术 variant。</p>
 {node.groups.map(g=><section key={g.id} className="group-list"><h2>{g.title} · {g.recordCount} 条</h2><small>{g.group?.id||g.id}</small><div className="catalogue-gallery atlas-tree-gallery">{g.records.map(item=><article key={item.id} className="specimen-tile">
  <button className="specimen-image" onClick={()=>onOpen(item.record)} aria-label={`图片详情 ${item.id}`}><img src={item.record.images[0]?.path} loading="lazy" alt={item.record.title}/></button>
  <div className="specimen-copy"><strong>{item.id} · {item.record.title}</strong><p>实际来源：</p>{item.sources.length?item.sources.map(({source})=><p key={source.id}>{source.provider} · {source.identityStatus==='resolved'?source.recordKey:'编号待解析'} {source.urls.map(url=><a key={url} href={url} target="_blank" rel="noreferrer">来源 ↗ </a>)}</p>):<p>来源索引未加载或未记录</p>}</div>
 </article>)}</div></section>)}</>;
}
