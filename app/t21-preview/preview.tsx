'use client';
import {useEffect,useMemo,useState} from 'react';
import type {Atlas} from '@/lib/atlas';
import {defaultLayers,buildMapBackground} from '@/lib/map-layers';
import {buildGeographyIndex} from '@/lib/geography-index';
import TerrainMap from '@/components/atlas/terrain-map';
import FamilyDrawer from '@/components/atlas/family-drawer';

export default function Preview(){
 const [data,setData]=useState<Atlas|null>(null),[selected,setSelected]=useState(''),[error,setError]=useState(''),[focus,setFocus]=useState(0),[compare,setCompare]=useState<string[]>([]);
 useEffect(()=>{fetch('/data/atlas.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(value=>setData(value as Atlas)).catch(()=>setError('Atlas 加载失败，请刷新一次或返回正式页面。'))},[]);
 const background=useMemo(()=>data?buildMapBackground(data,buildGeographyIndex(data)):undefined,[data]);if(!data)return <p>{error||'视觉样张加载中…'}</p>;
 const family=data.families.find(f=>f.id===selected)||null,records=data.specimens.filter(s=>s.familyId===selected);
 return <div className="t21-preview"><header className="preview-header">ATLAS · 地图工坊 <small>西辽，1141年后｜局部范围 · Bregel 第15图</small><button onClick={()=>setSelected(background?.ranges.find(r=>r.objectId==='polity:qara-khitai')?.familyIds[0]||data.families[0].id)}>查看家族</button><a href="/">正式 Atlas ↗</a></header><div className="preview-stage"><div className="preview-map"><TerrainMap initialBase="historical" initialView={{center:[80.5,44.9],zoom:typeof window!=='undefined'&&window.innerWidth<=760?3.1:4.75}} active sourceFilter="all" data={data} records={data.specimens} families={data.families} selected={family} onSelect={setSelected} year={null} focus={focus} background={background} initialLayers={{...defaultLayers,polities:true}}/><div className="preview-badge">西辽，1141年后｜局部范围<small>Bregel · 2003 · 第15图 / p.31<br/>仅本部；附属范围未填色 · 东侧原图裁切</small></div></div>{family&&<FamilyDrawer family={family} placeName={data.places.find(p=>p.id===family.anchor?.placeId)?.name||null} specimens={records} allSpecimens={records} fullSpecimens={records} variants={data.variants.filter(v=>v.familyId===family.id)} facets={[]} variant="all" facet="all" setVariant={()=>{}} setFacet={()=>{}} onClose={()=>setSelected('')} onCatalogue={()=>location.assign(`/#view=catalogue&family=${encodeURIComponent(family.id)}`)} onOpen={s=>location.assign(`/#view=atlas&record=${encodeURIComponent(s.id)}`)} onCompare={id=>setCompare(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])} compareIds={compare} onFullFamily={()=>{}} onLocate={()=>setFocus(n=>n+1)} sources={new Map()} sourceIndexError={false}/>}</div></div>;
}
