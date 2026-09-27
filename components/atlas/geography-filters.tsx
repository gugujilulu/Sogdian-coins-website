'use client';
import {useState} from 'react';
import type {GeographyIndex,GeoSelection,GeoDimension} from '@/lib/geography-index';
const labels:Record<GeoDimension,string>={region:'历史地区 / Region',polity:'政权／地方体系 / Polity',place:'城市／遗址／地点 / Place'};
export default function GeographyFilters({index,selection,counts,onChange,onClear}:{index:GeographyIndex;selection:GeoSelection;counts:Map<string,number>;onChange:(dimension:GeoDimension,values:string[])=>void;onClear:()=>void}){
 const [search,setSearch]=useState('');const q=search.trim().toLocaleLowerCase();
 return <div className="geography-filters"><p>跨维度 AND，同维度多选 OR。数量为其他条件下可匹配主库记录数；0 项保留。来源标签／家族归属不代表学术确认。</p>
 <input aria-label="检索地区政权地点选项" placeholder="检索中英文名称、别名或状态…" value={search} onChange={e=>setSearch(e.target.value)}/>
 <button type="button" onClick={onClear}>清除地区／政权／地点</button>
 {(['region','polity','place'] as const).map(d=><details key={d} className="geo-dimension"><summary>{labels[d]} · 已选 {selection[d].length}</summary>
 <div className="geo-selected">{selection[d].map(id=><button key={id} onClick={()=>onChange(d,selection[d].filter(x=>x!==id))}>{index.nodes.find(n=>n.id===id)?.zh||id} ×</button>)}</div>
 <div className="geo-options">{index.nodes.filter(n=>n.dimension===d&&(!q||[n.name,n.zh,n.status,n.evidenceState,...n.aliases].join(' ').toLowerCase().includes(q))).map(n=><div key={n.id} className="geo-option">
 <label><input type="checkbox" checked={selection[d].includes(n.id)} onChange={()=>onChange(d,selection[d].includes(n.id)?selection[d].filter(x=>x!==n.id):[...selection[d],n.id])}/><span>{n.zh} · {n.name}<small>{n.status} · {n.source_status}</small></span><b>{counts.get(n.id)||0}</b></label>
 <details><summary>状态与依据</summary><p>{n.note}</p><p>{n.evidenceState}；地点角色：{n.roles.join(' / ')||'未记录'}；来源／字段依据 {n.references.length} 项。</p><p>别名：{n.aliases.join(' / ')}；关联家族 {n.relatedFamilies.length}，地点 {n.relatedPlaces.length}，地区 {n.relatedRegions.length}（已有字段共现）。</p><ul>{n.references.map((r,i)=><li key={i}>{r.source_status} · {r.note}<small>{r.reference}</small></li>)}</ul></details>
 </div>)}</div></details>)}
 </div>;
}
