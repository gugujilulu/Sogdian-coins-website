'use client';
// Temporary local route only. Version dates are fixtures; geometry reuses the existing sample in memory.
import {useEffect,useMemo,useState} from 'react';
import type {Atlas} from '@/lib/atlas';
import {buildMapBackground,defaultLayers,type MapTime} from '@/lib/map-layers';
import {buildGeographyIndex} from '@/lib/geography-index';
import {useRangeSelection} from '@/components/atlas/use-range-selection';
import TerrainMap from '@/components/atlas/terrain-map';
export default function RangeTimeFixture(){
 const [data,setData]=useState<Atlas|null>(null),[mode,setMode]=useState<MapTime['mode']>('all'),[year,setYear]=useState(1141),[fixture,setFixture]=useState(false);
 useEffect(()=>{fetch('/data/atlas.json').then(r=>r.json()).then(value=>setData(value as Atlas))},[]);
 const control=useRangeSelection(JSON.stringify([fixture,mode,year]));
 const background=useMemo(()=>{
  if(!data)return;
  const b=buildMapBackground(data,buildGeographyIndex(data)),sample=b.ranges.find(r=>r.geometry);
  if(!sample)return b;
  return{places:b.places,ranges:fixture?[{...sample,id:'fixture-v2',objectId:'fixture-polity',title:'夹具版本乙',labelTitle:'版本乙（夹具）',labelLatin:'1200–1250年 · 测试',start:1200,end:1250,timeEvidence:undefined,periodText:'1200–1250年（测试夹具）',source:'fixture:second-version',note:'仅用于版本切换验证，不是新历史资料'},{...sample,id:'fixture-v1',objectId:'fixture-polity',title:'夹具版本甲',labelTitle:'版本甲（夹具）',labelLatin:'1100–1150年 · 测试',start:1100,end:1150,timeEvidence:undefined,periodText:'1100–1150年（测试夹具）',source:'fixture:first-version',note:'仅用于版本切换验证，不是新历史资料'}]:[sample]};
 },[data,fixture]);
 if(!data||!background)return <p>Loading fixture</p>;
 return <div className="t21-preview"><header className="preview-header">T22-2 本地验收夹具 <select aria-label="测试年代模式" value={mode} onChange={e=>setMode(e.target.value as MapTime['mode'])}><option value="all">全部时期</option><option value="year">指定年份</option><option value="unknown">年代未知</option></select><input aria-label="测试年份" type="number" value={year} onChange={e=>setYear(Number(e.target.value))}/><label><input type="checkbox" checked={fixture} onChange={e=>setFixture(e.target.checked)}/>多版本夹具</label></header><div className="preview-stage"><div className="preview-map"><TerrainMap rangeControl={control} background={background} initialBase="historical" initialView={{center:[80.5,44.9],zoom:4.5}} initialLayers={{...defaultLayers,polities:true}} active data={data} families={data.families} records={data.specimens} sourceFilter="all" selected={null} onSelect={()=>{}} year={year} dateMode={mode} focus={0}/></div></div></div>;
}
