import cutoutIndex from '../public/data/map-coin-cutouts.json' with {type:'json'};
import type {Family, Place, Specimen, ImageRecord} from './atlas';
type MapCoinCutout={originalId:string;originalPath:string;path:string;width:number;height:number};
const cutouts:Readonly<Record<string,MapCoinCutout>>=cutoutIndex;
/** Map-only resource lookup; the selected original image and its provenance stay intact. */
export function mapCoinImage(image:Pick<ImageRecord,'path'>|null|undefined):MapCoinCutout|null{return image?cutouts[image.path]||null:null}
export type CoinMember={family:Family;recordCount:number;record:Specimen|null;image:ImageRecord|null};
export type CoinPlace={place:Place;members:CoinMember[]};
// Presentation preference only: inspected existing double-face photo, without title block.
export const coinCoverPreferences:Readonly<Record<string,readonly string[]>>={'bukhara-kaiyuan-tamgha':['z1062']};
const stable=(a:{id:string},b:{id:string})=>a.id<b.id?-1:a.id>b.id?1:0;
/** Only matched records supply covers. Family artwork is never substituted. */
export function coinPlaces(families:Family[],records:Specimen[],places:Place[],imageMatches:(image:ImageRecord)=>boolean=()=>true):CoinPlace[]{
 const byFamily=new Map<string,Specimen[]>();
 for(const r of records){const rs=byFamily.get(r.familyId)||[];if(!rs.some(x=>x.id===r.id))rs.push(r);byFamily.set(r.familyId,rs)}
 const groups=new Map<string,CoinMember[]>();
 for(const f of [...new Map(families.map(f=>[f.id,f])).values()].sort(stable)){
  const rs=[...(byFamily.get(f.id)||[])].sort(stable);if(!f.anchor||!rs.length)continue;
  const preferred=coinCoverPreferences[f.id]||[];
  const record=rs.find(r=>r.images.some(i=>preferred.includes(i.id)&&i.path&&imageMatches(i)))||rs.find(r=>r.images.some(i=>i.path&&imageMatches(i)))||rs[0];
  const image=[...record.images].filter(i=>i.path&&imageMatches(i)).sort((a,b)=>Number(preferred.includes(b.id))-Number(preferred.includes(a.id))||stable(a,b))[0]||null;
  const members=groups.get(f.anchor.placeId)||[];members.push({family:f,recordCount:rs.length,record,image});groups.set(f.anchor.placeId,members);
 }
 return [...places].sort(stable).flatMap(place=>groups.has(place.id)?[{place,members:groups.get(place.id)!}]:[]);
}
export function uniqueMembers(groups:CoinPlace[]):CoinMember[]{return [...new Map(groups.flatMap(g=>g.members).map(m=>[m.family.id,m])).values()].sort((a,b)=>stable(a.family,b.family))}
export function coverMember(members:CoinMember[],selectedId?:string):CoinMember|undefined{return members.find(m=>m.family.id===selectedId)||members.find(m=>m.image)||members[0]}
/** Identical locations never become separable by zooming; capped clusters must remain browsable. */
export function canExpand(groups:CoinPlace[],zoom:number,maxZoom:number,expansionZoom:number){return new Set(groups.map(g=>g.place.coordinates.join(','))).size>1&&zoom<maxZoom-.1&&expansionZoom>zoom+.1&&expansionZoom<=maxZoom}
export type Box={x:number;y:number;w:number;h:number};
export function intersects(a:Box,b:Box){return Math.abs(a.x-b.x)<(a.w+b.w)/2+5&&Math.abs(a.y-b.y)<(a.h+b.h)/2+5}

/** Exact coincident anchors share a browse entry, even if their place IDs differ. */
export function coinFeatures(groups:CoinPlace[]){
 const positions=new Map<string,CoinPlace[]>();
 for(const group of groups){const key=group.place.coordinates.join(',');const at=positions.get(key)||[];at.push(group);positions.set(key,at)}
 return [...positions.values()].map(at=>{const members=uniqueMembers(at);return {type:'Feature' as const,geometry:{type:'Point' as const,coordinates:at[0].place.coordinates},properties:{placeId:at[0].place.id,placeIds:JSON.stringify(at.map(g=>g.place.id).sort()),familyCount:members.length,specimenCount:members.reduce((n,m)=>n+m.recordCount,0)}}});
}

