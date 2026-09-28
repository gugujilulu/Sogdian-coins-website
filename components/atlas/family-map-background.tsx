'use client';
import {periodLabel,type MapBackground} from '@/lib/map-layers';
export default function FamilyMapBackground({background,familyId,enabled,onEnabled,onRange,object,onObject}:{background:MapBackground;familyId:string;enabled:boolean;onEnabled:(v:boolean)=>void;onRange:()=>void;object:string;onObject:(id:string)=>void}){
 const ranges=background.ranges.filter(r=>r.familyIds.includes(familyId));
 const objects=Array.from(new Map(ranges.map(r=>[r.objectId,r])).values());
 const places=background.places.filter(p=>p.claims.some(c=>c.familyId===familyId));
 return <details className="map-background"><summary>地图背景 · 当前查看家族</summary><p>背景属于当前查看对象，不代表当前筛选命中；展示锚点不等于铸币地或出土地。</p><label><input type="checkbox" checked={enabled} onChange={e=>onEnabled(e.target.checked)}/>显示相关背景</label>{objects.length>1&&<label>背景解释／时期体系<select aria-label="家族背景体系" value={object} onChange={e=>onObject(e.target.value)}><option value="">请选择（不合并解释）</option>{objects.map(r=><option key={r.objectId} value={r.objectId}>{r.title}</option>)}</select></label>}{ranges.length?ranges.map(r=><div key={r.id}><strong>{r.title}</strong><p>{periodLabel(r)} · {r.geometry?'已有范围资料':'范围待补'}</p><p>{r.note}</p>{r.source.split('\n').filter(s=>/^https?:\/\//.test(s)).map(url=><a key={url} href={url} target="_blank" rel="noreferrer">范围资料来源 ↗</a>)}</div>):<p>相关政权／地方体系关系未记录，保留原有归属说明。</p>}<p>{places.length} 个有具体关联证据的地点。通用历史地点仍可由图层开关查看。</p>{ranges.some(r=>r.geometry)?<button disabled={objects.length>1&&!object} onClick={onRange}>查看相关范围</button>:<p>暂无可定位范围；不以钱币年代推算疆域年代。</p>}</details>;
}
