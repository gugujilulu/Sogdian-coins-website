import type {Map as GLMap,PaddingOptions} from 'maplibre-gl';
import {rangeFocusMaxZoom} from './map-layers.ts';

/** Preserve a saved wide range view when restoring the existing camera history. */
export function rangeInitialMinZoom(zoom?:number){return zoom!==undefined&&Number.isFinite(zoom)?Math.max(0,Math.min(3,zoom)):3}

/** Explicit range fit may need a wider view than the normal coin-browsing limits. */
export function fitHistoricalRange(map:Pick<GLMap,'cameraForBounds'|'getMinZoom'|'setMinZoom'|'setMaxBounds'|'stop'|'fitBounds'>,bounds:[[number,number],[number,number]],padding:PaddingOptions,duration:number){
 const maxZoom=rangeFocusMaxZoom(bounds);
 const camera=map.cameraForBounds(bounds,{padding,maxZoom});
 if(!camera||camera.zoom===undefined||!Number.isFinite(camera.zoom))return;
 map.stop();map.setMaxBounds(null);
 if(camera.zoom<map.getMinZoom())map.setMinZoom(Math.max(0,camera.zoom-.01));
 map.fitBounds(bounds,{padding,maxZoom,duration,linear:true});
}
