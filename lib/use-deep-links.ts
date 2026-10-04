'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {parseLink,serializeLink,automaticLinkWrite,historyCamera,cameraHistoryState,type MapCameraView,type DeepLink} from './deep-links';
/** One owner for URL writes and external hash/popstate restoration. */
export function useDeepLinks(current:DeepLink,ready:boolean,resolve:(link:DeepLink)=>'ready'|'waiting',apply:(link:DeepLink,camera:MapCameraView|null)=>void){
 const [error,setError]=useState(''),[tick,setTick]=useState(0);
 const sync=useRef<{pending:string|null;initialized:boolean;applied:boolean;snapshot:string;observed:string|null;camera:MapCameraView|null}>({pending:null,initialized:false,applied:false,snapshot:'',observed:null,camera:null});
 const restoring=useRef(false);
 useLayoutEffect(()=>{const receive=(event?:Event)=>{const hash=window.location.hash;if(sync.current.observed===hash&&event?.type!=='popstate')return;sync.current.camera=historyCamera(history.state,hash);sync.current.observed=hash;sync.current.pending=hash;restoring.current=true;setTick(n=>n+1)};receive();window.addEventListener('hashchange',receive);window.addEventListener('popstate',receive);return()=>{window.removeEventListener('hashchange',receive);window.removeEventListener('popstate',receive)}},[]);
 useLayoutEffect(()=>{
  const state=sync.current,signature=serializeLink(current);
  if(!ready)return;
  if(state.applied){state.applied=false;state.snapshot=signature;restoring.current=false;history.replaceState(cameraHistoryState(history.state,signature,state.camera),'',window.location.pathname+window.location.search+signature);state.observed=signature;return}
  if(state.pending!==null){
   const hash=state.pending;
   try{const link=parseLink(hash);if(resolve(link)==='waiting')return;state.pending=null;state.initialized=true;state.applied=true;setError('');apply(link,state.camera);setTick(n=>n+1)}
   catch(e){state.pending=null;state.initialized=true;state.snapshot=signature;state.applied=true;apply({view:'catalogue'},null);setError(e instanceof Error?e.message:'链接无效')}
   return;
  }
  if(state.initialized&&signature!==state.snapshot){const method=automaticLinkWrite(state.snapshot,signature);if(method==='draft')return;state.snapshot=signature;setError('');const next=window.location.pathname+window.location.search+signature;if(window.location.hash!==signature){sync.current.observed=signature;history[method](cameraHistoryState(history.state,signature,state.camera),'',next)}}
 },[current,ready,resolve,apply,tick]);
 function commitSearch(link:DeepLink){
  const state=sync.current,signature=serializeLink(link);if(!state.initialized||restoring.current)return;
  if(signature!==state.snapshot){state.snapshot=signature;state.observed=signature;setError('');history.pushState(cameraHistoryState(history.state,signature,state.camera),'',window.location.pathname+window.location.search+signature)}
 }
 function saveCamera(camera:MapCameraView){const state=sync.current;state.camera=camera;if(state.initialized&&!restoring.current)history.replaceState(cameraHistoryState(history.state,state.snapshot,camera),'')}
 function home(){sync.current.pending='#view=catalogue';sync.current.observed='#view=catalogue';restoring.current=true;history.pushState(null,'',window.location.pathname+window.location.search+'#view=catalogue');setTick(n=>n+1)}
 return {error,home,restoring,commitSearch,saveCamera};
}
