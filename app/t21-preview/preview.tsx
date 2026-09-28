'use client';
import {useEffect,useMemo,useState} from 'react';
import type {Atlas} from '@/lib/atlas';
import {defaultLayers} from '@/lib/map-layers';
import TerrainMap from '@/components/atlas/terrain-map';
import FamilyDrawer from '@/components/atlas/family-drawer';
import {visualFixture} from './fixture';
export default function Preview(){
 const [data,setData]=useState<Atlas|null>(null),[selected,setSelected]=useState(''),[error,setError]=useState(''),[focus,setFocus]=useState(0),[compare,setCompare]=useState<string[]>([]);
 useEffect(()=>{fetch('/data/atlas.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(value=>setData(value as Atlas)).catch(()=>setError('Atlas 加载失败，请刷新一次或返回正式页面。'))},[]);
 const background=useMemo(()=>data?visualFixture(data):undefined,[data]);if(!data)return <p>{error||'视觉样张加载中…'}</p>;
 const family=data.families.find(f=>f.id===selected)||null,records=data.specimens.filter(s=>s.familyId===selected);
 return <div className="t21-preview"><header className="preview-header">ATLAS · 地图工坊 <small>T21 视觉样张 · 范围、时期及新增角色均为演示，不进入生产数据</small><button onClick={()=>setSelected(data.families.find(f=>f.title.includes('Nana'))?.id||data.families[0].id)}>查看家族</button><a href="/">正式 Atlas ↗</a></header><div className="preview-stage"><div className="preview-map"><TerrainMap initialView={{center:[70,41.2],zoom:4.8}} active sourceFilter="all" data={data} records={data.specimens} families={data.families} selected={family} onSelect={setSelected} year={null} focus={focus} background={background} initialLayers={{...defaultLayers,centers:true,sites:true,hoards:true,polities:true}}/><div className="preview-badge">七河 — 粟特<small>墨线／矿物色／真实地形<br/>实线与柔边仅演示制图语法</small></div></div>{family&&<FamilyDrawer family={family} placeName={data.places.find(p=>p.id===family.anchor?.placeId)?.name||null} specimens={records} allSpecimens={records} fullSpecimens={records} variants={data.variants.filter(v=>v.familyId===family.id)} facets={[]} variant="all" facet="all" setVariant={()=>{}} setFacet={()=>{}} onClose={()=>setSelected('')} onCatalogue={()=>location.assign(`/#view=catalogue&family=${encodeURIComponent(family.id)}`)} onOpen={s=>location.assign(`/#view=atlas&record=${encodeURIComponent(s.id)}`)} onCompare={id=>setCompare(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])} compareIds={compare} onFullFamily={()=>{}} onLocate={()=>setFocus(n=>n+1)} sources={new Map()} sourceIndexError={false}/>}</div></div>;
}
