'use client';
import {animate} from 'motion';
import {AnimatePresence,MotionConfig,motion,useIsPresent,useReducedMotion} from 'motion/react';
import {useEffect,useRef,type ReactNode} from 'react';
import {motionTiming,motionEase} from '@/lib/motion';
export {AnimatePresence,motion,useIsPresent,useReducedMotion};
export function InterfaceMotion({children}:{children:ReactNode}){
 useEffect(()=>{
  // Native details remains the sole open state; closing contents cannot retain Tab targets.
  const toggled=(event:Event)=>{const target=event.target;if(!(target instanceof HTMLDetailsElement))return;for(const child of target.children)if(child instanceof HTMLElement&&child.tagName!=='SUMMARY')child.inert=!target.open};
  for(const [key,value] of Object.entries(motionTiming))document.documentElement.style.setProperty('--motion-'+key,value+'ms');
  document.addEventListener('toggle',toggled,true);return()=>document.removeEventListener('toggle',toggled,true);
 },[]);
 return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
/** Only the requested branch animates; restored/search-opened branches render directly. */
export function PaperReveal({open,animated=true,children,className,id}:{open:boolean;animated?:boolean;children:ReactNode;className?:string;id?:string}){
 const reduce=useReducedMotion();
 return <AnimatePresence initial={false}>{open&&<RevealBody key="body" reduce={!!reduce||!animated} className={className} id={id}>{children}</RevealBody>}</AnimatePresence>;
}
function RevealBody({children,reduce,className,id}:{children:ReactNode;reduce:boolean;className?:string;id?:string}){
 const present=useIsPresent();
 return <motion.div id={id} className={className} inert={!present} aria-hidden={!present||undefined} style={{overflow:'clip',pointerEvents:present?undefined:'none'}} initial={reduce?false:{height:0,opacity:0,y:-6}} animate={{height:'auto',opacity:1,y:0}} exit={{height:0,opacity:0,y:reduce?0:-6}} transition={{duration:reduce?0:motionTiming.expand/1000,ease:motionEase.enter}}>{children}</motion.div>;
}
export function PageEntrance({active,target}:{active:boolean;target:string}){
 const reduce=useReducedMotion(),seen=useRef(active);
 useEffect(()=>{const entering=active&&!seen.current;seen.current=active;if(!entering||reduce)return;const node=document.querySelector<HTMLElement>(target);if(!node)return;const controls=animate(node,{opacity:[0,1],y:[5,0]},{duration:motionTiming.menu/1000,ease:motionEase.enter});return()=>{controls.stop();node.style.removeProperty('opacity');node.style.removeProperty('transform')}},[active,reduce,target]);
 return null;
}
