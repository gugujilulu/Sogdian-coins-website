'use client';
import {useEffect,useMemo,useState} from 'react';
import RelatedDetails from './related-details';
import type {RelatedRecord} from '@/lib/atlas';
import {parseRelatedImageIndex,relatedPage,resetRelatedPaging,type RelatedThumbnail} from '@/lib/related-gallery';

function Thumbnail({image}:{image:RelatedThumbnail|undefined}) {
 const [failed,setFailed]=useState(false);
 return <div className="related-thumbnail">{image&&!failed?<img src={image.path} width={image.width??undefined} height={image.height??undefined} loading="lazy" decoding="async" alt="相关资料来源图片" onError={()=>setFailed(true)}/>:<span>{failed?'图片加载失败；文字与来源仍可访问':'暂无可用图片'}</span>}</div>;
}

export default function RelatedGallery({records,query,mainRecordCount,selectedId,onSelect}:{selectedId:string|null;onSelect:(id:string|null)=>void;records:RelatedRecord[];query:string;mainRecordCount:number}) {

 const [index,setIndex]=useState<Map<string,RelatedThumbnail[]>|null>(null);
 const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const [paging,setPaging]=useState({query,batches:1});
 const currentPaging=resetRelatedPaging(paging,query);
 // Update this component before committing children so old query batches cannot return.
 if(currentPaging!==paging)setPaging(currentPaging);
 const batches=currentPaging.batches;
 const {matches,visible}=useMemo(()=>relatedPage(records,query,batches),[records,query,batches]);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/data/related-images.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Index unavailable');return r.json()}).then(value=>{if(!controller.signal.aborted){setIndex(parseRelatedImageIndex(value));setFailed(false)}}).catch(()=>{if(!controller.signal.aborted)setFailed(true)});
  return()=>controller.abort();
 },[attempt]);
 const selectedRecord=records.find(r=>r.id===selectedId);
 const groups=Array.from(new Set(matches.map(r=>r.reviewStatus))).sort();
 return <>
  <div className="catalogue-breadcrumb">来源目录 / related · held · excluded</div><h1>相关与暂缓资料</h1>
  <p>相关资料 {records.length} 条；当前搜索匹配 {matches.length} 条。主库 {mainRecordCount} 条记录单独计数，相关资料不计入主库筛选结果。</p>
  <p>保留原始来源、分类路径、审查状态和原因；状态不触发原始资料删除。</p>
  {failed?<p role="status">图片索引加载失败，文字资料和来源链接仍可访问。<button onClick={()=>{setFailed(false);setAttempt(n=>n+1)}}>重试图片索引</button></p>:!index&&<p role="status">正在加载图片索引；文字资料可先浏览。</p>}
  <div className="related-status-grid">{groups.map(g=><div key={g}><strong>{matches.filter(r=>r.reviewStatus===g).length}</strong><span>{g}</span></div>)}</div>
  {matches.length===0&&<p role="status">没有匹配的相关资料。请调整搜索词。</p>}
  <div className="related-list">{visible.map(r=>{
   const image=index?.get(r.id)?.[0];
   return <article key={r.id} data-related-id={r.id}>
    <button className="related-open" onClick={()=>onSelect(r.id)} aria-label={`查看详情：${r.title}`}>{index?<Thumbnail key={image?.id||r.id} image={image}/>:<div className="related-thumbnail"><span>{failed?'图片索引不可用':'图片索引加载中'}</span></div>}<span>查看详情</span></button>
    <div className="related-card-heading"><strong>{r.sourceName} · {r.sourceRecordId}</strong><span>{r.reviewStatus}</span></div>
    <h2>{r.title.replace(/^#\d+ - /,'')}</h2>
    {r.sourcePath.length>0&&<small>{r.sourcePath.map(x=>`${x.title} [${x.categoryId}]`).join(' › ')}</small>}
    <p>{r.reason}</p><a className="out-link" href={r.sourceUrl} target="_blank" rel="noreferrer">打开原始记录 ↗</a>
   </article>;
  })}</div>
  {selectedRecord&&<RelatedDetails key={selectedRecord.id} record={selectedRecord} index={index} onClose={()=>onSelect(null)}/>}
  <div className="related-pagination"><p aria-live="polite">已显示 {visible.length} / {matches.length} 条相关资料</p>{visible.length<matches.length&&<button onClick={()=>setPaging({query,batches:batches+1})}>加载更多（40条）</button>}</div>
 </>;
}
