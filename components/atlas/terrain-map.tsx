import {initialMapCamera} from '@/lib/coin-cover-cycle';
import {fitHistoricalRange,rangeInitialMinZoom} from '@/lib/range-fit';
'use client';
import {useLanguage,useCopy} from './language';
import {copyKnown} from '@/lib/i18n';
import {installGestureZoomGain} from '@/lib/map-gesture-zoom';
import {motionDuration} from '@/lib/motion';
import ArtIcon from '@/components/visual/ArtIcon';
import {anchorPan,type CollectionContext} from '@/lib/map-selection';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Map as GLMap} from 'maplibre-gl';
import type {Atlas,Family,Specimen} from '@/lib/atlas';
import {buildMapBackground,defaultLayers,placeClaims,rangeBounds,type MapBackground,type LayerSettings} from '@/lib/map-layers';
import {historicalVisibleRanges} from '@/lib/range-linking';
import {buildGeographyIndex} from '@/lib/geography-index';
import {installHistoricalMap} from './historical-map-renderer';
import {useRangeSelection} from './use-range-selection';
import type {RangeControl} from './range-controls';
import {mapPadding,mobileViewport} from '@/lib/mobile-sheet';
import MapLayerPanel from './map-layer-panel';
import {recordSourceProvider} from '@/lib/record-filters';
import {coinFeatures,coinPlaces,coinDisplayRules,collectionCityTarget,collectionViewReady} from '@/lib/coin-map';
import {installCoinMarkers} from './coin-map-markers';
import {searchNavigationQueue,searchBounds,searchMapPadding,type SearchMapRequest,type MapCameraView} from '@/lib/search-map-navigation';
import 'maplibre-gl/dist/maplibre-gl.css';

type Props={rangeObjectName?:(id:string)=>string;layers?:LayerSettings;onLayers?:(layers:LayerSettings)=>void;onBackgroundObject?:(id:string)=>void;onCameraChange?:(camera:MapCameraView)=>void;searchRequest?:SearchMapRequest|null;rangeControl?:RangeControl;initialBase?:'terrain'|'historical'|'topo';basemap?:string;onBasemap?:(base:string)=>void;initialView?:{center:[number,number];zoom:number};background?:MapBackground;initialLayers?:LayerSettings;backgroundObject?:string;rangeFocus?:number;dateMode?:'all'|'year'|'unknown';active:boolean;sourceFilter:string;data:Atlas;records:Specimen[];families:Family[];selected:Family|null;onSelect:(id:string,context?:CollectionContext)=>void;returnCollection?:{context:CollectionContext;serial:number}|null;onCollectionEmpty?:()=>void;year:number|null;focus:number};

