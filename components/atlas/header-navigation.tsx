'use client';
import {LayoutGroup,motion,useReducedMotion} from 'motion/react';
import {useCopy} from './language';
type View='atlas'|'catalogue'|'research';
export default function HeaderNavigation({view,onChange}:{view:View;onChange:(view:View)=>void}){
 const tr=useCopy(),reduce=useReducedMotion();
 return <LayoutGroup id="main-navigation"><nav>{(['atlas','catalogue','research'] as const).map(id=><button key={id} className={view===id?'active':''} aria-current={view===id?'page':undefined} onClick={()=>onChange(id)}><span className="nav-label">{tr(id==='atlas'?'Atlas':id==='catalogue'?'Catalogue':'Research')}{view===id&&<motion.span layoutId="selected-nav-line" className="nav-indicator" transition={{duration:reduce?0:.21,ease:[.4,0,.2,1]}}/>}</span></button>)}</nav></LayoutGroup>;
}
