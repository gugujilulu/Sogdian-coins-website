import type {Atlas,Specimen} from './atlas';
export type SearchMapTarget={kind:'none'|'unlocated'|'single'|'multiple';coordinates:[number,number][];placeIds:string[];recordCount:number;unlocatedRecords:number};
export type SearchMapRequest={serial:number;query:string;filterKey:string;target:SearchMapTarget};
/** The same matching records supply both display and navigation; no geographic inference. */
export function searchMapTarget(data:Atlas,records:readonly Specimen[]):SearchMapTarget{
 const families=new Map(data.families.map(f=>[f.id,f])),places=new Map(data.places.map(p=>[p.id,p]));
 const points=new Map<string,[number,number]>(),ids=new Set<string>();let unlocatedRecords=0;
 const unique=[...new Map(records.map(r=>[r.id,r])).values()];
 for(const record of unique){const id=families.get(record.familyId)?.anchor?.placeId,p=id?places.get(id):undefined,c=p?.coordinates;
  if(!c||!c.every(Number.isFinite)||Math.abs(c[0])>180||Math.abs(c[1])>90){unlocatedRecords++;continue}
  ids.add(p.id);points.set(c.join(','),[...c]);
 }
 const coordinates=[...points.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 return {kind:!unique.length?'none':!coordinates.length?'unlocated':coordinates.length===1?'single':'multiple',coordinates,placeIds:[...ids].sort(),recordCount:unique.length,unlocatedRecords};
}
export function searchBounds(target:SearchMapTarget):[[number,number],[number,number]]|null{
 if(!target.coordinates.length)return null;
 return [[Math.min(...target.coordinates.map(c=>c[0])),Math.min(...target.coordinates.map(c=>c[1]))],[Math.max(...target.coordinates.map(c=>c[0])),Math.max(...target.coordinates.map(c=>c[1]))]];
}
export function searchEnter(key:string,composing=false,keyCode=0){return key==='Enter'&&!composing&&keyCode!==229}
export type ScreenRect={left:number;right:number;top:number;bottom:number};
/** Bounded rectangular cuts of the actual visible overlays, only at explicit submission. */
export function searchMapPadding(width:number,height:number,obstacles:ScreenRect[]){
 const side=Math.min(44,width*.12),vertical=Math.min(44,height*.12);
 let spaces:ScreenRect[]=[{left:side,right:width-side,top:vertical,bottom:height-vertical}];
 const area=(r:ScreenRect)=>(r.right-r.left)*(r.bottom-r.top);
 for(const b of obstacles){const box={left:b.left-12,right:b.right+12,top:b.top-12,bottom:b.bottom+12};
  spaces=spaces.flatMap(r=>{if(box.right<=r.left||box.left>=r.right||box.bottom<=r.top||box.top>=r.bottom)return[r];return[
   {...r,right:Math.min(r.right,box.left)},{...r,left:Math.max(r.left,box.right)},
   {...r,bottom:Math.min(r.bottom,box.top)},{...r,top:Math.max(r.top,box.bottom)},
  ]}).filter(r=>r.right-r.left>=40&&r.bottom-r.top>=40).sort((a,b)=>area(b)-area(a)||a.top-b.top||a.left-b.left).slice(0,32);
 }
 const best=spaces[0];if(!best)return null;
 return {left:best.left,right:width-best.right,top:best.top,bottom:height-best.bottom};
}
/** Only the latest explicit request is queued; consumed requests never replay after interruption. */
export function searchNavigationQueue(run:(request:SearchMapRequest)=>void){
 let latest=0,ready=false,disposed=false,pending:SearchMapRequest|null=null;
 const flush=()=>{if(!disposed&&ready&&pending){const request=pending;pending=null;run(request)}};
 return {offer(request:SearchMapRequest){if(disposed||request.serial<=latest)return;latest=request.serial;pending=request;flush()},setReady(value:boolean){ready=value;flush()},dispose(){disposed=true;pending=null}};
}