export type MapCoinEntry={key:string;coords:[number,number];point:{x:number;y:number};groups:CoinPlace[];cluster:boolean;id:number};
export type DisplayCoinEntry=MapCoinEntry&{large:boolean;offset:number;bounds:Box;displayCollection:boolean;entryKeys:string[]};
/** Shared with the DOM renderer: border-box dimensions, including the protruding badge. */
export const coinMarkerSizes={desktop:{normal:72,compact:60,maxHeight:60},mobile:{normal:64,compact:56,maxHeight:56},placeholder:48} as const;
export function markerGeometry(point:{x:number;y:number},large:boolean,small:boolean,count:number,offset=large?-36:-12,image?:ImageRecord|null){
 const size=small?coinMarkerSizes.mobile:coinMarkerSizes.desktop;
 const displayImage=image?.path?mapCoinImage(image):image;
 const ratio=displayImage?.width&&displayImage?.height&&displayImage.width>0&&displayImage.height>0?displayImage.width/displayImage.height:1.5;
 const base=displayImage?(large?size.normal:size.compact):coinMarkerSizes.placeholder;
 const height=Math.min(base/ratio,size.maxHeight),width=Math.min(base,height*ratio);
 const badgeWidth=count>1?Math.max(20,String(count).length*7+10):0;
 const left=Math.min(-width/2,badgeWidth?width/2+6-badgeWidth:-width/2);
 const right=width/2+(badgeWidth?6:0),top=offset-height/2-(badgeWidth?8:0),bottom=offset+height/2;
 return {width,height,badgeWidth,offset,box:{x:point.x+(left+right)/2,y:point.y+(top+bottom)/2,w:right-left,h:bottom-top}};
}
function representativeMember(members:CoinMember[],selectedId?:string){const preferred=coverMember(members,selectedId);return preferred?.image?preferred:members.find(m=>m.image)||preferred}
/** Screen-only collision groups. Every input entry survives in exactly one output entry. */
export function layoutCoinEntries(entries:MapCoinEntry[],labels:Box[],width:number,height:number,selectedId?:string):DisplayCoinEntry[]{
 const selected=(e:MapCoinEntry)=>uniqueMembers(e.groups).some(m=>m.family.id===selectedId);
 const rank=(a:MapCoinEntry,b:MapCoinEntry)=>Number(selected(b))-Number(selected(a))||(a.key<b.key?-1:a.key>b.key?1:0);
 const inside=(b:Box)=>b.x-b.w/2>=4&&b.x+b.w/2<=width-4&&b.y-b.h/2>=4&&b.y+b.h/2<=height-4;
 function shape(e:MapCoinEntry){
  const members=uniqueMembers(e.groups),cover=representativeMember(members,selectedId),hasImage=!!cover?.image;
  const photo=markerGeometry(e.point,true,width<600,members.length,coinDisplayRules.photoOffset,cover?.image);
  if(hasImage&&inside(photo.box)&&!labels.some(b=>intersects(photo.box,b)))return {large:true,offset:photo.offset,bounds:photo.box};
  // Vertical screen offsets preserve the geographic anchor while avoiding label rectangles.
  const candidates=[-12,-40,-64,24,48].map(offset=>markerGeometry(e.point,false,width<600,members.length,offset,cover?.image));
  const compact=candidates.find(g=>inside(g.box)&&!labels.some(b=>intersects(g.box,b)))||candidates.find(g=>inside(g.box))||candidates[0];
  return {large:false,offset:compact.offset,bounds:compact.box};
 }
 const placed:DisplayCoinEntry[]=[];
 for(const input of [...entries].sort(rank)){
  let entry:DisplayCoinEntry={...input,...shape(input),displayCollection:false,entryKeys:[input.key]};
  // A merged badge may grow into a third marker: repeat until its full footprint is free.
  for(;;){
   const collisions=placed.filter(p=>intersects(entry.bounds,p.bounds));if(!collisions.length)break;
   const joined=[entry,...collisions].sort(rank),anchor=joined[0];
   const groups=[...new Map(joined.flatMap(e=>e.groups).map(g=>[g.place.id,g])).values()];
   const entryKeys=joined.flatMap(e=>e.entryKeys).sort();
   for(const collision of collisions)placed.splice(placed.indexOf(collision),1);
   const combined={...anchor,groups};
   entry={...combined,...shape(combined),key:JSON.stringify(entryKeys),entryKeys,displayCollection:true};
  }
  placed.push(entry);
 }
 return placed.sort(rank);
}

