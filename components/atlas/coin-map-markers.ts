import {coinCityLinks} from '@/lib/coin-city-links';
import {tr,countLabel,copyKnown} from '@/lib/i18n';
import {focusReturn,stableFocusIndex} from '@/lib/keyboard';
import {motionDuration} from '@/lib/motion';
import {collectionReturn,collectionMembers,type CollectionContext} from '@/lib/map-selection';
import type * as GL from 'maplibre-gl';
import {coinEntryAction,collectionCityTarget,displayCoins,displayCollectionContext,coinMarkerVisual,mapCoinImage,markerGeometry,uniqueMembers,type CoinPlace,type CoinScatterPosition,type Box} from '@/lib/coin-map';

let connectionSequence=0;
/** A small visible-marker projection of the existing MapLibre clustered source. */
export function installCoinMarkers(gl:typeof GL,map:GL.Map,getGroups:()=>CoinPlace[],getSelected:()=>string|undefined,onSelect:(id:string,context?:CollectionContext)=>void,onNavigate:(groups:CoinPlace[])=>void){
 let disposed=false,generation=0,revision=0,popup:GL.Popup|null=null,queued=false;
 let preview:GL.Popup|null=null;
 let popupContext:CollectionContext|null=null;
 let lastMember:string|null=null,openerFamilies:string[]=[],restoreOnClose=true,pendingFocus:string[]|null=null;
 let closingFamily:string|undefined;
 let scatterPositions=new Map<string,CoinScatterPosition>();
 const scatterFrames=new Map<string,Map<string,CoinScatterPosition>>();
 const observed=new Set<Element>();const obstaclesObserver=new ResizeObserver(()=>schedule());
 const rememberFocus=()=>{const active=document.activeElement;for(const entry of markers.values())if(entry.button===active)pendingFocus=JSON.parse(entry.button.dataset.familyIds||'[]')};
 const restoreMarker=()=>{const ids=closingFamily?[closingFamily]:pendingFocus||openerFamilies;const entries=[...markers.values()].filter(e=>e.button.dataset.occluded!=='true');const entry=entries[stableFocusIndex(ids,entries.map(e=>JSON.parse(e.button.dataset.familyIds||'[]')))];if(entry)entry.button.focus({preventScroll:true});else focusReturn(map.getCanvas());pendingFocus=null;closingFamily=undefined};
 function removePopup(){restoreOnClose=false;popup?.remove();restoreOnClose=true}
 const markers=new Map<string,{marker:GL.Marker;button:HTMLButtonElement;signature:string}>();
 const connections=document.createElementNS('http://www.w3.org/2000/svg','svg');connections.classList.add('coin-city-connections');connections.setAttribute('aria-hidden','true');const maskId=`coin-link-mask-${++connectionSequence}`;map.getContainer().appendChild(connections);
 let currentLayout:ReturnType<typeof displayCoins>=[];let previewKey:string|undefined;
 function drawConnections(){
  connections.replaceChildren();const container=map.getContainer(),frame=container.getBoundingClientRect();connections.setAttribute('width',String(container.clientWidth));connections.setAttribute('height',String(container.clientHeight));
  const defs=document.createElementNS(connections.namespaceURI,'defs'),mask=document.createElementNS(connections.namespaceURI,'mask');mask.id=maskId;mask.setAttribute('maskUnits','userSpaceOnUse');const wash=document.createElementNS(connections.namespaceURI,'rect');wash.setAttribute('width',String(container.clientWidth));wash.setAttribute('height',String(container.clientHeight));wash.setAttribute('fill','white');mask.appendChild(wash);
  container.querySelectorAll<HTMLElement>('.coin-map-marker,.history-place img,.history-place span').forEach(el=>{if(getComputedStyle(el).visibility==='hidden')return;const r=el.getBoundingClientRect(),cut=document.createElementNS(connections.namespaceURI,'rect');for(const [k,v]of Object.entries({x:r.x-frame.x-3,y:r.y-frame.y-3,width:r.width+6,height:r.height+6}))cut.setAttribute(k,String(v));cut.setAttribute('fill','black');mask.appendChild(cut)});defs.appendChild(mask);connections.appendChild(defs);
  const selectedPlaces=new Set(getGroups().filter(g=>g.members.some(m=>m.family.id===getSelected())).map(g=>g.place.id));
  container.querySelectorAll<HTMLElement>('.history-place').forEach(el=>el.classList.toggle('coin-city-selected',selectedPlaces.has((el.dataset.historyKey||'').slice(6))));
  for(const e of currentLayout){const button=markers.get(e.key)?.button;if(!button||e.occluded||getComputedStyle(button).visibility==='hidden')continue;const r=button.getBoundingClientRect();
   const coin={x:r.x-frame.x+r.width/2,y:r.y-frame.y+r.height/2,w:r.width+4,h:r.height+4};
   for(const link of coinCityLinks(e,coin,coords=>map.project(coords),getSelected())){const line=document.createElementNS(connections.namespaceURI,'line');line.setAttribute('mask',`url(#${maskId})`);line.dataset.placeId=link.placeId;line.dataset.coinKey=e.key;line.classList.toggle('selected',link.selected);line.classList.toggle('preview',!link.selected&&previewKey===e.key);for(const [k,v]of Object.entries({x1:link.from.x,y1:link.from.y,x2:link.to.x,y2:link.to.y}))line.setAttribute(k,String(v));connections.appendChild(line)}
  }
 }
 const duration=()=>motionDuration(450);
 const image=(src:string)=>{const img=document.createElement('img');img.src=src;img.alt='';img.draggable=false;img.onerror=()=>{img.hidden=true;img.closest('.coin-map-marker')?.classList.add('image-failed')};return img};
 function show(groups:CoinPlace[],coords:[number,number],restore?:CollectionContext,passive=false){
  preview?.remove();removePopup();const members=uniqueMembers(groups);if(members.length===1&&!restore){onSelect(members[0].family.id);return}
  popupContext=restore||{placeIds:groups.map(g=>g.place.id),familyIds:members.map(m=>m.family.id),scrollTop:0};
  const node=document.createElement('div');node.className='coin-collection';
  const title=document.createElement('h3');title.textContent=groups.length?groups.map(g=>g.place.name).join(' / '):tr('原集合当前无匹配结果');node.appendChild(title);
  const hint=document.createElement('p');hint.textContent=`${countLabel(members.length,'families')} · ${countLabel(members.reduce((n,m)=>n+m.recordCount,0),'records')}`;node.appendChild(hint);if(!members.length){hint.textContent=tr('原集合当前无匹配结果；恢复筛选后可继续浏览。')}
  for(const member of members){
   const row=document.createElement('button');row.type='button';row.className='coin-popup-row';row.dataset.familyId=member.family.id;
   if(member.image)row.appendChild(image(member.image.path));
   const text=document.createElement('span'),name=document.createElement('strong'),count=document.createElement('small'),role=document.createElement('small'),source=document.createElement('small');
   name.textContent=member.family.title;count.textContent=countLabel(member.recordCount,'records');
   role.textContent=member.family.anchor?.role?copyKnown(member.family.anchor.role):tr('位置角色未记录');
   source.textContent=member.image?`${member.image.sourceName||tr('来源待解析')} · ${member.image.sourceRecordId||tr('编号待解析')}`:tr('无可用图片；仍可打开家族');
   for(const child of [name,count,role,source])text.appendChild(child);row.appendChild(text);row.onclick=()=>{const context={...popupContext!,scrollTop:node.scrollTop};lastMember=member.family.id;removePopup();onSelect(member.family.id,context)};node.appendChild(row);
  }
  popup=new gl.Popup({closeButton:true,maxWidth:'340px',className:'coin-collection-popup',anchor:'center',focusAfterOpen:!passive}).setLngLat(coords).setDOMContent(node).addTo(map);
  popup.getElement().querySelector('.maplibregl-popup-close-button')?.setAttribute('aria-label',tr('Close popup'));const opened=popup;opened.on('close',()=>{if(restoreOnClose&&!disposed)restoreMarker()});
  node.scrollTop=restore?.scrollTop||0;
  requestAnimationFrame(()=>{
   if(disposed||popup!==opened||!opened.isOpen())return;
   if(restore){node.scrollTop=restore.scrollTop;if(!passive)([...node.querySelectorAll<HTMLButtonElement>('.coin-popup-row')].find(b=>b.dataset.familyId===lastMember)||node.querySelector<HTMLButtonElement>('button')||opened.getElement().querySelector<HTMLButtonElement>('button'))?.focus({preventScroll:true});return}
   const box=opened.getElement().getBoundingClientRect(),bounds=map.getContainer().getBoundingClientRect();
   const dx=box.left<bounds.left+12?box.left-bounds.left-12:box.right>bounds.right-12?box.right-bounds.right+12:0;
   const dy=box.top<bounds.top+12?box.top-bounds.top-12:box.bottom>bounds.bottom-12?box.bottom-bounds.bottom+12:0;
   if(dx||dy)map.panBy([dx,dy],{duration:duration()});
  });
 }
 async function render(){
  queued=false;if(disposed||!map.isSourceLoaded('coins'))return;const token=++generation,currentRevision=revision;
  const src=map.getSource('coins') as GL.GeoJSONSource,groups=getGroups();
  const seen=new Set<string>();
  const features=map.querySourceFeatures('coins').filter(f=>{const key=f.properties?.cluster?`c${f.properties.cluster_id}`:`p${f.properties?.placeId}`;if(seen.has(key))return false;seen.add(key);return true});
  const entries=await Promise.all(features.map(async f=>{
   if(f.geometry.type!=='Point')return null;const coords=f.geometry.coordinates as [number,number];const point=map.project(coords),rect=map.getContainer();if(point.x<0||point.y<0||point.x>rect.clientWidth||point.y>rect.clientHeight)return null;
   const cluster=!!f.properties?.cluster,id=Number(f.properties?.cluster_id);
   try{const leaves=cluster?await src.getClusterLeaves(id,Infinity,0):[f];const ids=new Set<string>(leaves.flatMap(l=>JSON.parse(String(l.properties?.placeIds||'[]')) as string[]));const members=groups.filter(g=>ids.has(g.place.id));if(!members.length)return null;
    return {key:cluster?`c${id}`:`p${f.properties?.placeId}`,coords,point,groups:members,cluster,id};
   }catch{return null}
  }));
  if(disposed||token!==generation)return;
  const occupied:Box[]=Array.from(map.getContainer().querySelectorAll<HTMLElement>('.historical-label,.history-place span')).filter(el=>el.classList.contains('history-place')||getComputedStyle(el).visibility!=='hidden').map(el=>{const r=el.getBoundingClientRect(),c=map.getContainer().getBoundingClientRect();return{x:r.x-c.x+r.width/2,y:r.y-c.y+r.height/2,w:r.width,h:r.height}});
  const bounds=map.getContainer().getBoundingClientRect(),screen=map.getContainer().closest('.atlas-screen');
  const expansionObstacles:Box[]=Array.from(screen?.querySelectorAll<HTMLElement>('.atlas-search-panel,.map-toolbar,.timeline-floating,.history-controls,.maplibregl-ctrl,.background-notice,.map-error,.historical-map-popup')||[]).filter(el=>getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().width>0).map(el=>{const r=el.getBoundingClientRect();return{x:r.x-bounds.x+r.width/2,y:r.y-bounds.y+r.height/2,w:r.width,h:r.height}});
  for(const el of screen?.querySelectorAll('.family-drawer,.atlas-search-panel,.history-controls,.timeline-floating,.map-toolbar,.maplibregl-ctrl-attrib')||[]){if(!observed.has(el)){observed.add(el);obstaclesObserver.observe(el)}}
  const drawerElement=screen?.querySelector('.family-drawer');const drawer=drawerElement&&getComputedStyle(drawerElement).visibility!=='hidden'?drawerElement.getBoundingClientRect():undefined;
  if(drawer&&drawer.left<bounds.right&&drawer.right>bounds.left)expansionObstacles.push({x:drawer.x-bounds.x+drawer.width/2,y:drawer.y-bounds.y+drawer.height/2,w:drawer.width,h:drawer.height});
  // A bottom sheet reduces height; a desktop side drawer excludes its real rectangle.
  const expansionHeight=drawer&&drawer.width>bounds.width*.6?Math.max(100,Math.min(bounds.height,drawer.top-bounds.top-12)):bounds.height;
  const search=screen?.querySelector('.atlas-search-panel')?.getBoundingClientRect();
  const expansionTop=bounds.width<600&&search&&search.width>bounds.width*.6?Math.max(0,Math.min(expansionHeight-100,search.bottom-bounds.top+12)):0;
  const attribution=screen?.querySelector('.maplibregl-ctrl-attrib')?.getBoundingClientRect();
  const frameKey=JSON.stringify([Math.round(bounds.width),Math.round(bounds.height),Math.round(drawer?.height||0),Math.round(search?.height||0),...['.history-controls','.timeline-floating'].map(selector=>Math.round(screen?.querySelector(selector)?.getBoundingClientRect().height||0)),Math.round(attribution?.width||0),Math.round(attribution?.height||0)]);
  if(!scatterFrames.has(frameKey))scatterFrames.set(frameKey,new Map(scatterPositions));
  scatterPositions=scatterFrames.get(frameKey)!;
  // Retain a handful of actual panel/viewport configurations, not an unbounded pan history.
  if(scatterFrames.size>12){const oldest=scatterFrames.keys().next().value;if(oldest!==undefined&&oldest!==frameKey)scatterFrames.delete(oldest)}
  rememberFocus();const live=new Set<string>();
  const layout=displayCoins({entries:entries.filter(e=>e!==null),labels:occupied,width:map.getContainer().clientWidth,height:map.getContainer().clientHeight,zoom:map.getZoom(),selectedId:getSelected(),project:coords=>map.project(coords),expansionObstacles,expansionHeight,expansionTop,previous:scatterPositions});
  if(map.getZoom()>=8.5)for(const e of layout)if(!e.overflow)scatterPositions.set(e.key,{offsetX:e.offsetX,offset:e.offset});
  for(const e of layout){
   const members=e.members,cover=e.representative,selected=members.some(m=>m.family.id===getSelected());
   const large=e.large,geometry=markerGeometry(e.point,large,map.getContainer().clientWidth<600,members.length,e.offset,cover?.image);
   const signature=JSON.stringify([members.map(m=>[m.family.id,m.recordCount,m.image?.id]),cover?.image?.path,large,geometry.width,e.offsetX,e.offset,e.displayCollection,selected,!!getSelected(),e.stage,e.sameCityExpansion,e.occluded]);live.add(e.key);
   let entry=markers.get(e.key);
   if(entry?.signature!==signature){entry?.marker.remove();const button=document.createElement('button');button.type='button';button.className=`coin-map-marker ${large?'photo':'compact'}${selected?' selected':getSelected()?' muted':''}`;
    button.style.width=`${geometry.width}px`;button.style.height=`${geometry.height}px`;button.style.minWidth="44px";button.style.minHeight="32px";
    const location=(e.kind==='family'?e.groups.filter(g=>g.place.id===members[0].family.anchor?.placeId):e.groups).map(g=>g.place.name).join(' / ');
    const cityKind=collectionCityTarget(e.collectionGroups)?.kind;
    button.dataset.collectionKind=cityKind||'';
    const label=e.kind==='family'?`${members[0].family.title} · ${location} · ${countLabel(members[0].recordCount,'records')}`:`${e.overflow?tr('更多家族'):cityKind==='multiple'?tr('多个城市'):location} · ${countLabel(members.length,'families')} · ${countLabel(members.reduce((n,m)=>n+m.recordCount,0),'records')}`;
    button.dataset.familyIds=JSON.stringify(members.map(m=>m.family.id));button.setAttribute('aria-label',label);button.title=label+(cover?`\n${cover.family.title}`:'');
    button.dataset.occluded=String(!!e.occluded);if(e.occluded){button.style.visibility='hidden';button.tabIndex=-1}button.dataset.stage=e.stage;button.dataset.sameCityExpansion=String(e.sameCityExpansion);
    button.dataset.placeIds=JSON.stringify(e.anchors.map(a=>a.placeId));button.dataset.offsetX=String(e.offsetX);button.dataset.offsetY=String(e.offset);button.dataset.overflow=String(e.overflow);
    const cutout=mapCoinImage(cover?.image);if(coinMarkerVisual(cover?.image)==='image'&&cutout){button.classList.add('cutout');button.appendChild(image(cutout.path))}else button.classList.add('image-failed');
    if(members.length>1&&!e.overflow){const badge=document.createElement('b');badge.textContent=String(members.length);badge.style.width=`${geometry.badgeWidth}px`;button.appendChild(badge)}
    const fallback=document.createElement('span');fallback.className='coin-marker-fallback';fallback.textContent='—';fallback.setAttribute('aria-hidden','true');button.appendChild(fallback);
    if(e.overflow){button.classList.add('coin-city-remaining');fallback.textContent=`+${members.length}`}
    entry={button,signature,marker:new gl.Marker({element:button,anchor:'center',offset:[e.offsetX,e.offset]}).setLngLat(e.coords).addTo(map)};markers.set(e.key,entry);
   }
   // Refresh handler on every projection; async work is invalidated on filter changes.
   entry.button.onmouseenter=entry.button.onfocus=()=>{preview?.remove();if(members.length!==1)return;const member=members[0],node=document.createElement('div');node.className='coin-preview';node.textContent=`${member.family.title} · ${member.family.dateLabel||tr('年代未记录')} · ${countLabel(member.recordCount,'records')}`;preview=new gl.Popup({closeButton:false,closeOnClick:false,focusAfterOpen:false,anchor:'bottom',offset:[e.offsetX,e.offset-geometry.height/2-12],className:'coin-preview-popup'}).setLngLat(e.coords).setDOMContent(node).addTo(map)};
   entry.button.onmouseleave=entry.button.onblur=()=>preview?.remove();
   entry.button.onclick=ev=>{preview?.remove();openerFamilies=members.map(m=>m.family.id);ev.stopPropagation();
    const action=coinEntryAction(e);
    if(action.kind==='family'){lastMember=action.familyId;removePopup();onSelect(lastMember,displayCollectionContext(e));return}
    if(action.kind==='remaining'){show(e.collectionGroups,e.coords,displayCollectionContext(e));return}
    removePopup();onNavigate(e.collectionGroups);
   };
   entry.marker.setLngLat(e.coords).setOffset([e.offsetX,e.offset]);
  }
  currentLayout=layout;
  for(const e of layout){const button=markers.get(e.key)!.button,enter=button.onfocus,leave=button.onblur;button.onfocus=button.onmouseenter=(event:Event)=>{enter?.call(button,event as FocusEvent);previewKey=e.key;drawConnections()};button.onblur=button.onmouseleave=(event:Event)=>{leave?.call(button,event as FocusEvent);previewKey=undefined;drawConnections()}}
  for(const [key,entry]of markers)if(!live.has(key)){entry.marker.remove();markers.delete(key)}
  drawConnections();if(pendingFocus||closingFamily)restoreMarker();
 }
 function schedule(){if(!queued&&!disposed){queued=true;requestAnimationFrame(()=>{if(!disposed)void render()})}}
 function escape(ev:KeyboardEvent){if(ev.defaultPrevented||ev.key!=='Escape'||document.querySelector('dialog[open]')||(ev.target instanceof Element&&ev.target.closest('input,textarea,select,[contenteditable]')))return;if(popup?.isOpen()){ev.preventDefault();ev.stopImmediatePropagation();popup.remove()}else preview?.remove()}
 document.addEventListener('keydown',escape);
 const moving=()=>{drawConnections()};map.on('move',moving);map.on('moveend',schedule);map.on('idle',schedule);map.on('resize',schedule);
 return {returnToCollection(context:CollectionContext){const {groups}=collectionReturn(getGroups(),context);const center=map.unproject([map.getContainer().clientWidth/2,map.getContainer().clientHeight/2]);show(groups,[center.lng,center.lat],context);return true},refresh(){currentLayout=[];connections.replaceChildren();rememberFocus();generation++;revision++;preview?.remove();const context=popup?.isOpen()&&popupContext?{...popupContext,scrollTop:popup.getElement().querySelector('.coin-collection')?.scrollTop||0}:null;const popupAt=popup?.isOpen()?popup.getLngLat():null;const activeMember=popup?.getElement()?.querySelector<HTMLButtonElement>('.coin-popup-row:focus')?.dataset.familyId;if(activeMember)lastMember=activeMember;const hadPopupFocus=!!popup?.getElement()?.contains(document.activeElement);removePopup();if(context){const center=popupAt||map.getCenter();show(collectionMembers(getGroups(),context),[center.lng,center.lat],context,!hadPopupFocus)}for(const e of markers.values())e.marker.remove();markers.clear();schedule()},selectionChanged(closed?:string){closingFamily=closed;preview?.remove();removePopup();schedule()},destroy(){obstaclesObserver.disconnect();document.removeEventListener('keydown',escape);preview?.remove();disposed=true;generation++;popup?.remove();connections.remove();map.off('move',moving);map.off('moveend',schedule);map.off('idle',schedule);map.off('resize',schedule);for(const e of markers.values())e.marker.remove();markers.clear()}};
}
