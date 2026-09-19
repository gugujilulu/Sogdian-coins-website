'use client';
import {useEffect,useRef,useState} from 'react';
import type {RelatedRecord} from '@/lib/atlas';
import {relatedImage,type RelatedThumbnail} from '@/lib/related-gallery';

function DetailPhoto({image}:{image:RelatedThumbnail}) {
 const [failed,setFailed]=useState(false);
 return failed?<p role="status">图片加载失败；仍可阅读详情或打开图片来源。</p>:<img src={image.path} width={image.width??undefined} height={image.height??undefined} alt="当前相关资料图片" onError={()=>setFailed(true)}/>;
}
function Link({url,children}:{url:string|null;children:React.ReactNode}) {
 return url?<a className="out-link" href={url} target="_blank" rel="noreferrer">{children} ↗</a>:<span>{children}：未记录</span>;
}
export default function RelatedDetails({record,index,onClose}:{record:RelatedRecord;index:Map<string,RelatedThumbnail[]>|null;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const close=useRef<HTMLButtonElement>(null);
 const images=index?.get(record.id)||[];
 const [imageId,setImageId]=useState<string|null>(images[0]?.id??null);
 const image=relatedImage(index,record.id,imageId);
 useEffect(()=>{
  const el=dialog.current;
  const opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  el?.showModal();close.current?.focus({preventScroll:true});
  return()=>{el?.close();opener?.focus({preventScroll:true})};
 },[]);
 useEffect(()=>{if(imageId===null&&images.length)setImageId(images[0].id)},[images,imageId]);
 return <dialog ref={dialog} className="related-dialog" aria-labelledby="related-detail-title" onCancel={e=>{e.preventDefault();onClose()}}>
  <header className="related-detail-header"><strong>相关资料详情</strong><button ref={close} onClick={onClose}>关闭详情</button></header>
  <div className="specimen-modal related-detail-body">
   <div className="modal-image">{image?<DetailPhoto key={image.id} image={image}/>:<p role="status">{index?'暂无可用图片':'图片索引不可用；文字详情仍可阅读'}</p>}</div>
   <div className="modal-info">
    <h1 id="related-detail-title">{record.title}</h1>
    <p>{record.sourceName} · {record.sourceRecordId}</p>
    <p><strong>审查状态：</strong>{record.reviewStatus}</p><p><strong>原始审查原因：</strong>{record.reason}</p>
    <p><strong>来源分类路径：</strong>{record.sourcePath.map(x=>`${x.title} [${x.categoryId}]`).join(' › ')||'未记录'}</p>
    <p><Link url={record.sourceUrl}>原始记录页面</Link></p>
    {images.length>1&&<div className="related-image-options" aria-label="切换图片">{images.map((im,i)=><button key={im.id} aria-pressed={im.id===imageId} onClick={()=>setImageId(im.id)}>图片 {i+1}</button>)}</div>}
    {image&&<section aria-label="当前图片来源信息">
     <p><Link url={image.path}>打开本地原尺寸图片</Link></p>
     <p>图片来源：{image.sourceName||'未记录'} · {image.sourceRecordId||'未记录'}</p>
     <p><Link url={image.sourceRecordUrl}>当前图片来源页面</Link></p><p><Link url={image.sourceUrl}>来源原图</Link></p>
     <p>署名：{image.credit||'未记录'}</p>
     <p>权利状态：{image.rightsStatus==='unverified'?'未核实（unverified），不表示开放许可':image.rightsStatus||'未记录'}</p>
     <p>来源权利原文：{image.sourceRightsStatus||'未记录'}</p><p>{image.rightsNote||'权利备注：未记录'}</p>
     <p><Link url={image.rightsSourceUrl}>权利说明</Link></p>
     <p>尺寸：{image.width&&image.height?`${image.width} × ${image.height} px`:'未记录'}</p>
    </section>}
   </div>
  </div>
 </dialog>;
}
