import {visibleRanges,type MapRange,type MapBackground,type MapTime,type LayerSettings} from './map-layers.ts';
import {rangeViews} from './range-time.ts';
export function rangeLayer(range:MapRange){return range.kind==='polity'?'polities':range.kind}
/** Existing family links only; geometry, category, then stable object ID determine the default. */
export function familyRangeObject(ranges:MapRange[],familyId:string,current='',versions:Record<string,string>={}){
 const choices=rangeViews(ranges.filter(r=>r.familyIds.includes(familyId)),{mode:'all',year:0},versions);
 if(choices.some(v=>v.objectId===current))return current;
 const rank=(r:MapRange)=>r.kind==='polity'?0:r.kind==='context'?1:2;
 return choices.sort((a,b)=>Number(!!b.selected?.geometry)-Number(!!a.selected?.geometry)||rank(a.selected||a.choices[0])-rank(b.selected||b.choices[0])||a.objectId.localeCompare(b.objectId))[0]?.objectId||'';
}
export function linkRangeLayers(layers:LayerSettings,range?:MapRange,explicit=false):LayerSettings{
 if(!range?.geometry||(!explicit&&!layers.polities&&!layers.context&&!layers.circulation))return layers;
 const key=rangeLayer(range);return layers[key]?layers:{...layers,[key]:true};
}
export function linkedVisibleRanges(background:MapBackground,layers:LayerSettings,time:MapTime,object?:string,versions:Record<string,string>={},overrides:string[]=[]){
 return visibleRanges(background,layers,time,undefined,versions,overrides).filter(r=>!object||r.objectId===object);
}
