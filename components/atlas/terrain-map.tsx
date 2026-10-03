'use client';
import {useLanguage,useCopy} from './language';
import {copyKnown} from '@/lib/i18n';
import {motionDuration} from '@/lib/motion';
import ArtIcon from '@/components/visual/ArtIcon';
import {anchorPan,type CollectionContext} from '@/lib/map-selection';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Map as GLMap} from 'maplibre-gl';
import type {Atlas,Family,Specimen} from '@/lib/atlas';
import {buildMapBackground,defaultLayers,effectiveLayers,backgroundLayers,visibleRanges,placeClaims,rangeBounds,rangeFocusMaxZoom,type MapBackground,type LayerSettings} from '@/lib/map-layers';
import {buildGeographyIndex} from '@/lib/geography-index';
import {installHistoricalMap} from './historical-map-renderer';
import {useRangeSelection} from './use-range-selection';
import type {RangeControl} from './range-controls';
import {mapPadding,mobileViewport} from '@/lib/mobile-sheet';
import MapLayerPanel from './map-layer-panel';
import {recordSourceProvider} from '@/lib/record-filters';
import {coinFeatures,coinPlaces,coinDisplayRules} from '@/lib/coin-map';
import {installCoinMarkers} from './coin-map-markers';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props={rangeControl?:RangeControl;initialBase?:'terrain'|'historical'|'topo';initialView?:{center:[number,number];zoom:number};background?:MapBackground;initialLayers?:LayerSettings;backgroundEnabled?:boolean;backgroundObject?:string;rangeFocus?:number;dateMode?:'all'|'year'|'unknown';active:boolean;sourceFilter:string;data:Atlas;records:Specimen[];families:Family[];selected:Family|null;onSelect:(id:string,context?:CollectionContext)=>void;returnCollection?:{context:CollectionContext;serial:number}|null;onCollectionEmpty?:()=>void;year:number|null;focus:number};

