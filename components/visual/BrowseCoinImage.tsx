'use client';
import {motion,useReducedMotion} from '@/components/atlas/ui-motion';
import {useState} from 'react';
import {useCopy} from '@/components/atlas/language';
import ArtIcon from './ArtIcon';
/** Uses the existing record image; decoration never receives pointer events. */
export default function BrowseCoinImage({path,title}:{path:string|undefined;title:string}){
 const reduce=useReducedMotion(),tr=useCopy();const [failed,setFailed]=useState(false),[loaded,setLoaded]=useState(false);
 return <><div className="browse-image-surface">{path&&!failed?<motion.img initial={{opacity:0}} animate={{opacity:loaded?1:0}} transition={{duration:reduce?0:.19}} onLoad={()=>setLoaded(true)} src={path} alt={title} loading="lazy" onError={()=>setFailed(true)}/>:<span>{failed?tr('图片加载失败；文字与来源仍可访问'):tr('暂无可用图片')}</span>}</div><span className="browse-expand" aria-hidden="true"><ArtIcon name="expand" collection="r3" size={17}/></span></>;
}
