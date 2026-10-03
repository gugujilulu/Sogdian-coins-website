'use client';
import {useCopy,useLanguage} from './language';
import {countLabel,copyKnown} from '@/lib/i18n';
import {useEffect,useRef} from 'react';
import ArtIcon from '@/components/visual/ArtIcon';
import {sourceNodeTitle} from '@/lib/browse-copy';
import type {SourceTreeNode,SourceCoverage} from '@/lib/source-tree';
import {coverageFor} from '@/lib/source-tree';
export function SourceTree({roots,expanded,onToggle,onSelect,selected}:{roots:SourceTreeNode[];expanded:Set<string>;onToggle:(id:string)=>void;onSelect:(id:string)=>void;selected:string|null}){
 const tr=useCopy();const {locale}=useLanguage();
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(selected)Array.from(container.current?.querySelectorAll<HTMLElement>('[data-source-node]')||[]).find(el=>el.dataset.sourceNode===selected)?.scrollIntoView({block:'nearest'})},[selected,expanded]);
 const render=(node:SourceTreeNode)=><div key={node.id} className="source-tree-node">
  <button data-source-node={node.id} aria-expanded={node.children.length?expanded.has(node.id):undefined} aria-label={`${node.kind==='source'?tr("来源记录"):tr("来源分类")} ${sourceNodeTitle(node,locale)}`} className={selected===node.id?'active':''} onClick={()=>{if(node.children.length)onToggle(node.id);onSelect(node.id)}}><span>{node.children.length&&<ArtIcon name="chevron" collection="r3" size={13} className={expanded.has(node.id)?'node-chevron expanded':'node-chevron'}/>}{sourceNodeTitle(node,locale)}{node.categoryId?` [${node.categoryId}]`:''}</span><small>{countLabel(node.sourceCount,'sources',locale)} / {countLabel(node.recordCount,'records',locale)}</small></button>
  {expanded.has(node.id)&&node.children.map(render)}
 </div>;
 return <div ref={container} className="source-classification-tree">{roots.length?roots.map(render):<p role="status">{tr("没有匹配的实际来源。请清空搜索或调整筛选。")}</p>}</div>;
}
export function SourceCoverageNote({node,coverage}:{node:SourceTreeNode;coverage:SourceCoverage[]}){
 const tr=useCopy();const {locale}=useLanguage();
 const evidence=coverageFor(node,coverage);
 return <details className="source-coverage-note browse-notes"><summary>{tr("资料与方法")}</summary><p>{tr("当前可浏览主库子集")}：{countLabel(node.sourceCount,'sources',locale)} · {countLabel(node.associationCount,'associations',locale)} · {countLabel(node.recordCount,'records',locale)}</p>
 {evidence.length?evidence.map((row,i)=><div key={row.evidence+'|'+row.date+'|'+i}>{tr("历史快照")} {row.date}：{row.count!=null?`${row.count} ${copyKnown(row.unit||'',locale)}。`:''}<details><summary>{tr("资料与方法")}</summary>{row.note} {tr("出处")}：{row.evidence}</details></div>):<p>{tr("覆盖未核定：没有明确对应此分类ID的覆盖证据。")}</p>}
 <details><summary>{tr("计数说明")}</summary><p>{tr("历史快照不随筛选变化；主库关联数量不是来源采集完成率。")}</p></details></details>;
}
