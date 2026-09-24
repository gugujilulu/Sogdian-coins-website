'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Map as GLMap} from 'maplibre-gl';
import type {Atlas,Family,Specimen} from '@/lib/atlas';
import {overlaps} from '@/lib/atlas';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props={active:boolean;data:Atlas;records:Specimen[];families:Family[];selected:Family|null;onSelect:(id:string)=>void;year:number|null;focus:number};
type CoinFeature={type:'Feature';geometry:{type:'Point';coordinates:[number,number]};properties:{placeId:string;familyIds:string;familyCount:number;specimenCount:number}};

export default function TerrainMap({active,data,records,families,selected,onSelect,year,focus}:Props){
 const container=useRef<HTMLDivElement>(null),map=useRef<GLMap|null>(null),select=useRef(onSelect),latestFamilies=useRef(families);
 const lastFocus=useRef('');
 const coinPopup=useRef<import('maplibre-gl').Popup|null>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[base,setBase]=useState('terrain'),[showContext,setShowContext]=useState(false);
 select.current=onSelect;latestFamilies.current=families;
 const familyCounts=useMemo(()=>{const m=new Map<string,number>();for(const s of records)m.set(s.familyId,(m.get(s.familyId)||0)+1);return m},[records]);
 const makeCoinFeatures=():CoinFeature[]=>{
  const groups=new Map<string,Family[]>();
  for(const f of latestFamilies.current){if(!f.anchor)continue;const arr=groups.get(f.anchor.placeId)||[];arr.push(f);groups.set(f.anchor.placeId,arr)}
  return [...groups.entries()].flatMap(([placeId,group])=>{const p=data.places.find(x=>x.id===placeId);if(!p)return[];return[{type:'Feature' as const,geometry:{type:'Point' as const,coordinates:p.coordinates},properties:{placeId,familyIds:JSON.stringify(group.map(x=>x.id)),familyCount:group.length,specimenCount:group.reduce((n,f)=>n+(familyCounts.get(f.id)||0),0)}}]});
 };
 useEffect(()=>{let disposed=false;let cleanup=()=>{};
  import('maplibre-gl').then(gl=>{
   if(disposed||!container.current)return;
   try{
    const m=new gl.Map({container:container.current,center:[73,40.7],zoom:4.65,minZoom:3,maxZoom:13,maxBounds:[[43,24],[103,56]],attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false,touchPitch:false,renderWorldCopies:false,style:{version:8,sources:{physical:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:8,attribution:'Physical: Esri / US National Park Service'},terrain:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:13,attribution:'Shaded relief: © Esri'},topo:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Topography: Esri, HERE, Garmin, USGS, GEBCO, © OpenStreetMap contributors'}},layers:[{id:'terrain',type:'raster',source:'terrain'},{id:'physical',type:'raster',source:'physical',paint:{'raster-opacity':['interpolate',['linear'],['zoom'],7,1,9,0]}},{id:'topo',type:'raster',source:'topo',layout:{visibility:'none'}}]}});
    map.current=m;m.touchZoomRotate.disableRotation();m.addControl(new gl.NavigationControl({showCompass:false}),'bottom-right');m.addControl(new gl.ScaleControl({unit:'metric'}),'bottom-left');
    m.on('load',()=>{
     if(disposed)return;
     m.addSource('places',{type:'geojson',data:{type:'FeatureCollection',features:data.places.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:p.coordinates},properties:{...p,label:p.name,minZoom:p.minZoom}}))}});
     m.addLayer({id:'historical-dots',type:'circle',source:'places',paint:{'circle-radius':['case',['==',['get','kind'],'site'],3.6,3],'circle-color':'#62422e','circle-stroke-color':'#f8ecd2','circle-stroke-width':1.2,'circle-opacity':.88}});
     const labels=data.places.map(p=>{const el=document.createElement('span');el.className='historical-label';el.textContent=p.name;new gl.Marker({element:el,anchor:'top',offset:[0,7]}).setLngLat(p.coordinates).addTo(m);return{p,el}});
     const layoutLabels=()=>{const used:{x:number;y:number;w:number}[]=[];for(const {p,el} of labels){const pos=m.project(p.coordinates),w=el.offsetWidth||110;const hit=used.some(b=>Math.abs(b.y-pos.y)<19&&Math.abs(b.x-pos.x)<(b.w+w)/2+4);const show=m.getZoom()>=p.minZoom&&!hit;el.style.visibility=show?'visible':'hidden';if(show)used.push({x:pos.x,y:pos.y,w})}};
     m.on('move',layoutLabels);layoutLabels();

     m.addSource('areas',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
     m.addLayer({id:'area-fill',type:'fill',source:'areas',paint:{'fill-color':['match',['get','kind'],'documented_circulation','#2b8589','inferred_distribution','#ae7d32','#6f806d'],'fill-opacity':.18}},'historical-dots');
     m.addLayer({id:'area-border',type:'line',source:'areas',paint:{'line-color':['match',['get','kind'],'documented_circulation','#216f73','inferred_distribution','#9b6e29','#637464'],'line-width':1.6,'line-dasharray':[4,3]}},'historical-dots');
     m.addSource('evidence',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
     m.addLayer({id:'findspots',type:'circle',source:'evidence',paint:{'circle-radius':6,'circle-color':['match',['get','kind'],'hoard','#167b80','findspot','#b15b37','#6a7180'],'circle-stroke-color':'#fff','circle-stroke-width':1.6}});

     m.addSource('coins',{type:'geojson',cluster:true,clusterRadius:48,clusterMaxZoom:8,clusterProperties:{family_total:['+',['get','familyCount']],specimen_total:['+',['get','specimenCount']]},data:{type:'FeatureCollection',features:makeCoinFeatures()}});
     m.addLayer({id:'coin-clusters',type:'circle',source:'coins',filter:['has','point_count'],paint:{'circle-radius':['step',['get','family_total'],12,4,16,10,21],'circle-color':'#17272c','circle-stroke-color':'#e7c885','circle-stroke-width':1.6,'circle-opacity':.92}});
     m.addLayer({id:'coin-cluster-count',type:'symbol',source:'coins',filter:['has','point_count'],layout:{'text-field':['to-string',['get','family_total']],'text-size':11},paint:{'text-color':'#f2dfb5'}});
     m.addLayer({id:'coin-stars',type:'circle',source:'coins',filter:['!',['has','point_count']],paint:{'circle-radius':['interpolate',['linear'],['zoom'],3,4,7,6.5,10,8],'circle-color':'#e5bc6d','circle-stroke-color':'#fff1c8','circle-stroke-width':1.2,'circle-opacity':.9,'circle-blur':.15}});
     m.addSource('selected-coin',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
     m.addLayer({id:'selected-halo',type:'circle',source:'selected-coin',paint:{'circle-radius':13,'circle-color':'#f4d692','circle-opacity':.16,'circle-stroke-color':'#f4d692','circle-stroke-width':2}});

     m.on('click','coin-clusters',async e=>{const feature=e.features?.[0];if(!feature||!map.current)return;const id=Number(feature.properties?.cluster_id);const src=map.current.getSource('coins') as import('maplibre-gl').GeoJSONSource;try{const zoom=await src.getClusterExpansionZoom(id);const coords=(feature.geometry as {coordinates:[number,number]}).coordinates;map.current.easeTo({center:coords,zoom,duration:450})}catch{}});
     m.on('click','coin-stars',e=>{const feature=e.features?.[0];if(!feature)return;let ids:string[]=[];try{ids=JSON.parse(String(feature.properties?.familyIds||'[]'))}catch{}if(ids.length===1){select.current(ids[0]);return}const coords=(feature.geometry as {coordinates:[number,number]}).coordinates;const node=document.createElement('div');node.className='coin-popup';const head=document.createElement('div');head.className='coin-popup-head';head.textContent=`${ids.length} coin families`;node.appendChild(head);for(const id of ids){const f=latestFamilies.current.find(x=>x.id===id);if(!f)continue;const b=document.createElement('button');b.type='button';b.className='coin-popup-row';const img=document.createElement('img');img.src=f.image;img.alt='';const text=document.createElement('span');const strong=document.createElement('strong');strong.textContent=f.title;const small=document.createElement('small');small.textContent=f.region;b.appendChild(img);b.appendChild(text);text.appendChild(strong);text.appendChild(small);b.onclick=()=>{select.current(id);popup.remove()};node.appendChild(b)}coinPopup.current?.remove();const popup=new gl.Popup({closeButton:true,maxWidth:'320px'}).setLngLat(coords).setDOMContent(node).addTo(m);coinPopup.current=popup});
     m.on('click','historical-dots',e=>{const p=e.features?.[0]?.properties;if(!p)return;const node=document.createElement('div');const title=document.createElement('strong');title.textContent=p.name+' · '+p.zh;node.appendChild(title);const text=document.createElement('p');text.textContent=p.note+' · '+p.precision;node.appendChild(text);const link=document.createElement('a');link.href=p.source;link.target='_blank';link.rel='noreferrer';link.textContent='Geographic source ↗';node.appendChild(link);new gl.Popup().setLngLat(e.lngLat).setDOMContent(node).addTo(m)});
     m.on('click','findspots',e=>{const p=e.features?.[0]?.properties;if(!p)return;const node=document.createElement('div');node.textContent=p.note;const a=document.createElement('a');a.href=p.source;a.target='_blank';a.rel='noreferrer';a.textContent=' Evidence ↗';node.appendChild(a);new gl.Popup().setLngLat(e.lngLat).setDOMContent(node).addTo(m)});
     for(const layer of ['historical-dots','findspots','coin-clusters','coin-stars']){m.on('mouseenter',layer,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',layer,()=>m.getCanvas().style.cursor='')}
     setReady(true);
    });
    let failures=0;m.on('error',()=>{if(++failures>=4)setError('部分地图瓦片未能加载，可切换底图或稍后重试。')});
    const resize=new ResizeObserver(()=>{if(container.current?.clientWidth&&container.current?.clientHeight)m.resize()});resize.observe(container.current);cleanup=()=>{resize.disconnect();m.remove()};
   }catch{setError('当前浏览器未能启动交互地图；Catalogue 仍可正常浏览。')}
  });return()=>{disposed=true;cleanup();map.current=null};
 },[data]);
 useEffect(()=>{if(!ready||!map.current||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;let bright=false;const t=window.setInterval(()=>{if(!map.current?.getLayer('coin-stars'))return;bright=!bright;map.current.setPaintProperty('coin-stars','circle-opacity',bright?.96:.74)},1800);return()=>window.clearInterval(t)},[ready]);
 useEffect(()=>{if(!ready||!map.current)return;map.current.setMaxZoom(base==='terrain'?13:19);map.current.setLayoutProperty('physical','visibility',base==='terrain'?'visible':'none');map.current.setLayoutProperty('terrain','visibility',base==='terrain'?'visible':'none');map.current.setLayoutProperty('topo','visibility',base==='topo'?'visible':'none')},[base,ready]);
 useEffect(()=>{if(!ready||!map.current)return;coinPopup.current?.remove();const src=map.current.getSource('coins') as import('maplibre-gl').GeoJSONSource;src?.setData({type:'FeatureCollection',features:makeCoinFeatures()})},[families,records,ready,data]);
 useEffect(()=>{if(!ready||!map.current)return;const m=map.current;const areas=data.areas.filter(a=>a.familyId===selected?.id&&overlaps(a.start,a.end,year)&&(a.kind!=='geographic_context'||showContext));(m.getSource('areas') as import('maplibre-gl').GeoJSONSource).setData({type:'FeatureCollection',features:areas.map(a=>({type:'Feature',geometry:a.geometry,properties:{kind:a.kind,title:a.title}}))});const evidence=data.evidence.filter(e=>e.familyId===selected?.id&&overlaps(e.start,e.end,year));(m.getSource('evidence') as import('maplibre-gl').GeoJSONSource).setData({type:'FeatureCollection',features:evidence.flatMap(e=>{const p=data.places.find(p=>p.id===e.placeId);return p?[{type:'Feature' as const,geometry:{type:'Point' as const,coordinates:p.coordinates},properties:e}]:[]})});const p=selected?.anchor?data.places.find(x=>x.id===selected.anchor?.placeId):null;(m.getSource('selected-coin') as import('maplibre-gl').GeoJSONSource).setData({type:'FeatureCollection',features:p?[{type:'Feature',geometry:{type:'Point',coordinates:p.coordinates},properties:{}}]:[]})},[data,selected,year,ready,showContext]);
 useEffect(()=>{if(active&&ready)map.current?.resize()},[active,ready]);
 useEffect(()=>{if(!active||!ready||!map.current)return;if(!selected?.anchor){lastFocus.current='';return}const key=selected.id+':'+focus;if(lastFocus.current===key)return;lastFocus.current=key;const p=data.places.find(p=>p.id===selected.anchor?.placeId);if(p){map.current.resize();const small=window.matchMedia('(max-width:760px)').matches;map.current.easeTo({center:p.coordinates,zoom:Math.max(6,map.current.getZoom()),offset:small?[0,-(container.current?.clientHeight||0)*.25]:[0,0],duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:550})}},[active,selected?.id,focus,ready,data]);
 const evidenceCount=data.evidence.filter(e=>e.familyId===selected?.id&&e.kind!=='context').length;
 return <div className="terrain-wrap"><div className="terrain-map" ref={container} aria-label="Interactive terrain map of Central Asia; drag to pan, scroll or pinch to zoom"/><div className="map-toolbar"><select aria-label="Basemap" value={base} onChange={e=>{setBase(e.target.value);setError('')}}><option value="terrain">Terrain · 地形</option><option value="topo">Topographic · 现代地形</option></select><button onClick={()=>map.current?.fitBounds([[59,34],[88,46]],{padding:60,duration:500})}>全域</button></div><details className="map-layer-note"><summary>图层说明</summary><div><span className="legend-star">✦</span>{families.filter(f=>f.anchor).length} 个有定位家族 · 聚合数字=family 数{selected&&<><b>·</b><span>{selected.title}</span><b>·</b><span>{evidenceCount?`${evidenceCount} 条出土/窖藏证据`:'暂无核定出土/流通图层'}</span></>}{data.areas.some(a=>a.familyId===selected?.id&&a.kind==='geographic_context')&&<label><input type="checkbox" checked={showContext} onChange={e=>setShowContext(e.target.checked)}/>地理背景</label>}</div></details>{error&&<div className="map-error" role="status">{error}</div>}</div>;
}
