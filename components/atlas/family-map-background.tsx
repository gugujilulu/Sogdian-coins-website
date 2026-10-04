'use client';
import {useCopy,useLanguage} from './language';
import {type MapBackground,type MapTime} from '@/lib/map-layers';
import {rangeName} from '@/lib/range-copy';
import {rangeViews} from '@/lib/range-time';
import RangeControls,{type RangeControl} from './range-controls';
export default function FamilyMapBackground({time,control,background,familyId,enabled,onEnabled,onRange,object,onObject,objectName}:{time:MapTime;control:RangeControl;background:MapBackground;familyId:string;enabled:boolean;onEnabled:()=>void;onRange:()=>void;object:string;onObject:(id:string)=>void;objectName:(id:string)=>string}){
 const tr=useCopy(),{locale}=useLanguage();
 const associated=background.ranges.filter(r=>r.familyIds.includes(familyId));
 const objects=rangeViews(associated,time,control.selection.versions);
 const ranges=background.ranges.filter(r=>r.objectId===object);
 const view=rangeViews(ranges,time,control.selection.versions,control.selection.backgrounds)[0];
 const global=!!object&&!objects.some(v=>v.objectId===object);
 return <section className="map-background family-range"><strong>{tr('相关范围')}{global&&<small> · {tr('全局范围')}</small>}</strong>
 {objects.length>1||global?<select aria-label={tr('相关范围')} value={object} onChange={e=>onObject(e.target.value)}>
 {!object&&<option value="">{tr('全部已开启范围')}</option>}{global&&<option value={object}>{view?.selected?rangeName(view.selected,locale,objectName(object)):objectName(object)}</option>}
 {objects.map(v=><option key={v.objectId} value={v.objectId}>{rangeName(v.selected||v.choices[0],locale,objectName(v.objectId))} · {tr(v.choices[0].kind==='polity'?'政权范围':'地域背景')}{!v.selected?.geometry?' · '+tr('范围待补'):''}</option>)}
 </select>:null}
 {ranges.length?<RangeControls compact name={view?.selected?rangeName(view.selected,locale,objectName(object)):objectName(object)} ranges={ranges} time={time} enabled={enabled} control={control}/>:<p>{tr(!object&&objects.length?'全部已开启范围':'范围待补')}</p>}
 {view?.selected?.geometry&&<div className="family-range-actions">{!enabled&&<button onClick={onEnabled}>{tr('显示相关范围')}</button>}{enabled&&view.visible&&<button onClick={onRange}>{tr('定位范围')}</button>}</div>}
 </section>;
}
