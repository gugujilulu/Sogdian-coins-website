import type {Family, Place, Specimen, ImageRecord} from './atlas';
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
 const ratio=image?.width&&image?.height&&image.width>0&&image.height>0?image.width/image.height:1.5;
 const base=image?(large?size.normal:size.compact):coinMarkerSizes.placeholder;
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
export const coinDisplayRules={middleZoom:5.5,nearZoom:8.5,clusterRadius:48,clusterMaxZoom:8,photoOffset:-64,expansionGap:12,expansionMargin:12,anchorClearance:44,desktopColumns:5,mobileColumns:3} as const;
export type CoinDisplayStage='far'|'middle'|'near';
export function coinDisplayStage(zoom:number):CoinDisplayStage{return zoom<coinDisplayRules.middleZoom?'far':zoom<coinDisplayRules.nearZoom?'middle':'near'}
export function coinMarkerVisual(image:ImageRecord|null|undefined,failed=false){return image&&!failed?'image':'placeholder'}
export type CoinDisplay=DisplayCoinEntry&{
 stage:CoinDisplayStage;kind:'family'|'collection';members:CoinMember[];representative:CoinMember|undefined;
 sameCityExpansion:boolean;anchors:{placeId:string;coordinates:[number,number]}[];
 offsetX:number;collectionGroups:CoinPlace[];fullMembers:CoinMember[];overflow:boolean;
};
/** One grid belongs to its real anchor. Slots never depend on selection or image aspect ratio. */
function expandCity(entry:MapCoinEntry,width:number,height:number,labels:Box[]):CoinDisplay[]{
 const members=uniqueMembers(entry.groups),small=width<600,size=small?coinMarkerSizes.mobile:coinMarkerSizes.desktop;
 const {expansionGap:gap,expansionMargin:margin,anchorClearance:clearance}=coinDisplayRules;
 const cellW=size.normal+gap,cellH=size.maxHeight+gap;
 const columns=Math.max(1,Math.min(small?coinDisplayRules.mobileColumns:coinDisplayRules.desktopColumns,Math.floor((width-margin*2)/cellW),members.length));
 const maxRows=Math.max(1,Math.floor((height-margin*2-clearance)/cellH));
 const capacity=columns*maxRows,overflow=members.length>capacity;
 const shown=overflow?members.slice(0,Math.max(0,capacity-1)):members;
 const slots=shown.length+(overflow?1:0),rows=Math.ceil(slots/columns),gridW=columns*cellW-gap,gridH=rows*cellH-gap;
 const clamp=(v:number,extent:number,total:number)=>Math.max(margin,Math.min(total-margin-extent,v));
 const candidates=[
  {x:entry.point.x-gridW/2,y:entry.point.y-clearance-gridH},
  {x:entry.point.x-gridW/2,y:entry.point.y+clearance},
  {x:entry.point.x+clearance,y:entry.point.y-gridH/2},
  {x:entry.point.x-clearance-gridW,y:entry.point.y-gridH/2},
 ].map(p=>({x:clamp(p.x,gridW,width),y:clamp(p.y,gridH,height)}));
 const shape=(p:{x:number;y:number},index:number,member?:CoinMember)=>{
  const point={x:p.x+(index%columns)*cellW+size.normal/2,y:p.y+Math.floor(index/columns)*cellH+size.maxHeight/2};
  return markerGeometry(point,true,small,member?1:members.length-shown.length,0,member?.image);
 };
 const obstacles=[...labels,{x:entry.point.x,y:entry.point.y+8,w:100,h:50}];
 const penalty=(p:{x:number;y:number})=>Array.from({length:slots},(_,i)=>shape(p,i,shown[i]).box).reduce((n,b)=>n+obstacles.filter(label=>intersects(b,label)).length,0);
 const origin=candidates.map((p,i)=>({p,i,penalty:penalty(p)})).sort((a,b)=>a.penalty-b.penalty||a.i-b.i)[0].p;
 const anchors=entry.groups.map(g=>({placeId:g.place.id,coordinates:g.place.coordinates}));
 const base={...entry,stage:'near' as const,large:true,displayCollection:false,entryKeys:[entry.key],sameCityExpansion:true,anchors,collectionGroups:entry.groups,fullMembers:members};
 const cityKey=JSON.stringify(anchors.map(a=>a.placeId).sort());
 return Array.from({length:slots},(_,i)=>{
  const member=shown[i],geometry=shape(origin,i,member),bounds=geometry.box;
  const x=origin.x+(i%columns)*cellW+size.normal/2,y=origin.y+Math.floor(i/columns)*cellH+size.maxHeight/2;
  const remaining=members.slice(shown.length);
  return {...base,key:`city:${cityKey}:${member?member.family.id:'remaining'}`,members:member?[member]:remaining,representative:member,
   kind:member?'family' as const:'collection' as const,overflow:!member,offsetX:x-entry.point.x,offset:y-entry.point.y,bounds};
 });
}
export function displayCollectionContext(entry:CoinDisplay){return {placeIds:entry.collectionGroups.map(g=>g.place.id),familyIds:entry.fullMembers.map(m=>m.family.id),scrollTop:0}}
/** The renderer consumes one decision for images, collection counts and T42 expansion. */
export function displayCoins(input:{zoom:number;width:number;height:number;entries:MapCoinEntry[];labels:Box[];selectedId?:string}):CoinDisplay[]{
 const stage=coinDisplayStage(input.zoom);
 // Expand the original city groups before collision merging. Expanded slots must not
 // pass through layoutCoinEntries, which intentionally merges coincident footprints.
 const cities=stage==='near'?input.entries.filter(e=>!e.cluster&&uniqueMembers(e.groups).length>1):[];
 const expanded=[...cities].sort((a,b)=>a.key.localeCompare(b.key)).flatMap(e=>expandCity(e,input.width,input.height,input.labels));
 const ordinary=input.entries.filter(e=>!cities.includes(e));
 return [...layoutCoinEntries(ordinary,[...input.labels,...expanded.map(e=>e.bounds)],input.width,input.height,input.selectedId).map(entry=>{
  const members=uniqueMembers(entry.groups),preferred=coverMember(members,input.selectedId);
  // A selected member without an eligible photo retains its highlight, while a collection
  // may use another eligible member's photo; never borrow an unfiltered image.
  const representative=representativeMember(members,input.selectedId);
  const sameCityExpansion=stage==='near'&&entry.groups.some(g=>g.members.length>1);
  return {...entry,stage,kind:members.length>1?'collection' as const:'family' as const,members,representative,sameCityExpansion,offsetX:0,collectionGroups:entry.groups,fullMembers:members,overflow:false,
   anchors:entry.groups.map(g=>({placeId:g.place.id,coordinates:g.place.coordinates}))};
 }),...expanded];
}
