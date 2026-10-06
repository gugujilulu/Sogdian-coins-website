import type {CoinDisplay,Box} from './coin-map';
type Point={x:number;y:number};
/** Screen-only endpoints: identity and coordinates always come from matched members. */
export function coinCityLinks(entry:CoinDisplay,coin:Box,project:(coords:[number,number])=>Point,selectedId?:string){
 if(entry.occluded)return [];
 const ids=new Set(entry.members.map(m=>m.family.anchor?.placeId).filter(Boolean));
 const anchors=[...new Map(entry.anchors.filter(a=>ids.has(a.placeId)).map(a=>[a.placeId,a])).values()];
 return anchors.flatMap(anchor=>{
  const city=project(anchor.coordinates),dx=city.x-coin.x,dy=city.y-coin.y,distance=Math.hypot(dx,dy);
  if(!distance)return [];
  const edge=Math.min(dx?coin.w/2/Math.abs(dx):Infinity,dy?coin.h/2/Math.abs(dy):Infinity);
  const end=1-18/distance;if(edge>=end)return [];
  return [{placeId:anchor.placeId,from:{x:coin.x+dx*edge,y:coin.y+dy*edge},to:{x:coin.x+dx*end,y:coin.y+dy*end},selected:entry.members.some(m=>m.family.id===selectedId&&m.family.anchor?.placeId===anchor.placeId)}];
 });
}
