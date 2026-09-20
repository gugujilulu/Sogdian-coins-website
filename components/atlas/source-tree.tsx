'use client';
import type {SourceTreeNode,SourceCoverage} from '@/lib/source-tree';
import {coverageFor} from '@/lib/source-tree';
export function SourceTree({roots,expanded,onToggle,onSelect,selected}:{roots:SourceTreeNode[];expanded:Set<string>;onToggle:(id:string)=>void;onSelect:(id:string)=>void;selected:string|null}){
 const render=(node:SourceTreeNode)=><div key={node.id} className="source-tree-node">
  <button aria-expanded={node.children.length?expanded.has(node.id):undefined} aria-label={`${node.kind==='source'?'来源记录':'来源分类'} ${node.title}`} className={selected===node.id?'active':''} onClick={()=>{if(node.children.length)onToggle(node.id);onSelect(node.id)}}><span>{node.children.length?(expanded.has(node.id)?'▾ ':'▸ '):''}{node.title}{node.categoryId?` [${node.categoryId}]`:''}</span><small>{node.sourceCount} 来源 / {node.recordCount} 记录</small></button>
  {expanded.has(node.id)&&node.children.map(render)}
 </div>;
 return <div className="source-classification-tree">{roots.length?roots.map(render):<p role="status">没有匹配的实际来源。请清空搜索或调整筛选。</p>}</div>;
}
export function SourceCoverageNote({node,coverage}:{node:SourceTreeNode;coverage:SourceCoverage[]}){
 const evidence=coverageFor(node,coverage);
 return <section className="source-coverage-note"><p>当前可浏览主库子集：{node.sourceCount} 来源记录 · {node.associationCount} 来源关联 · {node.recordCount} 去重主库记录。</p>
 {evidence.length?evidence.map((row,i)=><p key={row.evidence+'|'+row.date+'|'+i}>历史快照 {row.date}：{row.count!=null?`${row.count} ${row.unit}。`:''}{row.note} 出处：{row.evidence}</p>):<p>覆盖未核定：没有明确对应此分类ID的覆盖证据。</p>}
 <p>历史快照不随筛选变化；主库关联数量不是来源采集完成率。</p></section>;
}
