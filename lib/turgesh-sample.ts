import {turgeshGeometry as traced} from './turgesh-geometry.ts';
import type {MapRange} from './map-layers';
export function turgeshSample(familyIds:string[]):MapRange {
 return {id:'bregel:2003:map9:turgesh:first-half-8c:excerpt',objectId:'polity:turgesh',familyIds,
 kind:'polity',title:'突骑施，8世纪上半叶｜局部资料范围',labelTitle:'突 骑 施',labelLatin:'TÜRGESH · 局部',
 start:null,end:null,periodText:'8世纪上半叶（图中多时点概括；本段边界适用起止年未指定）',
 precision:'approximate',spatialMeaning:'polity',coverage:{extent:'partial',edgeLabel:'北西资料截断；非国界',note:'北侧开放，西侧线端以资料覆盖边缘闭合填色；不补画政治边界。未覆盖其余北部、西部与其他时期。'},
 source:'Yuri Bregel, An Historical Atlas of Central Asia, Brill, 2003，第9图 p.19（PDF p.33），说明p.18\nhttps://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf',
 note:'只摘录第9图突骑施文字旁的南侧蓝色边界；不包含东突厥/回鹘范围或军事行动箭头。图例未区分本部与附属，本版不推定。选定局部资料截面用于显示，闭合边不是国界；不能作钱币发行、铸地或流通范围。资料年代是多时点概括，不视为连续有效区间；指定年份无法确认，需主动作为历史背景查看。',
 geometry:{type:'Polygon',coordinates:traced.geometry.coordinates},boundary:{type:'MultiLineString',coordinates:traced.boundary.coordinates},coverageEdge:{type:'LineString',coordinates:traced.coverageEdge.coordinates},
 label:[78,44.1],coverageLabel:[77,46.3],display:{washOpacity:.30}};
}
