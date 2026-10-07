'use client';
import {useEffect} from 'react';

// Keep page scrolling inside its content viewport, including on browsers
// that do not implement overscroll-behavior.
export function useMobilePageLock(enabled:boolean){
 useEffect(()=>{
  if(!enabled)return;
  const media=window.matchMedia('(max-width:760px)');
  const sync=()=>document.documentElement.classList.toggle('mobile-page-locked',media.matches);
  sync();media.addEventListener('change',sync);
  let x=0,y=0;
  const start=(event:TouchEvent)=>{if(event.touches.length===1){x=event.touches[0].clientX;y=event.touches[0].clientY}};
  const move=(event:TouchEvent)=>{
   if(!media.matches||!(event.target instanceof Element))return;
   // These viewports implement their own pan/pinch handlers.
   if(event.target.closest('.maplibregl-canvas,.image-viewport,.sheet-handle'))return;
   if(event.touches.length!==1){if(event.cancelable)event.preventDefault();return}
   if(event.target.closest('input,select,textarea'))return;
   const touch=event.touches[0],dx=touch.clientX-x,dy=touch.clientY-y;
   x=touch.clientX;y=touch.clientY;
   if(Math.abs(dx)>Math.abs(dy)){if(event.cancelable)event.preventDefault();return}
   let node:Element|null=event.target;
   while(node&&node!==document.body){
    const style=getComputedStyle(node);
    if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+1){
     const max=node.scrollHeight-node.clientHeight;
     if((dy<0&&node.scrollTop<max-1)||(dy>0&&node.scrollTop>1))return;
    }
    node=node.parentElement;
   }
   if(event.cancelable)event.preventDefault();
  };
  document.addEventListener('touchstart',start,{passive:true});
  document.addEventListener('touchmove',move,{passive:false});
  return()=>{document.documentElement.classList.remove('mobile-page-locked');media.removeEventListener('change',sync);document.removeEventListener('touchstart',start);document.removeEventListener('touchmove',move)};
 },[enabled]);
}
