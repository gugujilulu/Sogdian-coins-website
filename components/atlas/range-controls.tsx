'use client';
import {useCopy} from './language';
import {copyKnown} from '@/lib/i18n';
import {rangeViews,rangeTimeDescription,rangeSpaceDescription} from '@/lib/range-time';
import type {MapRange,MapTime} from '@/lib/map-layers';
import type {useRangeSelection} from './use-range-selection';
export type RangeControl=ReturnType<typeof useRangeSelection>;
export default function RangeControls({ranges,time,control,enabled=true,allowBackground=true}:{ranges:MapRange[];time:MapTime;control:RangeControl;enabled?:boolean|((range:MapRange)=>boolean);allowBackground?:boolean}){
 const tr=useCopy();
 const views=rangeViews(ranges,time,control.selection.versions,control.selection.backgrounds);
 return <div className="range-controls">{views.map(v=><section key={v.objectId} className="range-version">
  {v.choices.length>1?<label>{tr("范围版本（不叠加）")}<select aria-label={`${tr('范围版本')} ${v.choices[0].title}`} value={control.selection.versions[v.objectId]||v.selected?.id||''} onChange={e=>control.setVersion(v.objectId,e.target.value)}>{!v.selected&&<option value="">{tr("所选版本不存在，请重新选择")}</option>}{v.choices.map(r=><option key={r.id} value={r.id}>{r.title} · {r.periodText||rangeTimeDescription(r)}</option>)}</select></label>:<strong>{v.selected?.title||tr("范围版本未记录")}</strong>}
  <p role="status">{v.message.split('；').map(part=>part.replace(/^(\d+)年：/, '$1: ').replace(/([^:]+): (.*)/,(_,year,body)=>`${year}: ${copyKnown(body)}`)).map(part=>copyKnown(part)).join(' · ')}{!(typeof enabled==='function'?(v.selected?enabled(v.selected):false):enabled)&&' · '+tr('相关图层尚未开启')}</p>
  {v.selected&&<><p>{v.selected.periodText || rangeTimeDescription(v.selected)} · {v.selected.precision==='approximate'?tr("大致范围"):tr("范围资料")}</p>
   {allowBackground&&v.selected.geometry&&!v.visible&&<button onClick={()=>control.setBackground(v.objectId,true)}>{tr("作为历史背景查看")}</button>}
   {v.background&&<button onClick={()=>control.setBackground(v.objectId,false)}>{tr("停止背景查看")}</button>}
   <details><summary>{tr("资料与方法")}</summary><p>{rangeTimeDescription(v.selected)}</p><p>{rangeSpaceDescription(v.selected)}</p>{!v.selected.source.split('\n').some(source=>source&&!/^(public|research|docs|lib)\//.test(source))&&<p>尚无可访问的范围地图出处；已有来源标签登记保留。</p>}<p>{v.selected.note||tr("说明未记录")}</p>{v.selected.source.split('\n').filter(source=>source&&!/^(public|research|docs|lib)\//.test(source)).map((source,i)=>/^https?:\/\//.test(source)?<a key={i} href={source} target="_blank" rel="noreferrer">{tr("范围资料来源 ↗")}</a>:<p key={i}>{source}</p>)}</details>
  </>}
 </section>)}</div>;
}
