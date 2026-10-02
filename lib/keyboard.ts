import type {SheetState} from './mobile-sheet.ts';
export function sheetKey(state:SheetState,key:string):SheetState|null{
 const states:SheetState[]=['summary','half','reading'];
 if(key==='Home')return 'summary';if(key==='End')return 'reading';
 if(key==='ArrowUp'||key==='ArrowDown')return states[Math.max(0,Math.min(2,states.indexOf(state)+(key==='ArrowUp'?1:-1)))];
 return null;
}
export function editableTarget(target:EventTarget|null){return target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable]:not([contenteditable=false])')}
export function imageKey(key:string,editing=false,modified=false){if(editing||modified)return null;return ({ArrowLeft:'previous',ArrowRight:'next','+':'in','=':'in','-':'out','0':'fit'} as Record<string,string>)[key]||null}
export function focusable(element:HTMLElement|null):element is HTMLElement{return !!element&&element.isConnected&&!element.closest('[inert],[hidden]')&&element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden'&&!(element instanceof HTMLButtonElement&&element.disabled)}
export function focusReturn(opener:HTMLElement|null){const candidates=[opener,...document.querySelectorAll<HTMLElement>('.family-title>button,nav button.active,.brand-button,.maplibregl-canvas')];candidates.find(focusable)?.focus({preventScroll:true})}
export function stableFocusIndex(ids:readonly string[],candidates:readonly (readonly string[])[]){return candidates.findIndex(candidate=>candidate.some(id=>ids.includes(id)))}
export function escapeTarget(layers:{modal:boolean;tools:'layers'|'time'|'filters'|null;collection:boolean;family:boolean},editing=false){if(editing||layers.modal)return null;return layers.tools||(layers.collection?'collection':layers.family?'family':null)}
