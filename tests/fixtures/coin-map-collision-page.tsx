'use client';
// Temporary route for screen-collision acceptance; synthetic coordinates never touch atlas.json.
import {useEffect,useMemo,useState} from 'react';
import TerrainMap from '@/components/atlas/terrain-map';
import type {Atlas,Family,Specimen} from '@/lib/atlas';
export default function CollisionFixture(){
 const [original,setOriginal]=useState<Atlas|null>(null),[compact,setCompact]=useState(false),[selected,setSelected]=useState('fixture-a');
 useEffect(()=>{fetch('/data/atlas.json').then(async r=>await r.json() as Atlas).then(setOriginal)},[]);
 const data=useMemo(()=>{if(!original)return null;
  const base=original.families.find(f=>f.id==='lady-nana')!,record=original.specimens.find(r=>r.familyId===base.id&&r.images.length)!;
  const places=original.places.slice(0,2).map((p,i)=>({...p,id:`fixture-place-${i}`,name:`Fixture ${i?'B':'A'}`,zh:'碰撞夹具',coordinates:[73+i*.025,40.7] as [number,number]}));
  const families:Family[]=places.map((p,i)=>({...base,id:`fixture-${i?'b':'a'}`,title:`Fixture family ${i?'B':'A'}`,anchor:{placeId:p.id,role:'测试展示锚点',note:'仅内存夹具，非真实地理归属'}}));
  const specimens:Specimen[]=families.map((f,i)=>({...record,id:`fixture-record-${i}`,familyId:f.id,images:i||compact?[]:record.images.slice(0,1)}));
  return {...original,places,families,specimens,areas:[],evidence:[]};
 },[original,compact]);
 if(!data)return <p>Loading fixture</p>;
 return <main className="atlas-app view-atlas"><header className="app-header"><button onClick={()=>setCompact(false)}>图片 + compact</button><button onClick={()=>setCompact(true)}>两个 compact</button><span>选中：{selected}</span></header><section className="atlas-screen"><div className="atlas-map-stage"><TerrainMap active sourceFilter="all" data={data} records={data.specimens} families={data.families} selected={data.families.find(f=>f.id===selected)||null} onSelect={setSelected} year={null} focus={0}/></div></section></main>;
}
