import type * as GL from 'maplibre-gl';
import {canExpand,coverMember,intersects,uniqueMembers,type CoinPlace,type Box} from '@/lib/coin-map';

/** A small visible-marker projection of the existing MapLibre clustered source. */
export function installCoinMarkers(gl:typeof GL,map:GL.Map,getGroups:()=>CoinPlace[],getSelected:()=>string|undefined,onSelect:(id:string)=>void){
 let disposed=false,generation=0,revision=0,popup:GL.Popup|null=null,queued=false;
 const markers=new Map<string,{marker:GL.Marker;button:HTMLButtonElement;signature:string}>();
 const duration=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?0:450;
 const image=(src:string)=>{const img=document.createElement('img');img.src=src;img.alt='';img.draggable=false;img.onerror=()=>{img.hidden=true;img.closest('.coin-map-marker')?.classList.add('image-failed')};return img};
 function show(groups:CoinPlace[],coords:[number,number]){
  popup?.remove();const members=uniqueMembers(groups);if(members.length===1){onSelect(members[0].family.id);return}
  const node=document.createElement('div');node.className='coin-collection';
  const title=document.createElement('h3');title.textContent=groups.map(g=>g.place.name).join(' / ');node.appendChild(title);
  const hint=document.createElement('p');hint.textContent=`${members.length} 个匹配家族 · ${members.reduce((n,m)=>n+m.recordCount,0)} 条主库记录。集合封面不代表全部家族；位置角色见各家族。`;node.appendChild(hint);
  for(const member of members){
   const row=document.createElement('button');row.type='button';row.className='coin-popup-row';
   if(member.image)row.appendChild(image(member.image.path));
   const text=document.createElement('span'),name=document.createElement('strong'),count=document.createElement('small'),role=document.createElement('small'),source=document.createElement('small');
   name.textContent=member.family.title;count.textContent=`${member.recordCount} 条匹配记录`;
   role.textContent=`${member.family.anchor?.role||'位置角色未记录'} · ${member.family.anchor?.note||'位置说明未记录'}`;
   source.textContent=member.image?`封面：${member.image.sourceName||'来源待解析'} · ${member.image.sourceRecordId||'编号待解析'}；逐图来源见详情`:'无可用图片；仍可打开家族';
   for(const child of [name,count,role,source])text.appendChild(child);row.appendChild(text);row.onclick=()=>{popup?.remove();onSelect(member.family.id)};node.appendChild(row);
  }
  popup=new gl.Popup({closeButton:true,maxWidth:'340px',className:'coin-collection-popup',anchor:'center',focusAfterOpen:true}).setLngLat(coords).setDOMContent(node).addTo(map);
  const opened=popup;
  requestAnimationFrame(()=>{
   if(disposed||popup!==opened||!opened.isOpen())return;
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
  const live=new Set<string>();
  const ordered=entries.filter(e=>e!==null).sort((a,b)=>{const selected=getSelected();const ap=uniqueMembers(a.groups).some(m=>m.family.id===selected),bp=uniqueMembers(b.groups).some(m=>m.family.id===selected);return Number(bp)-Number(ap)||a.groups[0].place.id.localeCompare(b.groups[0].place.id)});
  for(const e of ordered){
   const members=uniqueMembers(e.groups),cover=coverMember(members,getSelected()),selected=members.some(m=>m.family.id===getSelected());
   const w=map.getContainer().clientWidth<600?58:72,h=48;
   // Put photographs above anchors, leaving the city label below the same point.
   const box={x:e.point.x,y:e.point.y-36,w,h};const large=!!cover?.image&&box.x-w/2>=8&&box.x+w/2<=map.getContainer().clientWidth-8&&box.y-h/2>=8&&box.y+h/2<=map.getContainer().clientHeight-8&&!occupied.some(b=>intersects(box,b));if(large)occupied.push(box);
   const signature=JSON.stringify([members.map(m=>[m.family.id,m.recordCount,m.image?.id]),cover?.image?.path,large,selected]);live.add(e.key);
   let entry=markers.get(e.key);
   if(entry?.signature!==signature){entry?.marker.remove();const button=document.createElement('button');button.type='button';button.className=`coin-map-marker ${large?'photo':'compact'}${selected?' selected':''}`;
    const label=`${e.cluster?'空间集合':e.groups.map(g=>g.place.name).join(' / ')} · ${members.length} 个匹配家族 · ${members.reduce((n,m)=>n+m.recordCount,0)} 条主库记录`;
    button.setAttribute('aria-label',label);button.title=label+(cover?`\n封面：${cover.family.title}；图片来源见家族详情`:'');
    if(large&&cover?.image)button.appendChild(image(cover.image.path));else{const star=document.createElement('span');star.textContent='✦';button.appendChild(star)}
    if(members.length>1){const badge=document.createElement('b');badge.textContent=String(members.length);button.appendChild(badge)}
    const fallback=document.createElement('span');fallback.className='coin-marker-fallback';fallback.textContent=large?(cover?.family.title||'图片未加载'):'';button.appendChild(fallback);
    entry={button,signature,marker:new gl.Marker({element:button,anchor:'center',offset:large?[0,-36]:[0,-12]}).setLngLat(e.coords).addTo(map)};markers.set(e.key,entry);
   }
   // Refresh handler on every projection; async work is invalidated on filter changes.
   entry.button.onclick=async ev=>{ev.stopPropagation();if(e.cluster){try{const zoom=await src.getClusterExpansionZoom(e.id);if(disposed||currentRevision!==revision)return;if(canExpand(e.groups,map.getZoom(),map.getMaxZoom(),zoom)){map.easeTo({center:e.coords,zoom,duration:duration()});return}}catch{}}if(!disposed&&currentRevision===revision)show(e.groups,e.coords)};
   entry.marker.setLngLat(e.coords);
  }
  for(const [key,entry]of markers)if(!live.has(key)){entry.marker.remove();markers.delete(key)}
 }
 function schedule(){if(!queued&&!disposed){queued=true;requestAnimationFrame(()=>{if(!disposed)void render()})}}
 map.on('moveend',schedule);map.on('idle',schedule);map.on('resize',schedule);
 return {refresh(){generation++;revision++;popup?.remove();for(const e of markers.values())e.marker.remove();markers.clear();schedule()},selectionChanged(){popup?.remove();schedule()},destroy(){disposed=true;generation++;popup?.remove();map.off('moveend',schedule);map.off('idle',schedule);map.off('resize',schedule);for(const e of markers.values())e.marker.remove();markers.clear()}};
}
