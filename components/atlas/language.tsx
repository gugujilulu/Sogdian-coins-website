'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Globe,Check} from 'lucide-react';
import {dictionary,languageNames,readLocale,saveLocale,setCopyLocale,menuIndex,type Locale,type CopyKey} from '@/lib/i18n';
const Context=createContext({locale:'en' as Locale,setLocale:(_locale:Locale)=>{}});
export function LanguageProvider({children}:{children:ReactNode}){
 const [locale,setValue]=useState<Locale>('en');
 useEffect(()=>{let storage:Storage|null=null;try{storage=window.localStorage}catch{}const restored=readLocale(storage);setCopyLocale(restored);setValue(restored);document.documentElement.lang=restored},[]);
 const setLocale=(value:Locale)=>{setCopyLocale(value);setValue(value);document.documentElement.lang=value;try{saveLocale(window.localStorage,value)}catch{}};
 return <Context.Provider value={{locale,setLocale}}>{children}</Context.Provider>;
}
export function useCopy(){const {locale}=useContext(Context);return (key:CopyKey)=>dictionary[key][locale]}
export function useLanguage(){return useContext(Context)}
export default function LanguageMenu(){
 const {locale,setLocale}=useLanguage();const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);const locales=['en','zh','ru'] as const;
 const labels={en:'Choose language',zh:'选择语言',ru:'Выбрать язык'};
 const close=(focus=false)=>{setOpen(false);if(focus)trigger.current?.focus({preventScroll:true})};
 useEffect(()=>{if(!open)return;root.current?.querySelector<HTMLButtonElement>(`[data-locale=${locale}]`)?.focus();const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))close()};const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(true)}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key,true);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key,true)}},[open,locale]);
 return <div className="language-control" ref={root}><button ref={trigger} aria-label={labels[locale]} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Globe size={16}/>{locale.toUpperCase()}</button>{open&&<div className="language-menu" role="menu" aria-label={labels[locale]} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const i=locales.indexOf((e.target as HTMLElement).dataset.locale as Locale);root.current?.querySelector<HTMLButtonElement>(`[data-locale=${locales[menuIndex(i,e.key)]}]`)?.focus()}if(e.key==='Tab')close()}}>{locales.map(value=><button key={value} data-locale={value} role="menuitemradio" aria-checked={value===locale} onClick={()=>{setLocale(value);close(true)}}>{languageNames[value]}{value===locale&&<Check size={15}/>}</button>)}</div>}</div>;
}
