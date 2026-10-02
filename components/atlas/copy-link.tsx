'use client';
import {useCopy} from './language';
import {createContext,useContext,useState} from 'react';
import {serializeLink,type DeepLink} from '@/lib/deep-links';
export const FilterLinkContext=createContext<Pick<DeepLink,'region'|'polity'|'city'|'filters'>>({});
export default function CopyLink({link}:{link:DeepLink}){
 const tr=useCopy();
 const context=useContext(FilterLinkContext);
 const [status,setStatus]=useState(''),[manual,setManual]=useState('');
 async function copy(){const url=window.location.origin+window.location.pathname+window.location.search+serializeLink({...context,...link});try{await navigator.clipboard.writeText(url);setManual('');setStatus(tr("链接已复制"))}catch{setStatus(tr("无法访问剪贴板，请手动复制"));setManual(url)}}
 return <span className="deep-copy"><button type="button" onClick={copy}>{tr("复制链接")}</button>{status&&<small role="status">{status}</small>}{manual&&<input aria-label={tr("手动复制完整链接")} readOnly value={manual} onFocus={e=>e.target.select()}/>}</span>;
}
