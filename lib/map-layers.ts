import {panchCore,panchOasis} from './panch-ranges.ts';
import {samarkandCore,samarkandOasis} from './samarkand-ranges.ts';
import {semirechyeBackground} from './semirechye-background.ts';
import {rangeViews} from './range-time.ts';
import {turgeshOverall} from './turgesh-overall.ts';
import {turgeshSample} from './turgesh-sample.ts';
import {qaraKhitaiSample} from './qara-khitai-sample.ts';
import type {Atlas,Area,Place} from './atlas';
import type {GeographyIndex} from './geography-index';
export const layerNames={coins:'钱币家族与集合',cities:'核心历史地点',centers:'政治中心',sites:'考古遗址',mints:'铸币地及候选',findspots:'单枚出土',hoards:'窖藏',polities:'政权范围',circulation:'钱币流通范围',context:'地域背景'} as const;
export type LayerKey=keyof typeof layerNames;
export type LayerSettings=Record<LayerKey,boolean>;
export const defaultLayers:LayerSettings={coins:true,cities:true,centers:false,sites:false,mints:false,findspots:false,hoards:false,polities:false,circulation:false,context:false};
export type SymbolRole='city'|'center'|'site'|'mint'|'mint-candidate'|'findspot'|'hoard';
export const roleNames:Record<SymbolRole,string>={city:'历史城市／地点',center:'政治中心',site:'考古遗址',mint:'铸币地','mint-candidate':'铸币地候选',findspot:'单枚出土',hoard:'窖藏'};
export type Period={start:number|null;end:number|null;periodText?:string};
export type PlaceClaim=Period&{role:SymbolRole;familyId?:string;source:string;note:string};
export type MapPlace=Place&{claims:PlaceClaim[]};
export type MapRange=Period&{timeApplicability?:'cross-period';defaultPriority?:number;id:string;objectId:string;familyIds:string[];kind:'polity'|'circulation'|'context';title:string;source:string;note:string;precision:'documented'|'approximate'|'undrawn';geometry?:Area['geometry'];boundary?:{type:'MultiLineString';coordinates:number[][][]};coverageEdge?:{type:'LineString';coordinates:number[][]};coverageLabel?:[number,number];label?:[number,number];labelTitle?:string;labelLatin?:string;labelAngle?:number;display?:{transitionKm?:number;washOpacity?:number};timeEvidence?:{startInclusive?:boolean;endInclusive?:boolean};spatialMeaning?:'polity'|'local-system'|'region'|'core'|'dependency'|'influence'|'circulation'|'unknown';coverage?:{extent:'partial'|'complete'|'unknown';note?:string;edgeLabel?:string};presentation?:{background:boolean;message:string}};
export type MapBackground={places:MapPlace[];ranges:MapRange[];demo?:boolean};
export type MapTime={mode:'all'|'year'|'unknown';year:number};
export function validPeriod(p:Period){return p.start!==null&&p.end!==null&&Number.isFinite(p.start)&&Number.isFinite(p.end)&&p.start<=p.end}
export function periodLabel(p:Period){return p.periodText||(validPeriod(p)?`${p.start}–${p.end} 年`:'适用时期未记录')}
export function timeMatches(p:Period,time:MapTime){return time.mode==='all'||(time.mode==='unknown'?!validPeriod(p):validPeriod(p)&&p.start!<=time.year&&time.year<=p.end!)}
export function buildMapBackground(data:Atlas,geography:GeographyIndex):MapBackground{
 const places=data.places.map(p=>({...p,claims:[{role:p.kind==='site'?'site':'city',start:null,end:null,source:p.source,note:p.note},...data.evidence.filter(e=>e.placeId===p.id&&e.kind!=='context').map(e=>({role:e.kind as 'findspot'|'hoard',familyId:e.familyId,start:e.start,end:e.end,source:e.source,note:e.note}))] as PlaceClaim[]}));
 const ranges:MapRange[]=data.areas.map(a=>({id:a.id,objectId:`area:${a.id}`,familyIds:[a.familyId],kind:a.kind==='geographic_context'?'context':'circulation',title:a.title,source:a.source,note:a.note,start:a.start,end:a.end,precision:a.kind==='documented_circulation'?'documented':'approximate',geometry:a.geometry}));
 // Directory-only entries retain ALL research scope nodes. Family dates are never territory dates.
 for(const n of geography.nodes.filter(n=>n.dimension==='polity')){if(n.id==='polity:panch'){ranges.push(panchCore(n.relatedFamilies));continue}if(n.id==='polity:samarkand'){ranges.push(samarkandCore(n.relatedFamilies));continue}if(n.id==='polity:turgesh'){ranges.push(turgeshOverall(n.relatedFamilies),turgeshSample(n.relatedFamilies));continue}if(n.id==='polity:qara-khitai'){ranges.push(qaraKhitaiSample(n.relatedFamilies));continue}ranges.push({id:`undrawn:${n.id}`,objectId:n.id,familyIds:n.relatedFamilies,kind:'polity',title:`${n.zh} / ${n.name}`,source:n.references.map(r=>r.reference).join('\n'),note:`范围待补。${n.note}；${n.evidenceState}`,start:null,end:null,precision:'undrawn'});}
 const semirechye=geography.nodes.find(n=>n.id==='region:semirechye');
 if(semirechye)ranges.push(semirechyeBackground(semirechye.relatedFamilies));
 const samarkand=geography.nodes.find(n=>n.id==='region:samarkand');
 if(samarkand)ranges.push(samarkandOasis(samarkand.relatedFamilies));
 const panch=geography.nodes.find(n=>n.id==='region:panch');
 if(panch)ranges.push(panchOasis(panch.relatedFamilies));
 return{places,ranges};
}
const palette=['#8d533e','#51766e','#8b753f','#666d86','#747d4c','#896675'];
const fixed:Record<string,string>={'polity:panch':'#8a6c45','region:panch':'#5f8079','polity:samarkand':'#99684f','region:samarkand':'#667c8e','region:semirechye':'#8a7391','polity:qara-khitai':'#ae794e','demo:semirechye':'#807397','demo:sogdiana':'#a06443'};
export function rangeColor(id:string){let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;return fixed[id]||palette[h%palette.length]}
export function effectiveLayers(base:LayerSettings,temporary:Partial<LayerSettings>,enabled:boolean):LayerSettings{return enabled?{...base,...Object.fromEntries(Object.entries(temporary).filter(([,v])=>v))}:base}
export function backgroundLayers(background:MapBackground,familyId:string):Partial<LayerSettings>{return{polities:background.ranges.some(r=>r.familyIds.includes(familyId)&&r.kind==='polity'&&!!r.geometry),circulation:background.ranges.some(r=>r.familyIds.includes(familyId)&&r.kind==='circulation'&&!!r.geometry),context:background.ranges.some(r=>r.familyIds.includes(familyId)&&r.kind==='context'&&!!r.geometry),findspots:background.places.some(p=>p.claims.some(c=>c.familyId===familyId&&c.role==='findspot')),hoards:background.places.some(p=>p.claims.some(c=>c.familyId===familyId&&c.role==='hoard'))}}
export function visibleRanges(background:MapBackground,settings:LayerSettings,time:MapTime,familyId?:string,versions:Record<string,string>={},backgrounds:string[]=[]){
 const candidates=background.ranges.filter(r=>(!familyId||r.familyIds.includes(familyId))&&settings[r.kind==='polity'?'polities':r.kind]);
 return rangeViews(candidates,time,versions,backgrounds).flatMap(v=>v.visible&&v.selected?[{...v.selected,presentation:{background:v.background,message:v.message}}]:[]);
}
export function placeClaims(p:MapPlace,settings:LayerSettings,time:MapTime,familyId?:string){return p.claims.filter(c=>{
 if(c.familyId&&c.familyId!==familyId)return false;
 // Orientation points have no asserted period; remain accessible in every date mode.
 if(c.familyId&&!timeMatches(c,time))return false;
 const key:LayerKey=c.role==='city'?'cities':c.role==='center'?'centers':c.role==='site'?'sites':c.role.startsWith('mint')?'mints':c.role==='hoard'?'hoards':'findspots';
 return settings[key]||(!c.familyId&&settings.cities);
})}
export function rangeBounds(ranges:MapRange[]):[[number,number],[number,number]]|null{
 const points=ranges.flatMap(r=>r.geometry?(r.geometry.type==='Polygon'?r.geometry.coordinates.flat():r.geometry.coordinates.flat(2)):[]);
 if(!points.length)return null;return[[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1]))],[Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]];
}

// Only explicit range focus uses this cap; ordinary filters never move the camera.
export function rangeFocusMaxZoom(bounds:[[number,number],[number,number]]){
 const latitude=(bounds[0][1]+bounds[1][1])/2;
 const span=Math.max((bounds[1][0]-bounds[0][0])*Math.cos(latitude*Math.PI/180),bounds[1][1]-bounds[0][1]);
 return span<.25?11:8;
}