/** T41 display policy; source clustering and visible projection share these thresholds.
 * MapLibre's screen-radius clustering separates places as projected distances grow.
 * Exact anchors stay grouped: T42 consumes sameCityExpansion, without fake coordinates.
 */
export const coinDisplayRules={middleZoom:5.5,nearZoom:8.5,clusterRadius:48,clusterMaxZoom:8,photoOffset:-64,expansionMargin:12,scatterCandidates:160,scatterRadius:400,scatterMobileRadius:420} as const;
export type CoinDisplayStage='far'|'middle'|'near';
export function coinDisplayStage(zoom:number):CoinDisplayStage{return zoom<coinDisplayRules.middleZoom?'far':zoom<coinDisplayRules.nearZoom?'middle':'near'}
export function coinMarkerVisual(image:ImageRecord|null|undefined,failed=false){return image&&!failed?'image':'placeholder'}
export type CoinDisplay=DisplayCoinEntry&{
 stage:CoinDisplayStage;kind:'family'|'collection';members:CoinMember[];representative:CoinMember|undefined;
 sameCityExpansion:boolean;anchors:{placeId:string;coordinates:[number,number]}[];
 offsetX:number;collectionGroups:CoinPlace[];fullMembers:CoinMember[];overflow:boolean;occluded?:boolean;
};
/** Stable, bounded screen-space scattering. No random state or geographic edits. */
export type CoinScatterPosition={offsetX:number;offset:number};
const hash=(value:string)=>{let h=2166136261;for(const c of value)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function scatterCoins(entries:MapCoinEntry[],input:{width:number;height:number;labels:Box[];selectedId?:string;expansionObstacles?:Box[];expansionHeight?:number;expansionTop?:number;previous?:ReadonlyMap<string,CoinScatterPosition>}):CoinDisplay[]{
 const small=input.width<600,margin=coinDisplayRules.expansionMargin;
 const top=input.expansionTop||0,bottom=Math.min(input.height,input.expansionHeight??input.height);
 const cities=[...entries].sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0).map(entry=>{
  const members=uniqueMembers(entry.groups),anchors=entry.groups.map(g=>({placeId:g.place.id,coordinates:g.place.coordinates})),cityKey=JSON.stringify(anchors.map(a=>a.placeId).sort());
  return {entry,members,anchors,cityKey,placed:[] as CoinDisplay[]};
 });
 const centers=cities.map(c=>({x:c.entry.point.x,y:c.entry.point.y+9,w:126,h:64}));
 const obstacles=[...input.labels,...centers,...input.expansionObstacles||[]];
 const occupied:Box[]=[],result:CoinDisplay[]=[];
 function make(city:typeof cities[number],member:CoinMember|undefined,remaining:CoinMember[],pos:CoinScatterPosition):CoinDisplay{
  const {entry,anchors,members,cityKey}=city,geometry=markerGeometry({x:entry.point.x+pos.offsetX,y:entry.point.y+pos.offset},true,small,member?1:remaining.length,0,member?.image);
  // Include selected outline and a usable minimum pointer target in collision geometry.
  const bounds={...geometry.box,w:Math.max(44,geometry.box.w)+4,h:Math.max(32,geometry.box.h)+4};
  return {...entry,key:`city:${cityKey}:${member?member.family.id:'remaining'}`,stage:'near',large:true,displayCollection:false,entryKeys:[entry.key],sameCityExpansion:members.length>1,anchors,collectionGroups:entry.groups,fullMembers:members,
   members:member?[member]:remaining,representative:member,kind:member?'family':'collection',overflow:!member,...pos,bounds};
 }
 const inside=(b:Box)=>b.x-b.w/2>=margin&&b.x+b.w/2<=input.width-margin&&b.y-b.h/2>=top+margin&&b.y+b.h/2<=bottom-margin;
 const free=(e:CoinDisplay)=>inside(e.bounds)&&!obstacles.some(b=>intersects(e.bounds,b))&&!occupied.some(b=>intersects(e.bounds,b));
 function candidates(city:typeof cities[number],id:string):CoinScatterPosition[]{
  const seed=hash(city.cityKey+':'+id),angle=(seed%360)*Math.PI/180;
  const radius=small?coinDisplayRules.scatterMobileRadius:coinDisplayRules.scatterRadius;
  const initial=65+(seed>>>9)%50;
  return Array.from({length:coinDisplayRules.scatterCandidates},(_,i)=>{
   // Different ID phases and radius bands produce staggered directions, not a circle/spiral queue.
   const a=angle+i*2.3999632297+(hash(id+':'+i)%37-18)*Math.PI/180;
   const r=initial+Math.floor(i/10)*26+(hash(city.cityKey+':'+i)%31);
   const distance=Math.min(radius,r);
   const x=city.entry.point.x+Math.cos(a)*distance,y=city.entry.point.y+Math.sin(a)*distance*.86;
   const padX=small?38:42,padY=36;
   return {offsetX:Math.round(Math.max(margin+padX,Math.min(input.width-margin-padX,x))-city.entry.point.x),offset:Math.round(Math.max(top+margin+padY,Math.min(bottom-margin-padY,y))-city.entry.point.y)};
  });
 }
 const pending=cities.flatMap(city=>city.members.map(member=>({city,member,key:`city:${city.cityKey}:${member.family.id}`})));
 // Keep every still-valid old slot first. Small pans, selection and filters don't reshuffle neighbours.
 const remaining:typeof pending=[];
 for(const item of [...pending].sort((a,b)=>Number(b.member.family.id===input.selectedId)-Number(a.member.family.id===input.selectedId))){const old=input.previous?.get(item.key);let e=old&&make(item.city,item.member,[],old);if((!e||!free(e))&&item.member.family.id===input.selectedId)e=candidates(item.city,item.member.family.id).map(pos=>make(item.city,item.member,[],pos)).find(free);if(e&&free(e)){item.city.placed.push(e);occupied.push(e.bounds);result.push(e)}else remaining.push(item)}
 remaining.sort((a,b)=>Number(b.member.family.id===input.selectedId)-Number(a.member.family.id===input.selectedId)||hash(a.key)-hash(b.key)||a.key.localeCompare(b.key));
 for(const item of remaining){const e=candidates(item.city,item.member.family.id).map(pos=>make(item.city,item.member,[],pos)).find(free);if(e){item.city.placed.push(e);occupied.push(e.bounds);result.push(e)}}
 for(const city of cities){
  let unplaced=city.members.filter(m=>!city.placed.some(e=>e.members[0].family.id===m.family.id));if(!unplaced.length)continue;
  const findRemaining=()=>candidates(city,'remaining').map(pos=>make(city,undefined,unplaced,pos)).find(free);
  let e=findRemaining();
  // Reserve an actionable collection footprint, never displace the selected family.
  if(!e){const removable=[...city.placed].reverse().find(e=>e.members[0].family.id!==input.selectedId);if(removable){occupied.splice(occupied.indexOf(removable.bounds),1);result.splice(result.indexOf(removable),1);city.placed.splice(city.placed.indexOf(removable),1);unplaced=city.members.filter(m=>!city.placed.some(e=>e.members[0].family.id===m.family.id));e=findRemaining()||make(city,undefined,unplaced,{offsetX:removable.offsetX,offset:removable.offset});if(!free(e))e=undefined}}
  if(e){result.push(e);occupied.push(e.bounds)}else{
   // Fully occluded map space (e.g. reading/tool overlay) has no usable target.
   // Keep the city's complete remainder in the display model, but don't expose
   // an overlapping or hidden keyboard target underneath the covering panel.
   result.push({...make(city,undefined,unplaced,{offsetX:0,offset:0}),occluded:true});
  }
 }
 return result.sort((a,b)=>a.key.localeCompare(b.key));
}
export function displayCollectionContext(entry:CoinDisplay){return {placeIds:entry.collectionGroups.map(g=>g.place.id),familyIds:entry.fullMembers.map(m=>m.family.id),scrollTop:0}}
/** The renderer consumes one decision for images, collection counts and T42 expansion. */
export function displayCoins(input:{zoom:number;width:number;height:number;entries:MapCoinEntry[];labels:Box[];selectedId?:string;project?:(coordinates:[number,number])=>{x:number;y:number};expansionObstacles?:Box[];expansionHeight?:number;expansionTop?:number;previous?:ReadonlyMap<string,CoinScatterPosition>}):CoinDisplay[]{
 const stage=coinDisplayStage(input.zoom);
 // A fractional zoom (8.5–9) can still query the source's last integer cluster.
 // Resolve its original anchors here so the public near threshold remains exact.
 const at=new Map<string,{entry:MapCoinEntry;groups:CoinPlace[]}>();
 if(stage==='near')for(const entry of input.entries)for(const group of entry.groups){
  const key=group.place.coordinates.join(','),value=at.get(key)||{entry,groups:[]};
  if(!value.groups.some(g=>g.place.id===group.place.id))value.groups.push(group);at.set(key,value);
 }
 const entries=stage==='near'?[...at.values()].map(({entry,groups})=>{
  groups.sort((a,b)=>stable(a.place,b.place));const coords=groups[0].place.coordinates;
  return {...entry,key:`p:${JSON.stringify(groups.map(g=>g.place.id))}`,coords,point:input.project?.(coords)||entry.point,groups,cluster:false};
 }).filter(e=>e.point.x>=0&&e.point.x<=input.width&&e.point.y>=0&&e.point.y<=input.height):input.entries;
 // Expand the original city groups before collision merging. Expanded slots must not
 // pass through layoutCoinEntries, which intentionally merges coincident footprints.
 if(stage==='near')return scatterCoins(entries,input);
 return layoutCoinEntries(entries,input.labels,input.width,input.height,input.selectedId).map(entry=>{
  const members=uniqueMembers(entry.groups),representative=representativeMember(members,input.selectedId);
  return {...entry,stage,kind:members.length>1?'collection' as const:'family' as const,members,representative,sameCityExpansion:false,offsetX:0,collectionGroups:entry.groups,fullMembers:members,overflow:false,
   anchors:entry.groups.map(g=>({placeId:g.place.id,coordinates:g.place.coordinates}))};
 });
}

