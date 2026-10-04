import type {MapRange} from './map-layers';
import {rangeColor} from './map-layers.ts';
/** Source boundary paths are separate from polygons closed for filling/querying. */
export function rangeBoundaryFeatures(ranges:MapRange[]){
 return {type:'FeatureCollection' as const,features:ranges.filter(r=>r.geometry&&(r.boundary||!r.coverageEdge)).map(r=>({type:'Feature' as const,id:r.id,
 geometry:r.boundary||r.geometry!,properties:{id:r.id,color:rangeColor(r.objectId),kind:r.kind,precision:r.precision}}))};
}
