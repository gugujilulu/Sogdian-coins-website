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
export type FilterContext={query:string;region:string;polity:string;city:string;familyFilter:string;sourceFilter:string;inscriptionFilter:string;tamghaFilter:string;featureFilter:string;statusFilter:string;year:number;dateMode:'all'|'year'|'unknown'};
export const emptyFilters:FilterContext={query:'',region:'all',polity:'all',city:'all',familyFilter:'all',sourceFilter:'all',inscriptionFilter:'all',tamghaFilter:'all',featureFilter:'all',statusFilter:'all',year:750,dateMode:'all'};
export type FullFamilySession={familyId:string;filters:FilterContext;group:string;facet:string;expandedSignature:string};
export function keepFullFamilySession(session:FullFamilySession|null,familyId:string|null,filters:FilterContext){return session?.familyId===familyId&&session.expandedSignature===JSON.stringify(filters)?session:null}
/** Minimal pixel translation into the unobscured rectangle; never changes zoom. */
export function anchorPan(point:{x:number;y:number},area:{left:number;right:number;top:number;bottom:number},locate=false):[number,number]{
 const x=locate?(area.left+area.right)/2:Math.max(area.left,Math.min(area.right,point.x));
 const y=locate?(area.top+area.bottom)/2:Math.max(area.top,Math.min(area.bottom,point.y));
 return [point.x-x,point.y-y];
}
