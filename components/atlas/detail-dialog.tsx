'use client';
import {useCopy} from './language';
import {useEffect,useRef,type ReactNode} from 'react';
import {focusable,focusReturn} from '@/lib/keyboard';
export default function DetailDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const tr=useCopy();
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const element=dialog.current,opener=document.activeElement instanceof HTMLElement?document.activeElement:null;const target=opener&&opener!==document.body&&!element?.contains(opener)?opener:null;element?.showModal();close.current?.focus({preventScroll:true});return()=>{element?.close();focusReturn(target)}},[]);
 return <dialog ref={dialog} className="related-dialog image-detail-dialog" aria-label={title} onKeyDown={event=>{if(event.key!=='Tab')return;const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]')).filter(el=>el.tabIndex>=0&&focusable(el));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}} onCancel={e=>{e.preventDefault();e.stopPropagation();onClose()}}><header className="related-detail-header"><strong>{title}</strong><button ref={close} onClick={onClose}>{tr("关闭详情")}</button></header><div className="specimen-modal related-detail-body">{children}</div></dialog>;
}
