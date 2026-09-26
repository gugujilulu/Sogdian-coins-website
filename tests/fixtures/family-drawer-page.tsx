'use client';
// Mount at a temporary local route for missing-image/long-name acceptance; never changes the dataset.
import {useEffect,useState} from 'react';
import FamilyDrawer from '@/components/atlas/family-drawer';
import DetailDialog from '@/components/atlas/detail-dialog';
import ImageViewer from '@/components/atlas/image-viewer';
import type {Atlas,Specimen} from '@/lib/atlas';
export default function DrawerFixture(){
 const [data,setData]=useState<Atlas|null>(null),[open,setOpen]=useState(false),[visible,setVisible]=useState(true),[compared,setCompared]=useState<string[]>([]);
 useEffect(()=>{fetch('/data/atlas.json').then(r=>r.json()).then(d=>setData(d as Atlas))},[]);
 if(!data)return <p>Loading fixture</p>;
 const family={...data.families[0],title:'验收夹具：长标题与未记录图片、重量及直径 · '+data.families[0].title+' · 仅内存构造，不改研究数据',anchor:null};
 const record:Specimen={...data.specimens[0],id:'fixture-no-image',familyId:family.id,images:[],weightG:null,diameterMm:null};
 return <main className="atlas-app view-atlas"><header className="app-header">T19 可恢复边界夹具</header><section className="atlas-screen"><div className="atlas-map-stage"><p>无坐标，不提供定位动作。</p></div>{visible&&<FamilyDrawer family={family} placeName={null} specimens={[record]} allSpecimens={[record]} fullSpecimens={[record]} variants={[]} facets={[]} variant="all" facet="all" setVariant={()=>{}} setFacet={()=>{}} onClose={()=>setVisible(false)} onCatalogue={()=>{}} onOpen={()=>setOpen(true)} onCompare={id=>setCompared(old=>old.length?[]:[id])} compareIds={compared} onFullFamily={()=>{}} sources={new Map()} sourceIndexError/>}</section>{open&&<DetailDialog title="缺图详情夹具" onClose={()=>setOpen(false)}><ImageViewer images={[]} imageId={null} onSelect={()=>{}}/><p>文字详情仍可阅读</p></DetailDialog>}</main>;
}
