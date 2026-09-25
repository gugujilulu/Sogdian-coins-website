'use client';
// Temporary UI fixture: mount at app/t18-check/page.tsx for 404 verification, remove before build.
import {useEffect,useState} from 'react';
import TerrainMap from '@/components/atlas/terrain-map';
import type {Atlas} from '@/lib/atlas';
export default function CoinMapFixture(){
 const [data,setData]=useState<Atlas|null>(null),[selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{fetch('/data/atlas.json').then(async r=>await r.json() as Atlas).then((atlas:Atlas)=>setData({...atlas,specimens:atlas.specimens.filter(r=>r.familyId==='lady-nana').slice(0,1).map(r=>({...r,images:r.images.map(i=>({...i,path:'/t18-intentionally-missing.jpg'}))})),families:atlas.families.filter(f=>f.id==='lady-nana')}))},[]);
 if(!data)return <p>Loading fixture</p>;
 return <main className="atlas-app view-atlas"><header className="app-header">404 fixture — {selected?`Opened ${selected}`:'Select a family'}</header><section className="atlas-screen"><div className="atlas-map-stage"><TerrainMap active sourceFilter="all" data={data} records={data.specimens} families={data.families} selected={selected?data.families[0]:null} onSelect={setSelected} year={null} focus={0}/></div></section></main>;
}