export default function TerrainMap({rangeControl:providedControl,active,sourceFilter,data,records,families,selected,onSelect,year,focus,returnCollection,onCollectionEmpty,initialView,initialBase='terrain',background:providedBackground,initialLayers,backgroundEnabled=false,backgroundObject,rangeFocus=0,dateMode='all'}:Props){
 const tr=useCopy();const {locale}=useLanguage();
 const container=useRef<HTMLDivElement>(null),map=useRef<GLMap|null>(null),select=useRef(onSelect);
 const lastFocus=useRef(focus),lastRangeFocus=useRef(rangeFocus);
 const history=useRef<ReturnType<typeof installHistoricalMap>|null>(null);
 const background=useMemo(()=>providedBackground||buildMapBackground(data,buildGeographyIndex(data)),[data,providedBackground]);
 const [layers,setLayers]=useState(initialLayers||defaultLayers),[layerError,setLayerError]=useState(''),[retried,setRetried]=useState(false),[rangeNotice,setRangeNotice]=useState('');
 const effective=effectiveLayers(layers,selected?backgroundLayers(background,selected.id):{},backgroundEnabled&&!!selected);
 const effectiveRef=useRef(effective);effectiveRef.current=effective;
 const time={mode:dateMode,year:year??0};
 const ownControl=useRangeSelection(JSON.stringify([selected?.id,backgroundObject,dateMode,year]));
 const rangeControl=providedControl||ownControl;
 const {versions,backgrounds}=rangeControl.selection;
 const baseRanges=visibleRanges(background,layers,time,undefined,versions,backgrounds);
 const associated=background.ranges.filter(r=>r.familyIds.includes(selected?.id||''));
 const objects=Array.from(new Set(associated.map(r=>r.objectId)));
 const chosenObject=backgroundObject||(objects.length===1?objects[0]:undefined);
 const temporaryRanges=backgroundEnabled&&selected&&chosenObject?visibleRanges(background,effective,time,selected.id,versions,backgrounds).filter(r=>r.objectId===chosenObject):[];
 const ranges=Array.from(new Map([...baseRanges,...temporaryRanges].map(r=>[r.id,r])).values());
 const frameRef=useRef({ranges,places:background.places.map(place=>({place,claims:placeClaims(place,effective,time,selected?.id)})).filter(p=>p.claims.length)});
 frameRef.current={ranges,places:background.places.map(place=>({place,claims:placeClaims(place,effective,time,selected?.id)})).filter(p=>p.claims.length)};
 const coinMarkers=useRef<ReturnType<typeof installCoinMarkers>|null>(null);
 const selectedRef=useRef(selected?.id);selectedRef.current=families.some(f=>f.id===selected?.id)?selected?.id:undefined;
 const previousSelection=useRef(selected?.id);
 const groups=useMemo(()=>coinPlaces(families,records,data.places,image=>sourceFilter==='all'||recordSourceProvider({url:image.sourceRecordUrl||'',label:'',relation:'same_specimen'})===sourceFilter),[families,records,data,sourceFilter]);
 const groupsRef=useRef(groups);groupsRef.current=groups;
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[base,setBase]=useState<string>(initialBase);
 select.current=onSelect;
 const makeCoinFeatures=()=>coinFeatures(effectiveRef.current.coins?groupsRef.current:[]);
 useEffect(()=>{let disposed=false;let cleanup=()=>{};
  import('maplibre-gl').then(gl=>{
   if(disposed||!container.current)return;
   try{
    const m=new gl.Map({container:container.current,center:initialView?.center||[73,40.7],zoom:initialView?.zoom??4.65,minZoom:3,maxZoom:13,maxBounds:initialView?undefined:[[43,24],[103,56]],attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false,touchPitch:false,renderWorldCopies:false,style:{version:8,sources:{physical:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:8,attribution:'Physical: Esri / US National Park Service'},terrain:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:13,attribution:'Shaded relief: © Esri'},topo:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Topography: Esri, HERE, Garmin, USGS, GEBCO, © OpenStreetMap contributors'}},layers:[{id:'terrain',type:'raster',source:'terrain'},{id:'physical',type:'raster',source:'physical',paint:{'raster-opacity':['interpolate',['linear'],['zoom'],7,1,9,0]}},{id:'topo',type:'raster',source:'topo',layout:{visibility:'none'}}]}});
    map.current=m;m.touchZoomRotate.disableRotation();m.addControl(new gl.NavigationControl({showCompass:false}),'bottom-right');m.addControl(new gl.ScaleControl({unit:'metric'}),'bottom-left');
    m.on('style.load',()=>{
     if(disposed)return;
     history.current?.destroy();coinMarkers.current?.destroy();
     if(!m.getSource('coins'))m.addSource('coins',{type:'geojson',cluster:true,clusterRadius:coinDisplayRules.clusterRadius,clusterMaxZoom:coinDisplayRules.clusterMaxZoom,clusterProperties:{family_total:['+',['get','familyCount']],specimen_total:['+',['get','specimenCount']]},data:{type:'FeatureCollection',features:makeCoinFeatures()}});
     if(!m.getLayer('coin-source-layout'))m.addLayer({id:'coin-source-layout',type:'circle',source:'coins',paint:{'circle-radius':1,'circle-opacity':0}});
     coinMarkers.current=installCoinMarkers(gl,m,()=>effectiveRef.current.coins?groupsRef.current:[],()=>selectedRef.current,(id,context)=>select.current(id,context));
     if(!m.getSource('selected-coin'))m.addSource('selected-coin',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
     if(!m.getLayer('selected-halo'))m.addLayer({id:'selected-halo',type:'circle',source:'selected-coin',paint:{'circle-radius':13,'circle-color':'#f4d692','circle-opacity':.16,'circle-stroke-color':'#f4d692','circle-stroke-width':2}});

     history.current=installHistoricalMap(gl,m,setLayerError);history.current.update(frameRef.current);
     setReady(true);
    });
    let failures=0;m.on('error',()=>{if(++failures>=4)setError('部分地图瓦片未能加载，可切换底图或稍后重试。')});
    const resize=new ResizeObserver(()=>{if(container.current?.clientWidth&&container.current?.clientHeight)m.resize()});resize.observe(container.current);cleanup=()=>{resize.disconnect();history.current?.destroy();history.current=null;coinMarkers.current?.destroy();coinMarkers.current=null;m.remove()};
   }catch{setError('当前浏览器未能启动交互地图；Catalogue 仍可正常浏览。')}
  });return()=>{disposed=true;cleanup();map.current=null};
 },[data]);
 useEffect(()=>{if(!ready||!map.current)return;const m=map.current,historical=base==='historical';m.setMaxZoom(base==='topo'?19:13);for(const id of ['physical','terrain']){m.setLayoutProperty(id,'visibility',base!=='topo'?'visible':'none');m.setPaintProperty(id,'raster-saturation',historical?-.35:0);m.setPaintProperty(id,'raster-contrast',historical?-.18:0);m.setPaintProperty(id,'raster-brightness-min',historical?.25:0);m.setPaintProperty(id,'raster-brightness-max',1);}m.setLayoutProperty('topo','visibility',base==='topo'?'visible':'none')},[base,ready]);
 useEffect(()=>{if(!ready||!map.current)return;coinMarkers.current?.refresh();const src=map.current.getSource('coins') as import('maplibre-gl').GeoJSONSource;src?.setData({type:'FeatureCollection',features:makeCoinFeatures()})},[groups,ready,data,layers.coins]);
 useEffect(()=>{if(!ready||!map.current)return;history.current?.update(frameRef.current);coinMarkers.current?.refresh();const p=effective.coins&&families.some(f=>f.id===selected?.id)&&selected?.anchor?data.places.find(x=>x.id===selected.anchor?.placeId):null;(map.current.getSource('selected-coin') as import('maplibre-gl').GeoJSONSource)?.setData({type:'FeatureCollection',features:p?[{type:'Feature',geometry:{type:'Point',coordinates:p.coordinates},properties:{}}]:[]})},[data,selected,families,year,dateMode,ready,layers,versions,backgrounds,backgroundEnabled,backgroundObject,background]);
 useEffect(()=>{if(!ready)return;coinMarkers.current?.refresh();history.current?.update(frameRef.current,true);const root=map.current?.getContainer();for(const [selector,key]of [['.maplibregl-ctrl-zoom-in','Zoom in'],['.maplibregl-ctrl-zoom-out','Zoom out'],['.maplibregl-ctrl-attrib-button','Toggle attribution']] as const){const button=root?.querySelector(selector);button?.setAttribute('aria-label',tr(key));button?.setAttribute('title',tr(key))}},[locale,ready]);
 useEffect(()=>{const closed=previousSelection.current&&!selected?.id&&!returnCollection?previousSelection.current:undefined;previousSelection.current=selected?.id;coinMarkers.current?.selectionChanged(closed)},[selected?.id]);
 useEffect(()=>{if(active&&ready)map.current?.resize()},[active,ready]);
 useEffect(()=>{
  if(!active||!ready||!map.current)return;
  if(lastFocus.current===focus)return;lastFocus.current=focus;
  if(!selected?.anchor)return;
  const explicit=true;
  const place=data.places.find(p=>p.id===selected.anchor?.placeId);if(!place)return;
  const frame=requestAnimationFrame(()=>{
   const m=map.current,el=container.current;if(!m||!el)return;m.resize();
   const bounds=el.getBoundingClientRect();let bottom=bounds.height-65;
   const drawer=document.querySelector('.family-drawer')?.getBoundingClientRect();
   if(drawer&&drawer.left<bounds.right&&drawer.right>bounds.left)bottom=Math.min(bottom,drawer.top-bounds.top-32);
   const area={left:45,right:Math.max(46,bounds.width-55),top:45,bottom:Math.max(46,bottom)};
   const obstacles=Array.from(document.querySelectorAll('.atlas-search-panel,.map-toolbar,.history-controls')).map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height).map(r=>({left:r.left-bounds.left-30,right:r.right-bounds.left+30,top:r.top-bounds.top-30,bottom:r.bottom-bounds.top+30}));
   const point=m.project(place.coordinates);const pan=anchorPan(point,area,explicit,obstacles);
   if(pan[0]||pan[1])m.panBy(pan,{duration:motionDuration(400)});
  });return()=>cancelAnimationFrame(frame);
 },[active,selected?.id,focus,ready,data]);
 useEffect(()=>{if(!returnCollection||!ready)return;const frame=requestAnimationFrame(()=>{map.current?.resize();if(!coinMarkers.current?.returnToCollection(returnCollection.context))onCollectionEmpty?.()});return()=>cancelAnimationFrame(frame)},[returnCollection,ready]);
 useEffect(()=>{if(!ready||!map.current||lastRangeFocus.current===rangeFocus)return;lastRangeFocus.current=rangeFocus;const bounds=rangeBounds(frameRef.current.ranges.filter(r=>r.familyIds.includes(selected?.id||'')&&r.objectId===chosenObject));setRangeNotice(bounds?'':'当前时期没有可显示的相关范围；请选定背景体系和范围时期。');if(bounds)map.current.fitBounds(bounds,{padding:measuredPadding(),maxZoom:rangeFocusMaxZoom(bounds),duration:motionDuration(400)})},[rangeFocus,ready]);
 function measuredPadding(){const rect=container.current?.getBoundingClientRect()||{width:300,height:300,bottom:300},drawer=document.querySelector('.atlas-screen .family-drawer')?.getBoundingClientRect();return mapPadding(rect.width,rect.height,mobileViewport(window.innerWidth,window.innerHeight)&&drawer?Math.max(0,rect.bottom-drawer.top):0,mobileViewport(window.innerWidth,window.innerHeight))}
 return <div className="terrain-wrap"><div className="terrain-map" ref={container} aria-label={tr("Interactive terrain map of Central Asia; drag to pan, scroll or pinch to zoom")}/><div className="map-toolbar"><span className="basemap-icon"><ArtIcon name="range" size={21}/></span><select title={tr("底图")} aria-label={tr("Basemap")} value={base} onChange={e=>{setBase(e.target.value);setError('')}}><option value="historical">{tr("Historical · 历史地图")}</option><option value="terrain">{tr("Terrain · 地形")}</option><option value="topo">{tr("Topographic · 现代地形")}</option></select><button onClick={()=>map.current?.fitBounds([[59,34],[88,46]],{padding:measuredPadding(),duration:motionDuration(500)})} aria-label={tr("全域")}><ArtIcon name="fit" className="mobile-control-icon" size={21}/><span className="desktop-control-label">{tr("全域")}</span></button></div><MapLayerPanel base={layers} effective={effective} setBase={setLayers} background={background} ranges={ranges} renderedRoles={Array.from(new Set(frameRef.current.places.flatMap(p=>p.claims.map(c=>c.role))))} time={time} control={rangeControl}/>{backgroundEnabled&&selected&&<div className="background-notice">{tr('当前查看家族的背景')} · {locale==='zh'?(selected.zh||selected.title):selected.title}{!families.some(f=>f.id===selected.id)&&' · '+tr('不属于当前匹配结果')}</div>}{rangeNotice&&<div className="map-error" role="status">{copyKnown(rangeNotice)}<button onClick={()=>setRangeNotice('')}>{tr("关闭")}</button></div>}{(error||layerError)&&<div className="map-error" role="status">{copyKnown(error||layerError)}{!retried&&<button onClick={()=>{setRetried(true);setLayerError('');history.current?.retry();map.current?.triggerRepaint()}}>{tr("重试图层一次")}</button>}</div>}</div>;
}
