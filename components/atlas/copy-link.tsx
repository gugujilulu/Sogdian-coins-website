'use client';
import {useCopy} from './language';
import ArtIcon from '@/components/visual/ArtIcon';
import {createContext,useContext,useEffect,useState} from 'react';
import {serializeLink,type DeepLink} from '@/lib/deep-links';
export const FilterLinkContext=createContext<Pick<DeepLink,'region'|'polity'|'city'|'filters'>>({});
export default function CopyLink({link,label='分享链接'}:{link:DeepLink;label?:'分享链接'|'分享家族'|'分享钱币'|'分享资料'}){
 const tr=useCopy(),context=useContext(FilterLinkContext);
 const [status,setStatus]=useState<'copied'|'failed'|null>(null),[manual,setManual]=useState(''),[receipt,setReceipt]=useState(0);
 useEffect(()=>{if(status!=='copied')return;const timer=window.setTimeout(()=>setStatus(null),2500);return()=>window.clearTimeout(timer)},[status,receipt]);
 async function copy(){const url=window.location.origin+window.location.pathname+window.location.search+serializeLink({...context,...link});try{await navigator.clipboard.writeText(url);setManual('');setReceipt(value=>value+1);setStatus('copied')}catch{setStatus('failed');setManual(url)}}
 return <span className="deep-copy"><button type="button" aria-label={tr(label)} title={tr(label)} onClick={copy}><ArtIcon name="share" collection="r3" size={17}/></button>{status&&<span className="share-feedback"><small role="status">{tr(status==='copied'?'链接已复制':'无法访问剪贴板，请手动复制')}</small>{manual&&<input aria-label={tr('手动复制完整链接')} readOnly value={manual} onFocus={e=>e.target.select()}/>}</span>}</span>;
}
