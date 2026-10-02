'use client';
import {useCopy,useLanguage} from './language';
import {countLabel,copyKnown} from '@/lib/i18n';
import {useEffect,useMemo,useState} from 'react';
import {relatedProgress} from '@/lib/browse-copy';
import RelatedDetails from './related-details';
import type {RelatedRecord} from '@/lib/atlas';
import {parseRelatedImageIndex,relatedPage,resetRelatedPaging,type RelatedThumbnail} from '@/lib/related-gallery';

function Thumbnail({image}:{image:RelatedThumbnail|undefined}) {
 const tr=useCopy();
 const [failed,setFailed]=useState(false);
 return <div className="related-thumbnail">{image&&!failed?<img src={image.path} width={image.width??undefined} height={image.height??undefined} loading="lazy" decoding="async" alt={tr("相关资料来源图片")} onError={()=>setFailed(true)}/>:<span>{failed?tr("图片加载失败；文字与来源仍可访问"):tr("暂无可用图片")}</span>}</div>;
}

export default function RelatedGallery({records,allRecords=records,filterKey='',query,mainRecordCount,selectedId,onSelect}:{allRecords?:RelatedRecord[];filterKey?:string;selectedId:string|null;onSelect:(id:string|null)=>void;records:RelatedRecord[];query:string;mainRecordCount:number}) {

 const tr=useCopy();const {locale}=useLanguage();
 const [index,setIndex]=useState<Map<string,RelatedThumbnail[]>|null>(null);
 const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const [paging,setPaging]=useState({query,batches:1});
 const currentPaging=resetRelatedPaging(paging,query+filterKey);
 // Update this component before committing children so old query batches cannot return.
 if(currentPaging!==paging)setPaging(currentPaging);
 const batches=currentPaging.batches;
 const {matches,visible}=useMemo(()=>relatedPage(records,query,batches),[records,query,batches]);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/data/related-images.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Index unavailable');return r.json()}).then(value=>{if(!controller.signal.aborted){setIndex(parseRelatedImageIndex(value));setFailed(false)}}).catch(()=>{if(!controller.signal.aborted)setFailed(true)});
  return()=>controller.abort();
 },[attempt]);
 const selectedRecord=allRecords.find(r=>r.id===selectedId);
 const imageCount=matches.reduce((n,r)=>n+(index?.get(r.id)?.length||0),0);
 const groups=Array.from(new Set(matches.map(r=>r.reviewStatus))).sort();
 return <>
  <div className="catalogue-breadcrumb">{tr("来源目录")} / {tr("相关 / held / excluded")}</div><h1>{tr("相关与暂缓资料")}</h1>
  <p>{tr("相关资料")}：{countLabel(allRecords.length,'records',locale)} · {tr("地理条件匹配")}：{countLabel(records.length,'records',locale)} · {tr("当前搜索匹配")}：{countLabel(matches.length,'records',locale)} · {tr("主库记录")}：{countLabel(mainRecordCount,'records',locale)}</p>
  <details><summary>{tr("资料说明")}</summary><p>{tr("保留原始来源、分类路径、审查状态和原因；状态不触发原始资料删除。")}</p></details>
  {failed?<p role="status">{tr("图片索引加载失败，文字资料和来源链接仍可访问。")}<button onClick={()=>{setFailed(false);setAttempt(n=>n+1)}}>{tr("重试图片索引")}</button></p>:!index&&<p role="status">{tr("正在加载图片索引；文字资料可先浏览。")}</p>}
  {index&&<p>{countLabel(imageCount,'images',locale)}</p>}
  <div className="related-status-grid">{groups.map(g=><div key={g}><strong>{matches.filter(r=>r.reviewStatus===g).length}</strong><span>{copyKnown(g,locale)}</span></div>)}</div>
  {matches.length===0&&<p role="status">{tr("没有匹配的相关资料。请调整搜索词。")}</p>}
  <div className="related-list">{visible.map(r=>{
   const image=index?.get(r.id)?.[0];
   return <article key={r.id} data-related-id={r.id}>
    <button className="related-open" onClick={()=>onSelect(r.id)} aria-label={tr("查看详情：{title}",{title:r.title})}>{index?<Thumbnail key={image?.id||r.id} image={image}/>:<div className="related-thumbnail"><span>{failed?tr("图片索引不可用"):tr("图片索引加载中")}</span></div>}<span>{tr("查看详情")}</span></button>
    <div className="related-card-heading"><strong>{r.sourceName} · {r.sourceRecordId}</strong><span>{copyKnown(r.reviewStatus,locale)}</span></div>
    <h2>{r.title.replace(/^#\d+ - /,'')}</h2>
    {r.sourcePath.length>0&&<small>{r.sourcePath.map(x=>`${x.title} [${x.categoryId}]`).join(' › ')}</small>}
    <p>{r.reason}</p><a className="out-link" href={r.sourceUrl} target="_blank" rel="noreferrer">{tr("打开原始记录")} ↗</a>
   </article>;
  })}</div>
  {selectedRecord&&<RelatedDetails matches={matches.some(r=>r.id===selectedRecord.id)} key={selectedRecord.id} record={selectedRecord} index={index} onClose={()=>onSelect(null)}/>}
  <div className="related-pagination"><p aria-live="polite">{relatedProgress(visible.length,matches.length,locale)}</p>{visible.length<matches.length&&<button onClick={()=>setPaging({query:query+filterKey,batches:batches+1})}>{tr("加载更多（40条）")}</button>}</div>
 </>;
}
