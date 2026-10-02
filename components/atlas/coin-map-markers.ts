import {tr,countLabel} from '@/lib/i18n';
import {focusReturn,stableFocusIndex} from '@/lib/keyboard';
import {motionDuration} from '@/lib/motion';
import {collectionReturn,collectionMembers,type CollectionContext} from '@/lib/map-selection';
import type * as GL from 'maplibre-gl';
import {canExpand,coverMember,layoutCoinEntries,markerGeometry,uniqueMembers,type CoinPlace,type Box} from '@/lib/coin-map';

/** A small visible-marker projection of the existing MapLibre clustered source. */
export function installCoinMarkers(gl:typeof GL,map:GL.Map,getGroups:()=>CoinPlace[],getSelected:()=>string|undefined,onSelect:(id:string,context?:CollectionContext)=>void){
 let disposed=false,generation=0,revision=0,popup:GL.Popup|null=null,queued=false;
 let preview:GL.Popup|null=null;
 let popupContext:CollectionContext|null=null;
 let lastMember:string|null=null,openerFamilies:string[]=[],restoreOnClose=true,pendingFocus:string[]|null=null;
 const rememberFocus=()=>{const active=document.activeElement;for(const entry of markers.values())if(entry.button===active)pendingFocus=JSON.parse(entry.button.dataset.familyIds||'[]')};
 const restoreMarker=()=>{const ids=pendingFocus||openerFamilies;const entries=[...markers.values()];const entry=entries[stableFocusIndex(ids,entries.map(e=>JSON.parse(e.button.dataset.familyIds||'[]')))];if(entry)entry.button.focus({preventScroll:true});else focusReturn(map.getCanvas());pendingFocus=null};
 function removePopup(){restoreOnClose=false;popup?.remove();restoreOnClose=true}
 const markers=new Map<string,{marker:GL.Marker;button:HTMLButtonElement;signature:string}>();
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
   role.textContent=`${member.family.anchor?.role||tr('位置角色未记录')} · ${member.family.anchor?.note||'位置说明未记录'}`;
   source.textContent=member.image?`${member.image.sourceName||tr('来源待解析')} · ${member.image.sourceRecordId||tr('编号待解析')}`:tr('无可用图片；仍可打开家族');
   for(const child of [name,count,role,source])text.appendChild(child);row.appendChild(text);row.onclick=()=>{const context={...popupContext!,scrollTop:node.scrollTop};lastMember=member.family.id;removePopup();onSelect(member.family.id,context)};node.appendChild(row);
  }
  popup=new gl.Popup({closeButton:true,maxWidth:'340px',className:'coin-collection-popup',anchor:'center',focusAfterOpen:!passive}).setLngLat(coords).setDOMContent(node).addTo(map);
  const opened=popup;opened.on('close',()=>{if(restoreOnClose&&!disposed)restoreMarker()});
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
  const occupied:Box[]=Array.from(map.getContainer().querySelectorAll<HTMLElement>('.historical-label')).filter(el=>el.style.visibility!=='hidden').map(el=>{const r=el.getBoundingClientRect(),c=map.getContainer().getBoundingClientRect();return{x:r.x-c.x+r.width/2,y:r.y-c.y+r.height/2,w:r.width,h:r.height}});
  rememberFocus();const live=new Set<string>();
  const layout=layoutCoinEntries(entries.filter(e=>e!==null),occupied,map.getContainer().clientWidth,map.getContainer().clientHeight,getSelected());
  for(const e of layout){
   const members=uniqueMembers(e.groups),cover=coverMember(members,getSelected()),selected=members.some(m=>m.family.id===getSelected());
   const large=e.large,geometry=markerGeometry(e.point,large,map.getContainer().clientWidth<600,members.length,e.offset);
   const signature=JSON.stringify([members.map(m=>[m.family.id,m.recordCount,m.image?.id]),cover?.image?.path,large,geometry.width,e.offset,e.displayCollection,selected,!!getSelected()]);live.add(e.key);
   let entry=markers.get(e.key);
   if(entry?.signature!==signature){entry?.marker.remove();const button=document.createElement('button');button.type='button';button.className=`coin-map-marker ${large?'photo':'compact'}${selected?' selected':getSelected()?' muted':''}`;
    button.style.width=`${geometry.width}px`;button.style.height=`${geometry.height}px`;
    const label=`${e.displayCollection?tr('显示集合'):e.cluster?tr('空间集合'):e.groups.map(g=>g.place.name).join(' / ')} · ${countLabel(members.length,'families')} · ${countLabel(members.reduce((n,m)=>n+m.recordCount,0),'records')}`;
    button.dataset.familyIds=JSON.stringify(members.map(m=>m.family.id));button.setAttribute('aria-label',label);button.title=label+(cover?`\n${cover.family.title}`:'');
    if(large&&cover?.image)button.appendChild(image(cover.image.path));else{const star=document.createElement('span');star.textContent='✦';button.appendChild(star)}
    if(members.length>1){const badge=document.createElement('b');badge.textContent=String(members.length);badge.style.width=`${geometry.badgeWidth}px`;button.appendChild(badge)}
    const fallback=document.createElement('span');fallback.className='coin-marker-fallback';fallback.textContent=large?(cover?.family.title||'图片未加载'):'';button.appendChild(fallback);
    entry={button,signature,marker:new gl.Marker({element:button,anchor:'center',offset:[0,e.offset]}).setLngLat(e.coords).addTo(map)};markers.set(e.key,entry);
   }
   // Refresh handler on every projection; async work is invalidated on filter changes.
   entry.button.onmouseenter=entry.button.onfocus=()=>{preview?.remove();if(members.length!==1)return;const member=members[0],node=document.createElement('div');node.className='coin-preview';node.textContent=`${member.family.title} · ${member.family.dateLabel||tr('年代未记录')} · ${countLabel(member.recordCount,'records')}`;preview=new gl.Popup({closeButton:false,closeOnClick:false,focusAfterOpen:false,anchor:'bottom',offset:60,className:'coin-preview-popup'}).setLngLat(e.coords).setDOMContent(node).addTo(map)};
   entry.button.onmouseleave=entry.button.onblur=()=>preview?.remove();
   entry.button.onclick=async ev=>{preview?.remove();openerFamilies=members.map(m=>m.family.id);ev.stopPropagation();if(e.cluster&&!e.displayCollection){try{const zoom=await src.getClusterExpansionZoom(e.id);if(disposed||currentRevision!==revision)return;if(canExpand(e.groups,map.getZoom(),map.getMaxZoom(),zoom)){map.easeTo({center:e.coords,zoom,duration:duration()});return}}catch{}}if(!disposed&&currentRevision===revision)show(e.groups,e.coords)};
   entry.marker.setLngLat(e.coords).setOffset([0,e.offset]);
  }
  for(const [key,entry]of markers)if(!live.has(key)){entry.marker.remove();markers.delete(key)}
  if(pendingFocus)restoreMarker();
 }
 function schedule(){if(!queued&&!disposed){queued=true;requestAnimationFrame(()=>{if(!disposed)void render()})}}
 function escape(ev:KeyboardEvent){if(ev.defaultPrevented||ev.key!=='Escape'||document.querySelector('dialog[open]')||(ev.target instanceof Element&&ev.target.closest('input,textarea,select,[contenteditable]')))return;if(popup?.isOpen()){ev.preventDefault();ev.stopImmediatePropagation();popup.remove()}else preview?.remove()}
 document.addEventListener('keydown',escape);
 map.on('moveend',schedule);map.on('idle',schedule);map.on('resize',schedule);
 return {returnToCollection(context:CollectionContext){const {groups}=collectionReturn(getGroups(),context);const center=map.unproject([map.getContainer().clientWidth/2,map.getContainer().clientHeight/2]);show(groups,[center.lng,center.lat],context);return true},refresh(){rememberFocus();generation++;revision++;preview?.remove();const context=popup?.isOpen()&&popupContext?{...popupContext,scrollTop:popup.getElement().querySelector('.coin-collection')?.scrollTop||0}:null;const popupAt=popup?.isOpen()?popup.getLngLat():null;const activeMember=popup?.getElement()?.querySelector<HTMLButtonElement>('.coin-popup-row:focus')?.dataset.familyId;if(activeMember)lastMember=activeMember;const hadPopupFocus=!!popup?.getElement()?.contains(document.activeElement);removePopup();if(context){const center=popupAt||map.getCenter();show(collectionMembers(getGroups(),context),[center.lng,center.lat],context,!hadPopupFocus)}for(const e of markers.values())e.marker.remove();markers.clear();schedule()},selectionChanged(){preview?.remove();removePopup();schedule()},destroy(){document.removeEventListener('keydown',escape);preview?.remove();disposed=true;generation++;popup?.remove();map.off('moveend',schedule);map.off('idle',schedule);map.off('resize',schedule);for(const e of markers.values())e.marker.remove();markers.clear()}};
}
