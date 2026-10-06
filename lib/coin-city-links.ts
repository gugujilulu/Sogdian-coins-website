import type {CoinDisplay,Box} from './coin-map';
type Point={x:number;y:number};
/** Screen-only endpoints: identity and coordinates always come from matched members. */
export function coinCityLinks(entry:CoinDisplay,coin:Box,project:(coords:[number,number])=>Point,selectedId?:string){
 if(entry.occluded)return [];
 const ids=new Set(entry.members.map(m=>m.family.anchor?.placeId).filter(Boolean));
 const anchors=[...new Map(entry.anchors.filter(a=>ids.has(a.placeId)).map(a=>[a.placeId,a])).values()];
 return anchors.flatMap(anchor=>{
  const segment=cityLinkSegment(coin,project(anchor.coordinates));
  return segment?[{placeId:anchor.placeId,...segment,selected:entry.members.some(m=>m.family.id===selectedId&&m.family.anchor?.placeId===anchor.placeId)}]:[];
 });
}

export function cityLinkSegment(coin:Box,city:Point){
 const dx=city.x-coin.x,dy=city.y-coin.y,distance=Math.hypot(dx,dy);if(!distance)return null;
 const edge=Math.min(dx?coin.w/2/Math.abs(dx):Infinity,dy?coin.h/2/Math.abs(dy):Infinity)+2/distance,end=1-18/distance;
 return edge<end?{from:{x:coin.x+dx*edge,y:coin.y+dy*edge},to:{x:coin.x+dx*end,y:coin.y+dy*end}}:null;
}
/** Finite line/rectangle intersection, including clearance around a coin. */
export function cityLinkHitsBox(line:{from:Point;to:Point}|null,box:Box){
 if(!line)return false;let low=0,high=1;
 for(const axis of ['x','y'] as const){const start=line.from[axis],delta=line.to[axis]-start,half=(axis==='x'?box.w:box.h)/2+3,min=box[axis]-half,max=box[axis]+half;
  if(Math.abs(delta)<1e-8){if(start<min||start>max)return false;continue}
  const a=(min-start)/delta,b=(max-start)/delta;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));if(low>high)return false;
 }return true;
}
