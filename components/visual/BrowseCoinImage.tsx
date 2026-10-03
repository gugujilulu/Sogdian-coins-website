'use client';
import {useState} from 'react';
import {useCopy} from '@/components/atlas/language';
import ArtIcon from './ArtIcon';
/** Uses the existing record image; decoration never receives pointer events. */
export default function BrowseCoinImage({path,title}:{path:string|undefined;title:string}){
 const tr=useCopy();const [failed,setFailed]=useState(false);
 return <><div className="browse-image-surface">{path&&!failed?<img src={path} alt={title} loading="lazy" onError={()=>setFailed(true)}/>:<span>{failed?tr('图片加载失败；文字与来源仍可访问'):tr('暂无可用图片')}</span>}</div><span className="browse-expand" aria-hidden="true"><ArtIcon name="expand" collection="r3" size={17}/></span></>;
}
