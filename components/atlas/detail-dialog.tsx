'use client';
import CopyLink from './copy-link';
import type {DeepLink} from '@/lib/deep-links';
import LanguageMenu,{useCopy} from './language';
import ArtIcon from '@/components/visual/ArtIcon';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {focusable,focusReturn} from '@/lib/keyboard';
import {detailCloseTarget} from '@/lib/detail-presentation';
const ImagePresentation=createContext({expanded:false,open:(_target:HTMLElement)=>{}});
export function useImagePresentation(){return useContext(ImagePresentation)}
export default function DetailDialog({title,onClose,children,kind='record',nana=false,shareLink}:{title:string;onClose:()=>void;children:ReactNode;kind?:'record'|'related';nana?:boolean;shareLink?:DeepLink}){
 const tr=useCopy();
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),imageTrigger=useRef<HTMLElement|null>(null);
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{const element=dialog.current,opener=document.activeElement instanceof HTMLElement?document.activeElement:null;const target=opener&&opener!==document.body&&!element?.contains(opener)?opener:null;element?.showModal();close.current?.focus({preventScroll:true});return()=>{element?.close();focusReturn(target)}},[]);
 const dismiss=()=>{if(detailCloseTarget(expanded)==='record'){onClose();return}setExpanded(false);requestAnimationFrame(()=>focusReturn(imageTrigger.current))};
 const open=(target:HTMLElement)=>{imageTrigger.current=target;setExpanded(true);requestAnimationFrame(()=>close.current?.focus({preventScroll:true}))};
 return <ImagePresentation.Provider value={{expanded,open}}><dialog ref={dialog} className="related-dialog image-detail-dialog art-detail" data-kind={kind} data-nana={nana||undefined} data-image-expanded={expanded} aria-label={title} onKeyDown={event=>{if(event.key!=='Tab')return;const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]')).filter(el=>el.tabIndex>=0&&focusable(el));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}} onCancel={e=>{e.preventDefault();e.stopPropagation();dismiss()}}><header className="related-detail-header"><ArtIcon name="rosette" collection="r3" size={29}/><strong>{expanded?tr('高清图片'):title}</strong><LanguageMenu/>{!expanded&&shareLink&&<CopyLink label={kind==='record'?'分享钱币':'分享资料'} link={shareLink}/>}<button ref={close} aria-label={expanded?tr('返回详情'):tr('关闭详情')} title={expanded?tr('返回详情'):tr('关闭详情')} onClick={dismiss}><ArtIcon name="close" collection="r3" size={25}/></button></header><div className="specimen-modal related-detail-body">{children}</div></dialog></ImagePresentation.Provider>;
}
