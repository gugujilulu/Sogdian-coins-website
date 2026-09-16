'use client';
import {useEffect,useRef,useState} from 'react';
import type {Map as GLMap,Marker} from 'maplibre-gl';
import type {Atlas,Family} from '@/lib/atlas';
import {overlaps} from '@/lib/atlas';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props={data:Atlas;families:Family[];selected:Family|null;onSelect:(id:string)=>void;year:number|null;focus:number};
export default function TerrainMap({data,families,selected,onSelect,year,focus}:Props){
 const container=useRef<HTMLDivElement>(null),map=useRef<GLMap|null>(null),markers=useRef<Marker[]>([]),select=useRef(onSelect);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[base,setBase]=useState('terrain'),[showContext,setShowContext]=useState(false);
 select.current=onSelect;
 useEffect(()=>{let disposed=false;let cleanup=()=>{};
 import('maplibre-gl').then(gl=>{
 if(disposed||!container.current)return;
 try{
 const m=new gl.Map({container:container.current,center:[73,40.7],zoom:4.8,minZoom:3,maxZoom:13,maxBounds:[[43,24],[103,56]],attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false,touchPitch:false,renderWorldCopies:false,style:{version:8,sources:{physical:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:8,attribution:'Physical: Esri / US National Park Service'},terrain:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:13,attribution:'Shaded relief: © Esri'},topo:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Topography: Esri, HERE, Garmin, USGS, Intermap, increment P, GEBCO, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, METI, Esri Japan, Esri China (Hong Kong), © OpenStreetMap contributors, GIS User Community'}},layers:[{id:'terrain',type:'raster',source:'terrain'},{id:'physical',type:'raster',source:'physical',paint:{'raster-opacity':['interpolate',['linear'],['zoom'],7,1,9,0]}},{id:'topo',type:'raster',source:'topo',layout:{visibility:'none'}}]}});
 map.current=m;m.touchZoomRotate.disableRotation();m.addControl(new gl.ScaleControl({unit:'metric'}),'bottom-left');
 m.on('load',()=>{
 if(disposed)return;
 m.addSource('places',{type:'geojson',data:{type:'FeatureCollection',features:data.places.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:p.coordinates},properties:{...p,label:p.name,minZoom:p.minZoom}}))}});
 m.addLayer({id:'historical-dots',type:'circle',source:'places',paint:{'circle-radius':['case',['==',['get','kind'],'site'],4,3],'circle-color':'#714a2e','circle-stroke-color':'#fff3d7','circle-stroke-width':1.4}});
 // Local DOM labels avoid a remote font service and keep historical names readable.
 const labels=data.places.map(p=>{const el=document.createElement('span');el.className='historical-label';el.textContent=p.name;new gl.Marker({element:el,anchor:'top',offset:[0,8]}).setLngLat(p.coordinates).addTo(m);return {p,el}});
 const layoutLabels=()=>{const used:{x:number;y:number;w:number}[]=[];for(const {p,el} of labels){const pos=m.project(p.coordinates),w=el.offsetWidth||130;const hit=used.some(b=>Math.abs(b.y-pos.y)<22&&Math.abs(b.x-pos.x)<(b.w+w)/2+5);const show=m.getZoom()>=p.minZoom&&!hit;el.style.visibility=show?'visible':'hidden';if(show)used.push({x:pos.x,y:pos.y,w})}};
 m.on('move',layoutLabels);layoutLabels();

 m.addSource('areas',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
 m.addLayer({id:'area-fill',type:'fill',source:'areas',paint:{'fill-color':['match',['get','kind'],'documented_circulation','#197d82','inferred_distribution','#b8862d','#748568'],'fill-opacity':.2}},'historical-dots');
 m.addLayer({id:'area-border',type:'line',source:'areas',paint:{'line-color':'#49716b','line-width':1.5,'line-dasharray':[4,3]}},'historical-dots');
 m.addSource('evidence',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
 m.addLayer({id:'findspots',type:'circle',source:'evidence',paint:{'circle-radius':7,'circle-color':['match',['get','kind'],'hoard','#167b80','findspot','#b15b37','#6a7180'],'circle-stroke-color':'#fff','circle-stroke-width':2}});
 m.on('click','historical-dots',e=>{const p=e.features?.[0]?.properties;if(!p)return;const node=document.createElement('div');const title=document.createElement('strong');title.textContent=p.name+' · '+p.zh;node.appendChild(title);const text=document.createElement('p');text.textContent=p.note+' · '+p.precision;node.appendChild(text);const link=document.createElement('a');link.href=p.source;link.target='_blank';link.rel='noreferrer';link.textContent='Geographic source ↗';node.appendChild(link);new gl.Popup().setLngLat(e.lngLat).setDOMContent(node).addTo(m)});
 m.on('click','findspots',e=>{const p=e.features?.[0]?.properties;if(!p)return;const node=document.createElement('div');node.textContent=p.note;const a=document.createElement('a');a.href=p.source;a.target='_blank';a.rel='noreferrer';a.textContent=' Evidence ↗';node.appendChild(a);new gl.Popup().setLngLat(e.lngLat).setDOMContent(node).addTo(m)});
 for(const layer of ['historical-dots','findspots']){m.on('mouseenter',layer,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',layer,()=>m.getCanvas().style.cursor='')}
 setReady(true);
 });
 let failures=0;m.on('error',()=>{if(++failures>=4)setError('Some map tiles could not load. You can switch basemaps or try again.');});
 const resize=new ResizeObserver(()=>m.resize());resize.observe(container.current);cleanup=()=>{resize.disconnect();m.remove()};
 }catch{setError('This browser could not start the interactive map. The searchable type catalogue remains available below.')}
 });return()=>{disposed=true;cleanup();map.current=null};
 },[data]);
 useEffect(()=>{if(!ready||!map.current)return;map.current.setMaxZoom(base==='terrain'?13:19);map.current.setLayoutProperty('physical','visibility',base==='terrain'?'visible':'none');map.current.setLayoutProperty('terrain','visibility',base==='terrain'?'visible':'none');map.current.setLayoutProperty('topo','visibility',base==='topo'?'visible':'none')},[base,ready]);
 useEffect(()=>{if(!ready||!map.current)return;let cancelled=false;import('maplibre-gl').then(gl=>{if(cancelled||!map.current)return;markers.current.forEach(m=>m.remove());markers.current=[];
 // Coin families sharing an anchor form a screen-space fan. Geographic coordinates remain unchanged.
 const groups=new Map<string,Family[]>();for(const f of families){if(!f.anchor)continue;const a=groups.get(f.anchor.placeId)||[];a.push(f);groups.set(f.anchor.placeId,a)}
 groups.forEach((group,placeId)=>{const p=data.places.find(x=>x.id===placeId);if(!p)return;
 group.forEach((f,i)=>{const el=document.createElement('button');el.type='button';el.className='coin-pin'+(selected?.id===f.id?' chosen':'');el.setAttribute('aria-label',f.title+' — '+p.name+'; '+f.anchor!.role);el.title=f.title+' · '+p.name+' · '+f.anchor!.role;
 const img=document.createElement('img');img.src=f.image;img.alt='';el.appendChild(img);const badge=document.createElement('span');badge.textContent=String(data.specimens.filter(s=>s.familyId===f.id).length);el.appendChild(badge);el.addEventListener('click',e=>{e.stopPropagation();select.current(f.id)});
 const cols=Math.min(3,group.length),dx=(i%cols-(cols-1)/2)*57,dy=-44-Math.floor(i/cols)*57;
 const marker=new gl.Marker({element:el,offset:[dx,dy]}).setLngLat(p.coordinates).addTo(map.current!);markers.current.push(marker)
 });});});return()=>{cancelled=true};},[data,families,selected,ready]);
 useEffect(()=>{if(!ready||!map.current)return;const m=map.current;
 const areas=data.areas.filter(a=>a.familyId===selected?.id&&overlaps(a.start,a.end,year)&&(a.kind!=='geographic_context'||showContext));
 (m.getSource('areas') as import('maplibre-gl').GeoJSONSource).setData({type:'FeatureCollection',features:areas.map(a=>({type:'Feature',geometry:a.geometry,properties:{kind:a.kind,title:a.title}}))});
 const evidence=data.evidence.filter(e=>e.familyId===selected?.id&&overlaps(e.start,e.end,year));
 (m.getSource('evidence') as import('maplibre-gl').GeoJSONSource).setData({type:'FeatureCollection',features:evidence.flatMap(e=>{const p=data.places.find(p=>p.id===e.placeId);return p?[{type:'Feature' as const,geometry:{type:'Point' as const,coordinates:p.coordinates},properties:e}]:[]})});
 },[data,selected,year,ready,showContext]);
 useEffect(()=>{if(!ready||!map.current||!selected?.anchor)return;const p=data.places.find(p=>p.id===selected.anchor?.placeId);if(p)map.current.easeTo({center:p.coordinates,zoom:Math.max(6,map.current.getZoom()),duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:700})},[selected?.id,focus,ready,data]);
 const evidenceCount=data.evidence.filter(e=>e.familyId===selected?.id&&e.kind!=='context').length;
 return <div className="terrain-wrap"><div className="terrain-map" ref={container} aria-label="Interactive terrain map of Central Asia; drag to pan, scroll or pinch to zoom"/><div className="map-toolbar"><select aria-label="Basemap" value={base} onChange={e=>{setBase(e.target.value);setError('')}}><option value="terrain">Terrain · 地形</option><option value="topo">Topographic detail · 现代地形参考</option></select><button onClick={()=>map.current?.fitBounds([[59,34],[88,46]],{padding:65,duration:600})}>全域 / Overview</button></div><div className="map-legend"><strong>{selected?selected.title:'CENTRAL ASIA · 中亚'}</strong><span>拖拽平移 · 滚轮／双指缩放</span><span>● 历史城市与遗址　◎ 钱币家族展示锚点</span>{selected&&<span>{evidenceCount?`${evidenceCount} documented find / hoard records`:'本类型的出土点与流通范围：尚待逐条证据核定'}</span>}{data.areas.some(a=>a.familyId===selected?.id&&a.kind==='geographic_context')&&<label><input type="checkbox" checked={showContext} onChange={e=>setShowContext(e.target.checked)}/>显示地理背景范围</label>}</div>{error&&<div className="map-error" role="status">{error}</div>}</div>
}