export default function TerrainMap({rangeObjectName,layers:providedLayers,onLayers,onBackgroundObject,onCameraChange,searchRequest,rangeControl:providedControl,active,sourceFilter,data,records,families,selected,onSelect,year,focus,returnCollection,onCollectionEmpty,initialView,initialBase='terrain',basemap,onBasemap,background:providedBackground,initialLayers,backgroundObject,rangeFocus=0,dateMode='all'}:Props){
 const tr=useCopy();const {locale}=useLanguage();
 const container=useRef<HTMLDivElement>(null),map=useRef<GLMap|null>(null),select=useRef(onSelect);
 const cameraChange=useRef(onCameraChange);cameraChange.current=onCameraChange;
 const searchQueue=useRef<ReturnType<typeof searchNavigationQueue>|null>(null),lastSearch=useRef(0);
 const [searchNotice,setSearchNotice]=useState(false);
 const [symbolZoom,setSymbolZoom]=useState(initialView?.zoom??4);
 const lastFocus=useRef(focus),lastRangeFocus=useRef(rangeFocus);
 const history=useRef<ReturnType<typeof installHistoricalMap>|null>(null);
 const background=useMemo(()=>providedBackground||buildMapBackground(data,buildGeographyIndex(data)),[data,providedBackground]);
 const [localLayers,setLocalLayers]=useState(initialLayers||defaultLayers),[layerError,setLayerError]=useState(''),[retried,setRetried]=useState(false),[rangeNotice,setRangeNotice]=useState('');
 const layers=providedLayers||localLayers,setLayers=onLayers||setLocalLayers;
 const [localBase,setLocalBase]=useState<string>(initialBase);
 const base=basemap||localBase,setBase=onBasemap||setLocalBase;
 const historicalEntered=useRef(false);
 useEffect(()=>{if(base==='historical'&&!historicalEntered.current){historicalEntered.current=true;if(!layers.polities)setLayers({...layers,polities:true})}},[base]);
 const effective={...layers,polities:base==='historical'&&layers.polities};
 const effectiveRef=useRef(effective);effectiveRef.current=effective;
 const time={mode:dateMode,year:year??0};
 const ownControl=useRangeSelection(JSON.stringify([selected?.id,backgroundObject,dateMode,year]));
 const rangeControl=providedControl||ownControl;
 const {versions,backgrounds}=rangeControl.selection;
 const chosenObject=backgroundObject;
 const ranges=historicalVisibleRanges(background,layers,time,base,chosenObject,versions,backgrounds,selected?.id);
 const frameRef=useRef({ranges,places:background.places.map(place=>({place,claims:placeClaims(place,effective,time,selected?.id)})).filter(p=>p.claims.length)});
 frameRef.current={ranges,places:background.places.map(place=>({place,claims:placeClaims(place,effective,time,selected?.id)})).filter(p=>p.claims.length)};
 const coinMarkers=useRef<ReturnType<typeof installCoinMarkers>|null>(null);
 const selectedRef=useRef(selected?.id);selectedRef.current=families.some(f=>f.id===selected?.id)?selected?.id:undefined;
 const previousSelection=useRef(selected?.id);
 const groups=useMemo(()=>coinPlaces(families,records,data.places,image=>sourceFilter==='all'||recordSourceProvider({url:image.sourceRecordUrl||'',label:'',relation:'same_specimen'})===sourceFilter),[families,records,data,sourceFilter]);
 const groupsRef=useRef(groups);groupsRef.current=groups;
 const [ready,setReady]=useState(false),[error,setError]=useState('');
 select.current=onSelect;
 const makeCoinFeatures=()=>coinFeatures(effectiveRef.current.coins?groupsRef.current:[]);
 useEffect(()=>{let disposed=false;let cleanup=()=>{};
  import('maplibre-gl').then(gl=>{
   if(disposed||!container.current)return;
   try{
    const m=new gl.Map({container:container.current,...initialMapCamera(initialView),minZoom:rangeInitialMinZoom(initialView?.zoom),maxZoom:13,maxBounds:initialView?undefined:[[43,24],[103,56]],attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false,touchPitch:false,renderWorldCopies:false,style:{version:8,sources:{physical:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:8,attribution:'Physical: Esri / US National Park Service'},terrain:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:13,attribution:'Shaded relief: © Esri'},topo:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Topography: Esri, HERE, Garmin, USGS, GEBCO, © OpenStreetMap contributors'}},layers:[{id:'terrain',type:'raster',source:'terrain'},{id:'physical',type:'raster',source:'physical',paint:{'raster-opacity':['interpolate',['linear'],['zoom'],7,1,9,0]}},{id:'topo',type:'raster',source:'topo',layout:{visibility:'none'}}]}});
    map.current=m;
    const restoreGestureZoom=installGestureZoomGain(m);
    searchQueue.current=searchNavigationQueue(request=>{
     if(request.serial<=lastSearch.current)return;lastSearch.current=request.serial;
     m.stop();if(request.intent==='restore')coinMarkers.current?.suppressMotion();setSearchNotice(false);if(request.intent==='cancel')return;if(request.camera){m.jumpTo({...request.camera,bearing:0,pitch:0});return}const target=searchBounds(request.target);if(!target)return;
     const rect=m.getContainer().getBoundingClientRect(),screen=m.getContainer().closest('.atlas-screen');
     const obstacles=Array.from(screen?.querySelectorAll<HTMLElement>('.atlas-search-panel,.family-drawer,.map-toolbar,.history-controls,.timeline-floating,.maplibregl-ctrl,.map-error')||[]).filter(el=>{const style=getComputedStyle(el),r=el.getBoundingClientRect();return style.visibility!=='hidden'&&style.display!=='none'&&r.width>0&&r.height>0}).map(el=>{const r=el.getBoundingClientRect();return{left:r.left-rect.left,right:r.right-rect.left,top:r.top-rect.top,bottom:r.bottom-rect.top}});
     const padding=searchMapPadding(rect.width,rect.height,obstacles);if(!padding){setSearchNotice(true);return}
     if(request.intent==='selection'){
      const camera=m.cameraForBounds(target,{padding,maxZoom:Math.min(9,m.getMaxZoom())});if(!camera)return;
      const points=request.target.coordinates.map(c=>m.project(c));
      if(collectionViewReady({points,width:rect.width,height:rect.height,padding,zoom:m.getZoom(),targetZoom:camera.zoom??9}))return;
      const far=points.some(p=>Math.hypot(p.x-rect.width/2,p.y-rect.height/2)>Math.max(rect.width,rect.height)*.65)||Math.abs((camera.zoom??9)-m.getZoom())>1;
      const options={...camera,duration:motionDuration(far?850:450),bearing:0,pitch:0};
      if(far)m.flyTo(options);else m.easeTo(options);
     }else m.fitBounds(target,{padding,maxZoom:Math.min(9,m.getMaxZoom()),duration:request.intent==='restore'?0:motionDuration(550),linear:true,bearing:0,pitch:0});
    });
    m.on('movestart',event=>{if(event.originalEvent)searchQueue.current?.cancel()});
    m.on('zoomend',()=>setSymbolZoom(m.getZoom()));
    m.on('moveend',()=>{const c=m.getCenter();cameraChange.current?.({center:[c.lng,c.lat],zoom:m.getZoom()})});
    m.touchZoomRotate.disableRotation();m.addControl(new gl.NavigationControl({showCompass:false}),'bottom-right');m.addControl(new gl.ScaleControl({unit:'metric'}),'bottom-left');
    m.on('style.load',()=>{
     if(disposed)return;
     history.current?.destroy();coinMarkers.current?.destroy();
     if(!m.getSource('coins'))m.addSource('coins',{type:'geojson',cluster:true,clusterRadius:coinDisplayRules.clusterRadius,clusterMaxZoom:coinDisplayRules.clusterMaxZoom,clusterProperties:{family_total:['+',['get','familyCount']],specimen_total:['+',['get','specimenCount']]},data:{type:'FeatureCollection',features:makeCoinFeatures()}});
     if(!m.getLayer('coin-source-layout'))m.addLayer({id:'coin-source-layout',type:'circle',source:'coins',paint:{'circle-radius':1,'circle-opacity':0}});
     coinMarkers.current=installCoinMarkers(gl,m,()=>effectiveRef.current.coins?groupsRef.current:[],()=>selectedRef.current,(id,context)=>select.current(id,context),groups=>{
      searchQueue.current?.cancel();m.stop();const target=collectionCityTarget(groups);if(!target)return;
      const rect=m.getContainer().getBoundingClientRect(),screen=m.getContainer().closest('.atlas-screen');
      const obstacles=Array.from(screen?.querySelectorAll<HTMLElement>('.atlas-search-panel,.family-drawer,.map-toolbar,.history-controls,.timeline-floating,.maplibregl-ctrl,.map-error')||[]).filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0}).map(el=>{const r=el.getBoundingClientRect();return{left:r.left-rect.left,right:r.right-rect.left,top:r.top-rect.top,bottom:r.bottom-rect.top}});
      const padding=searchMapPadding(rect.width,rect.height,obstacles);if(!padding)return;
      const camera=m.cameraForBounds(target.bounds,{padding,maxZoom:Math.min(9,m.getMaxZoom())});if(!camera)return;
      if(collectionViewReady({points:target.coordinates.map(c=>m.project(c)),width:rect.width,height:rect.height,padding,zoom:m.getZoom(),targetZoom:camera.zoom??coinDisplayRules.nearZoom}))return;
      m.fitBounds(target.bounds,{padding,maxZoom:Math.min(9,m.getMaxZoom()),duration:motionDuration(450),linear:true,bearing:0,pitch:0});
     });
     if(!m.getSource('selected-coin'))m.addSource('selected-coin',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
     if(!m.getLayer('selected-halo'))m.addLayer({id:'selected-halo',type:'circle',source:'selected-coin',paint:{'circle-radius':13,'circle-color':'#f4d692','circle-opacity':.16,'circle-stroke-color':'#f4d692','circle-stroke-width':2}});

     history.current=installHistoricalMap(gl,m,setLayerError,()=>effectiveRef.current.coins?groupsRef.current.map(g=>g.place.id):[]);history.current.update(frameRef.current);
     setReady(true);const c=m.getCenter();cameraChange.current?.({center:[c.lng,c.lat],zoom:m.getZoom()});
    });
    let failures=0;m.on('error',()=>{if(++failures>=4)setError('部分地图瓦片未能加载，可切换底图或稍后重试。')});
    const resize=new ResizeObserver(()=>{if(container.current?.clientWidth&&container.current?.clientHeight)m.resize()});resize.observe(container.current);cleanup=()=>{restoreGestureZoom();resize.disconnect();searchQueue.current?.dispose();searchQueue.current=null;history.current?.destroy();history.current=null;coinMarkers.current?.destroy();coinMarkers.current=null;m.remove()};
   }catch{setError('当前浏览器未能启动交互地图；Catalogue 仍可正常浏览。')}
  });return()=>{disposed=true;cleanup();map.current=null};
 },[data]);
 useEffect(()=>{if(!ready||!map.current)return;const m=map.current,historical=base==='historical';m.setMaxZoom(Math.max(base==='topo'?19:13,m.getZoom()));for(const id of ['physical','terrain']){m.setLayoutProperty(id,'visibility',base!=='topo'?'visible':'none');m.setPaintProperty(id,'raster-saturation',historical?-.35:0);m.setPaintProperty(id,'raster-contrast',historical?-.18:0);m.setPaintProperty(id,'raster-brightness-min',historical?.25:0);m.setPaintProperty(id,'raster-brightness-max',1);}m.setLayoutProperty('topo','visibility',base==='topo'?'visible':'none')},[base,ready]);
 useEffect(()=>{if(!ready||!map.current)return;coinMarkers.current?.refresh();const src=map.current.getSource('coins') as import('maplibre-gl').GeoJSONSource;src?.setData({type:'FeatureCollection',features:makeCoinFeatures()})},[groups,ready,data,layers.coins]);
 useEffect(()=>{if(!ready||!map.current)return;history.current?.update(frameRef.current);coinMarkers.current?.refresh();const p=effective.coins&&families.some(f=>f.id===selected?.id)&&selected?.anchor?data.places.find(x=>x.id===selected.anchor?.placeId):null;(map.current.getSource('selected-coin') as import('maplibre-gl').GeoJSONSource)?.setData({type:'FeatureCollection',features:p?[{type:'Feature',geometry:{type:'Point',coordinates:p.coordinates},properties:{}}]:[]})},[data,selected,families,year,dateMode,ready,layers,versions,backgrounds,backgroundObject,background,base]);
 useEffect(()=>{if(!ready)return;coinMarkers.current?.refresh();history.current?.update(frameRef.current,true);const root=map.current?.getContainer();for(const [selector,key]of [['.maplibregl-ctrl-zoom-in','Zoom in'],['.maplibregl-ctrl-zoom-out','Zoom out'],['.maplibregl-ctrl-attrib-button','Toggle attribution']] as const){const button=root?.querySelector(selector);button?.setAttribute('aria-label',tr(key));button?.setAttribute('title',tr(key))}},[locale,ready]);
 useEffect(()=>{const closed=previousSelection.current&&!selected?.id&&!returnCollection?previousSelection.current:undefined;previousSelection.current=selected?.id;coinMarkers.current?.selectionChanged(closed)},[selected?.id]);
 useEffect(()=>{coinMarkers.current?.setActive(active);if(active&&ready)map.current?.resize()},[active,ready]);
 useEffect(()=>{const queue=searchQueue.current;queue?.setReady(false);if(searchRequest?.intent==='cancel'){queue?.cancel();lastSearch.current=Math.max(lastSearch.current,searchRequest.serial);map.current?.stop();setSearchNotice(false);return}if(searchRequest)queue?.offer(searchRequest);const frame=requestAnimationFrame(()=>queue?.setReady(active&&ready));return()=>cancelAnimationFrame(frame)},[searchRequest?.serial,active,ready]);
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
 useEffect(()=>{if(!ready||!map.current||lastRangeFocus.current===rangeFocus)return;lastRangeFocus.current=rangeFocus;const bounds=rangeBounds(frameRef.current.ranges.filter(r=>r.objectId===chosenObject));setRangeNotice(bounds?'':'当前时期没有可显示的相关范围；请选定背景体系和范围时期。');if(bounds){searchQueue.current?.cancel();map.current.stop();const padding=measuredRangePadding();if(padding)fitHistoricalRange(map.current,bounds,padding,motionDuration(400))}},[rangeFocus,ready]);
 function measuredRangePadding(){const rect=container.current?.getBoundingClientRect();if(!rect)return null;const screen=container.current?.closest('.atlas-screen');const obstacles=Array.from(screen?.querySelectorAll<HTMLElement>('.atlas-search-panel,.family-drawer,.map-toolbar,.history-controls,.timeline-floating,.maplibregl-ctrl')||[]).filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width&&r.height&&s.display!=='none'&&s.visibility!=='hidden'}).map(el=>{const r=el.getBoundingClientRect();return{left:r.left-rect.left,right:r.right-rect.left,top:r.top-rect.top,bottom:r.bottom-rect.top}});return searchMapPadding(rect.width,rect.height,obstacles)}
 function measuredPadding(){const rect=container.current?.getBoundingClientRect()||{width:300,height:300,bottom:300},drawer=document.querySelector('.atlas-screen .family-drawer')?.getBoundingClientRect();return mapPadding(rect.width,rect.height,mobileViewport(window.innerWidth,window.innerHeight)&&drawer?Math.max(0,rect.bottom-drawer.top):0,mobileViewport(window.innerWidth,window.innerHeight))}
 return <div className="terrain-wrap"><div className="terrain-map" ref={container} aria-label={tr("Interactive terrain map of Central Asia; drag to pan, scroll or pinch to zoom")}/><div className="map-toolbar"><span className="basemap-icon"><ArtIcon name="range" size={21}/></span><select title={tr("底图")} aria-label={tr("Basemap")} value={base} onChange={e=>{setBase(e.target.value);setError('')}}><option value="historical">{tr("Historical · 历史地图")}</option><option value="terrain">{tr("Terrain · 地形")}</option><option value="topo">{tr("Topographic · 现代地形")}</option></select><button onClick={()=>map.current?.fitBounds([[59,34],[88,46]],{padding:measuredPadding(),duration:motionDuration(500)})} aria-label={tr("全域")}><ArtIcon name="fit" className="mobile-control-icon" size={21}/><span className="desktop-control-label">{tr("全域")}</span></button></div><MapLayerPanel zoom={symbolZoom} objectName={rangeObjectName} object={backgroundObject||''} onObject={onBackgroundObject} base={layers} effective={effective} setBase={setLayers} background={background} ranges={ranges} renderedRoles={Array.from(new Set(frameRef.current.places.flatMap(p=>p.claims.map(c=>c.role))))} time={time} control={rangeControl}/>{rangeNotice&&<div className="map-error" role="status">{copyKnown(rangeNotice)}<button onClick={()=>setRangeNotice('')}>{tr("关闭")}</button></div>}{searchNotice&&<div className="map-error" role="status">{tr("搜索地图空间不足")}</div>}{(error||layerError)&&<div className="map-error" role="status">{copyKnown(error||layerError)}{!retried&&<button onClick={()=>{setRetried(true);setLayerError('');history.current?.retry();map.current?.triggerRepaint()}}>{tr("重试图层一次")}</button>}</div>}</div>;
}
