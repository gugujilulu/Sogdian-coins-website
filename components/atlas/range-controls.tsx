'use client';
import {useCopy,useLanguage} from './language';
import {timeCopy,spaceCopy,rangeMessage,rangeName,rangePeriodCopy} from '@/lib/range-copy';
import {rangeViews} from '@/lib/range-time';
import type {MapRange,MapTime} from '@/lib/map-layers';
import type {useRangeSelection} from './use-range-selection';
export type RangeControl=ReturnType<typeof useRangeSelection>;
export default function RangeControls({ranges,time,control,enabled=true,allowBackground=true,compact=false,name}:{ranges:MapRange[];time:MapTime;control:RangeControl;enabled?:boolean|((range:MapRange)=>boolean);allowBackground?:boolean;compact?:boolean;name?:string}){
 const tr=useCopy(),{locale}=useLanguage();
 const views=rangeViews(ranges,time,control.selection.versions,control.selection.backgrounds);
 return <div className="range-controls">{views.map(v=><section key={v.objectId} className="range-version">
  {v.choices.length>1?<label>{tr("范围版本")}<select aria-label={`${tr('范围版本')} ${rangeName(v.choices[0],locale)}`} value={control.selection.versions[v.objectId]||v.selected?.id||''} onChange={e=>control.setVersion(v.objectId,e.target.value)}>{!v.selected&&<option value="">{tr("所选版本不存在，请重新选择")}</option>}{v.choices.map(r=><option key={r.id} value={r.id}>{rangeName(r,locale)} · {rangePeriodCopy(r,locale)}</option>)}</select></label>:<strong>{v.selected?rangeName(v.selected,locale,name):tr("范围版本未记录")}</strong>}
  {(!compact||!v.visible||v.background)&&<p role="status">{compact&&!v.selected?.geometry?tr("范围待补"):rangeMessage(v,locale)}{!(typeof enabled==='function'?(v.selected?enabled(v.selected):false):enabled)&&!compact&&' · '+tr('相关图层尚未开启')}</p>}
  {v.selected&&<>{(!compact||v.selected.geometry)&&<p>{compact?rangePeriodCopy(v.selected,locale):(v.selected.periodText || timeCopy(v.selected,locale))} · {v.selected.precision==='approximate'?tr("大致范围"):tr("范围资料")}{compact&&!!v.selected.coverageEdge&&' · '+tr("部分覆盖")}</p>}
   {allowBackground&&v.selected.geometry&&!v.visible&&(!compact||(typeof enabled==='function'?enabled(v.selected):enabled))&&<button onClick={()=>control.setBackground(v.objectId,true)}>{tr("作为历史背景查看")}</button>}
   {v.background&&<button onClick={()=>control.setBackground(v.objectId,false)}>{tr("停止背景查看")}</button>}
   <details><summary>{tr("资料与方法")}</summary><p>{timeCopy(v.selected,locale)}</p><p>{spaceCopy(v.selected,locale)}</p>{!v.selected.source.split('\n').some(source=>source&&!/^(public|research|docs|lib)\//.test(source))&&<p>{tr("范围出处待补")}</p>}<p>{v.selected.note||tr("说明未记录")}</p>{v.selected.source.split('\n').filter(source=>source&&!/^(public|research|docs|lib)\//.test(source)).map((source,i)=>/^https?:\/\//.test(source)?<a key={i} href={source} target="_blank" rel="noreferrer">{tr("范围资料来源 ↗")}</a>:<p key={i}>{source}</p>)}</details>
  </>}
 </section>)}</div>;
}
