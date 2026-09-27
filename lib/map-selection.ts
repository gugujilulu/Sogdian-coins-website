import type {CoinPlace} from './coin-map';
import type {Specimen} from './atlas';

/** A browsing context, not a source identity or a zoom-dependent cluster ID. */
export type CollectionContext={placeIds:string[];familyIds:string[];scrollTop:number};
export function collectionMembers(groups:CoinPlace[],context:CollectionContext):CoinPlace[]{
 const places=new Set(context.placeIds),families=new Set(context.familyIds);
 return groups.filter(g=>places.has(g.place.id)).map(g=>({...g,members:g.members.filter(m=>families.has(m.family.id))})).filter(g=>g.members.length);
}
export function galleryRecords(records:Specimen[],group:string,facet:string){
 return records.filter(r=>(group==='all'||(group==='unassigned'?r.variantId===null:r.variantId===group))&&(facet==='all'||r.facets.includes(facet)));
}
export function validGallerySelection(records:Specimen[],group:string,facet:string){
 return {group:group==='all'||records.some(r=>group==='unassigned'?r.variantId===null:r.variantId===group)?group:'all',facet:facet==='all'||records.some(r=>r.facets.includes(facet))?facet:'all'};
}
export type FilterContext={query:string;region:string[];polity:string[];city:string[];familyFilter:string;sourceFilter:string;inscriptionFilter:string;tamghaFilter:string;featureFilter:string;statusFilter:string;year:number;dateMode:'all'|'year'|'unknown'};
export const emptyFilters:FilterContext={query:'',region:[],polity:[],city:[],familyFilter:'all',sourceFilter:'all',inscriptionFilter:'all',tamghaFilter:'all',featureFilter:'all',statusFilter:'all',year:750,dateMode:'all'};
export type FullFamilySession={familyId:string;filters:FilterContext;group:string;facet:string;expandedSignature:string};
export function keepFullFamilySession(session:FullFamilySession|null,familyId:string|null,filters:FilterContext){return session?.familyId===familyId&&session.expandedSignature===JSON.stringify(filters)?session:null}
/** Minimal pixel translation into the unobscured rectangle; never changes zoom. */
type Rect={left:number;right:number;top:number;bottom:number};
export function anchorPan(point:{x:number;y:number},area:Rect,locate=false,obstacles:Rect[]=[]):[number,number]{
 const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
 const target={x:locate?(area.left+area.right)/2:clamp(point.x,area.left,area.right),y:locate?(area.top+area.bottom)/2:clamp(point.y,area.top,area.bottom)};
 const xs=[target.x,...obstacles.flatMap(r=>[r.left-1,r.right+1])],ys=[target.y,...obstacles.flatMap(r=>[r.top-1,r.bottom+1])];
 const options=xs.flatMap(x=>ys.map(y=>({x,y}))).filter(p=>p.x>=area.left&&p.x<=area.right&&p.y>=area.top&&p.y<=area.bottom&&!obstacles.some(r=>p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=r.bottom));
 const closest=options.sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0]||target;
 return [point.x-closest.x,point.y-closest.y];
}
/** Viewing survives filtering; only matching records contribute to results. */
export function viewedRecord<T extends {id:string}>(records:readonly T[],id:string|null,matched:readonly {id:string}[]){
 const record=records.find(r=>r.id===id)||null;
 return {record,matches:!!record&&matched.some(r=>r.id===record.id)};
}
export function collectionReturn(groups:CoinPlace[],context:CollectionContext){return {context,groups:collectionMembers(groups,context)}}
