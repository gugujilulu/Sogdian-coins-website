import type {Family, Place, Specimen, ImageRecord} from './atlas';
export type CoinMember={family:Family;recordCount:number;record:Specimen|null;image:ImageRecord|null};
export type CoinPlace={place:Place;members:CoinMember[]};
const stable=(a:{id:string},b:{id:string})=>a.id<b.id?-1:a.id>b.id?1:0;
/** Only matched records supply covers. Family artwork is never substituted. */
export function coinPlaces(families:Family[],records:Specimen[],places:Place[],imageMatches:(image:ImageRecord)=>boolean=()=>true):CoinPlace[]{
 const byFamily=new Map<string,Specimen[]>();
 for(const r of records){const rs=byFamily.get(r.familyId)||[];if(!rs.some(x=>x.id===r.id))rs.push(r);byFamily.set(r.familyId,rs)}
 const groups=new Map<string,CoinMember[]>();
 for(const f of [...new Map(families.map(f=>[f.id,f])).values()].sort(stable)){
  const rs=[...(byFamily.get(f.id)||[])].sort(stable);if(!f.anchor||!rs.length)continue;
  const record=rs.find(r=>r.images.some(i=>i.path&&imageMatches(i)))||rs[0];
  const image=[...record.images].filter(i=>i.path&&imageMatches(i)).sort(stable)[0]||null;
  const members=groups.get(f.anchor.placeId)||[];members.push({family:f,recordCount:rs.length,record,image});groups.set(f.anchor.placeId,members);
 }
 return [...places].sort(stable).flatMap(place=>groups.has(place.id)?[{place,members:groups.get(place.id)!}]:[]);
}
export function uniqueMembers(groups:CoinPlace[]):CoinMember[]{return [...new Map(groups.flatMap(g=>g.members).map(m=>[m.family.id,m])).values()].sort((a,b)=>stable(a.family,b.family))}
export function coverMember(members:CoinMember[],selectedId?:string):CoinMember|undefined{return members.find(m=>m.family.id===selectedId&&m.image)||members.find(m=>m.image)||members[0]}
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
