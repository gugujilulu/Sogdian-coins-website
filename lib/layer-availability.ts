import {placeClaims,type LayerKey,type MapBackground,type MapTime,type LayerSettings,type MapRange} from './map-layers.ts';
const roles={centers:['center'],sites:['site'],mints:['mint','mint-candidate'],findspots:['findspot'],hoards:['hoard']} as const;
// Separate corpus coverage from the layers visible under the current time filter.
export function layerAvailability(key:LayerKey,background:MapBackground,ranges:MapRange[],time:MapTime){
 const available=key==='coins'?1:key==='polities'||key==='context'||key==='circulation'?new Set(background.ranges.filter(r=>r.geometry&&r.kind===(key==='polities'?'polity':key)).map(r=>r.objectId)).size:background.places.filter(p=>key==='cities'||p.claims.some(c=>(roles[key as keyof typeof roles] as readonly string[]).includes(c.role))).length;
 const active=key==='coins'?1:key==='polities'||key==='context'||key==='circulation'?ranges.filter(r=>r.kind===(key==='polities'?'polity':key)).length:background.places.filter(p=>placeClaims(p,{[key]:true} as LayerSettings,time).length).length;
 return {available,active};
}
