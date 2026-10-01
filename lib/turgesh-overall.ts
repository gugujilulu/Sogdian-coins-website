import {turgeshOverallRing as ring} from './turgesh-overall-geometry.ts';
import type {MapRange} from './map-layers';
export function turgeshOverall(familyIds:string[]):MapRange{
 return {id:'synthesis:turgesh:foundation:overall:v1',objectId:'polity:turgesh',familyIds,defaultPriority:10,
 title:'突骑施｜建国初期大致范围',labelTitle:'突 骑 施',labelLatin:'TÜRGESH · 约700年前后',
 kind:'polity',precision:'approximate',start:null,end:null,periodText:'建国初期，约700年前后',
 spatialMeaning:'polity',coverage:{extent:'complete',note:'本资料版本为整体概括；分段证据与后续研究见资料与方法。'},
 source:'Michael Fedorov, Money Circulation in Early-Mediaeval Semirech’e (Jety Su), ONS Newsletter 178, 2004, p.9\nhttps://www.orientalnumismaticsociety.org/archive/ONS_178.pdf\nYuri Bregel, An Historical Atlas of Central Asia, 2003, p.16；第8图p.17\nhttps://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf',
 note:'根据Fedorov与Bregel对建国初期主要空间的概括重建：西至石国与锡尔河方向，北至额尔齐斯方向，东至别失八里／吐鲁番，中心为七河。全部线段均为综合概括，北西过渡采用大致推定；没有直接描绘的逐点国界段。图8提供地理关系参照，未继承其混合时期西突厥全部旧疆。分段制作记录保存在突骑施接入登记。范围年代保留概括阶段，数字端点未指定。地方附属关系及北西界分期研究仍待补充。',
 geometry:{type:'Polygon',coordinates:[ring]},boundary:{type:'MultiLineString',coordinates:[ring]},label:[79.3,45.0],display:{washOpacity:.30}};
}
