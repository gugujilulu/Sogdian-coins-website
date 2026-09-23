'use client';
import {useEffect,useRef,type ReactNode} from 'react';
export default function DetailDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const element=dialog.current,opener=document.activeElement instanceof HTMLElement?document.activeElement:null;const target=opener&&opener!==document.body&&!element?.contains(opener)?opener:null;element?.showModal();close.current?.focus({preventScroll:true});return()=>{element?.close();const fallback=document.querySelector<HTMLElement>('nav button.active')||document.querySelector<HTMLElement>('.brand-button');(target?.isConnected?target:fallback)?.focus({preventScroll:true})}},[]);
 return <dialog ref={dialog} className="related-dialog image-detail-dialog" aria-label={title} onCancel={e=>{e.preventDefault();onClose()}}><header className="related-detail-header"><strong>{title}</strong><button ref={close} onClick={onClose}>关闭详情</button></header><div className="specimen-modal related-detail-body">{children}</div></dialog>;
}
