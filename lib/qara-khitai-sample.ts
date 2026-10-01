import {qaraKhitaiGeometry as traced} from './qara-khitai-geometry.ts';
import type {MapRange} from './map-layers';
/** A source-bounded excerpt, never an inferred full extent or coin circulation area. */
export function qaraKhitaiSample(familyIds:string[]):MapRange{
 return {id:'bregel:2003:map15:qara-khitai:after-1141:excerpt',objectId:'polity:qara-khitai',familyIds,
 kind:'polity',title:'西辽，1141年后｜局部范围',labelTitle:'西 辽',labelLatin:'QARA KHITAI · 1141年后',
 timeEvidence:{startInclusive:false},spatialMeaning:'core',coverage:{extent:'partial',note:'东侧范围延伸至原图之外；资料覆盖边缘仅截断填色，不绘国界'},
 start:1141,end:null,periodText:'1141年后（原图未指定终年）',precision:'documented',
 source:'Yuri Bregel, An Historical Atlas of Central Asia, Brill, 2003, 第15图，p.31\nhttps://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf',
 note:'原图本部范围摘录，不含虚线附属范围，不是钱币流通范围。原图矢量路径按8个已有地点配准，控制点最大残差8.4公里；属小比例尺概括，不能用于局部边界考证。东侧范围延伸至原图之外；仅填色闭合，不补画国界。终年未指定，指定年份模式不推定持续有效。',
 geometry:{type:'Polygon',coordinates:traced.geometry.coordinates},
 boundary:{type:'MultiLineString',coordinates:traced.boundary.coordinates},
 coverageEdge:{type:'LineString',coordinates:traced.coverageEdge.coordinates},
 coverageLabel:traced.coverageLabel as [number,number],label:[85.0,46.7],labelAngle:-5,display:{washOpacity:.34}};
}
