'use client';
import {motion,useIsPresent,useReducedMotion} from './ui-motion';
import {motionTiming,motionEase} from '@/lib/motion';
import CopyLink from './copy-link';
import type {DeepLink} from '@/lib/deep-links';
import LanguageMenu,{useCopy} from './language';
import ArtIcon from '@/components/visual/ArtIcon';
import {Children,createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {focusable,focusReturn} from '@/lib/keyboard';
import {detailCloseTarget} from '@/lib/detail-presentation';
const ImagePresentation=createContext({expanded:false,open:(_target:HTMLElement)=>{}});
export function useImagePresentation(){return useContext(ImagePresentation)}
export default function DetailDialog({title,onClose,children,kind='record',nana=false,shareLink}:{title:string;onClose:()=>void;children:ReactNode;kind?:'record'|'related';nana?:boolean;shareLink?:DeepLink}){
 const present=useIsPresent(),reduce=useReducedMotion(),opener=useRef<HTMLElement|null>(null),returned=useRef(false);
 const tr=useCopy();
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),imageTrigger=useRef<HTMLElement|null>(null);
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{const element=dialog.current,focused=document.activeElement instanceof HTMLElement?document.activeElement:null;const target=focused&&focused!==document.body&&!element?.contains(focused)?focused:null;opener.current=target;element?.showModal();close.current?.focus({preventScroll:true});return()=>{element?.close();if(!returned.current)focusReturn(target)}},[]);
 useEffect(()=>{if(!present){dialog.current?.close();if(!returned.current){returned.current=true;focusReturn(opener.current)}}},[present]);
 const dismiss=()=>{if(detailCloseTarget(expanded)==='record'){onClose();return}setExpanded(false);requestAnimationFrame(()=>focusReturn(imageTrigger.current))};
 const open=(target:HTMLElement)=>{imageTrigger.current=target;setExpanded(true);requestAnimationFrame(()=>close.current?.focus({preventScroll:true}))};
 return <ImagePresentation.Provider value={{expanded,open}}><motion.dialog initial={reduce?false:{opacity:0,y:8,scale:.985}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:reduce?0:5,scale:reduce?1:.99,transition:{duration:motionTiming.close/1000}}} transition={{duration:motionTiming.panel/1000,ease:motionEase.enter}} inert={!present} data-exiting={!present||undefined} ref={dialog} className="related-dialog image-detail-dialog art-detail" data-kind={kind} data-nana={nana||undefined} data-image-expanded={expanded} aria-label={title} onKeyDown={event=>{if(event.key!=='Tab')return;const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]')).filter(el=>el.tabIndex>=0&&focusable(el));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}} onCancel={e=>{e.preventDefault();e.stopPropagation();dismiss()}}><header className="related-detail-header"><ArtIcon name="rosette" collection="r3" size={29}/><strong>{expanded?tr('高清图片'):title}</strong><LanguageMenu/>{!expanded&&shareLink&&<CopyLink label={kind==='record'?'分享钱币':'分享资料'} link={shareLink}/>}<button ref={close} aria-label={expanded?tr('返回详情'):tr('关闭详情')} title={expanded?tr('返回详情'):tr('关闭详情')} onClick={dismiss}><ArtIcon name="close" collection="r3" size={25}/></button></header><div className="specimen-modal related-detail-body">{kind==='record'?Children.map(children,(child,index)=><div className="detail-frame" data-frame-index={index}>{child}</div>):children}</div></motion.dialog></ImagePresentation.Provider>;
}
