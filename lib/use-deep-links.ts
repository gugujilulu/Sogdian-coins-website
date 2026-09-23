'use client';
import {useEffect,useRef,useState} from 'react';
import {parseLink,serializeLink,type DeepLink} from './deep-links';
/** One owner for URL writes and external hash/popstate restoration. */
export function useDeepLinks(current:DeepLink,ready:boolean,resolve:(link:DeepLink)=>'ready'|'waiting',apply:(link:DeepLink)=>void){
 const [error,setError]=useState(''),[tick,setTick]=useState(0);
 const sync=useRef<{pending:string|null;initialized:boolean;applied:boolean;snapshot:string}>({pending:null,initialized:false,applied:false,snapshot:''});
 const restoring=useRef(false);
 useEffect(()=>{const receive=()=>{sync.current.pending=window.location.hash;restoring.current=true;setTick(n=>n+1)};receive();window.addEventListener('hashchange',receive);window.addEventListener('popstate',receive);return()=>{window.removeEventListener('hashchange',receive);window.removeEventListener('popstate',receive)}},[]);
 useEffect(()=>{
  const state=sync.current,signature=serializeLink(current);
  if(!ready)return;
  if(state.applied){state.applied=false;state.snapshot=signature;restoring.current=false;return}
  if(state.pending!==null){
   const hash=state.pending;
   try{const link=parseLink(hash);if(resolve(link)==='waiting')return;state.pending=null;state.initialized=true;state.applied=true;setError('');apply(link);setTick(n=>n+1)}
   catch(e){state.pending=null;state.initialized=true;state.snapshot=signature;state.applied=true;apply({view:'catalogue'});setError(e instanceof Error?e.message:'链接无效')}
   return;
  }
  if(state.initialized&&signature!==state.snapshot){state.snapshot=signature;setError('');const next=window.location.pathname+window.location.search+signature;if(window.location.hash!==signature)history.pushState(null,'',next)}
 },[current,ready,resolve,apply,tick]);
 function home(){sync.current.pending='#view=catalogue';restoring.current=true;history.pushState(null,'',window.location.pathname+window.location.search+'#view=catalogue');setTick(n=>n+1)}
 return {error,home,restoring};
}
