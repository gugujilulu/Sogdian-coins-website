'use client';
import type {ReactNode} from 'react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
export {SelectItem as PaperOption};
/** Radix owns selection, keyboard navigation and focus return. */
export default function PaperSelect({label,value,onChange,children,className='',caption}:{label:string;value:string;onChange:(value:string)=>void;children:ReactNode;className?:string;caption?:string}){
 return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className={'paper-select-trigger '+className}><SelectValue>{caption}</SelectValue></SelectTrigger><SelectContent position="popper" align="start" sideOffset={3} collisionPadding={8} className="paper-select-menu" onEscapeKeyDown={event=>event.stopPropagation()}>{children}</SelectContent></Select>;
}