/** Collection navigation uses every real place, never its representative marker center. */
export function collectionCityTarget(groups:CoinPlace[]){
 const places=[...new Map(groups.map(g=>[g.place.id,g.place])).values()].sort(stable);
 const coordinates=[...new Map(places.map(p=>[p.coordinates.join(','),p.coordinates])).values()];
 if(!coordinates.length)return null;
 return {kind:places.length===1?'single' as const:'multiple' as const,placeIds:places.map(p=>p.id),coordinates,
  bounds:[[Math.min(...coordinates.map(c=>c[0])),Math.min(...coordinates.map(c=>c[1]))],[Math.max(...coordinates.map(c=>c[0])),Math.max(...coordinates.map(c=>c[1]))]] as [[number,number],[number,number]]};
}
export function coinEntryAction(entry:Pick<CoinDisplay,'kind'|'overflow'|'members'|'collectionGroups'>){
 if(entry.overflow)return {kind:'remaining' as const};
 if(entry.kind==='family')return {kind:'family' as const,familyId:entry.members[0].family.id};
 return {kind:'navigate' as const,target:collectionCityTarget(entry.collectionGroups)};
}

/** The same padding used by cameraForBounds/fitBounds; allow projection rounding. */
export function collectionViewReady(input:{points:{x:number;y:number}[];width:number;height:number;padding:{left:number;right:number;top:number;bottom:number};zoom:number;targetZoom:number}){
 const {points,width,height,padding,zoom,targetZoom}=input;
 return points.length>0&&zoom>=Math.min(coinDisplayRules.nearZoom,targetZoom)-.01&&points.every(p=>
  p.x>=padding.left-2&&p.x<=width-padding.right+2&&p.y>=padding.top-2&&p.y<=height-padding.bottom+2);
}
