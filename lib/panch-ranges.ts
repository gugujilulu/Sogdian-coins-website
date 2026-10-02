import {panchCoreRing,panchOasisRing} from './panch-geometry.ts';
import type {MapRange} from './map-layers';
const source='Boris I. Marshak，PANJIKANT，2002，更新2016；历史与考古章节\nhttps://www.iranicaonline.org/articles/panjikant/\nBasira Mir-Makhamad et al.，Agriculture along the upper part of the Middle Zarafshan River during the first millennium AD，2024，Study area／图1–3\nhttps://doi.org/10.1371/journal.pone.0297896\nSanjar-shah Excavations Report，2013，图22及Survey段\nhttps://www.exploration-eurasia.com/inhalt/projekt_5.htm';
export function panchCore(familyIds:string[]):MapRange{
 return{id:'synthesis:panch:core-early-c8:v1',objectId:'polity:panch',familyIds,defaultPriority:10,
 kind:'polity',spatialMeaning:'core',title:'潘治 / Panch｜本部核心',labelTitle:'潘 治',labelLatin:'PANCH · 7世纪末—8世纪初',
 start:null,end:null,periodText:'7世纪末—8世纪初（概括阶段）',precision:'approximate',source,
 coverage:{extent:'partial',note:'古城与近侧农业阶地本部核心；更广统辖空间待细化。'},
 note:'以古潘治及附近灌溉农业阶地综合重建。本版参考考古调查图的河谷与山前地形，政权边缘为推定过渡。桑贾尔沙赫与潘治的管辖关系仍待核实；帕尔加尔、穆格山及德瓦什提奇的活动或撤退地点另行研究。资料与制作底稿保留分段依据、两个地理控制点和定位局限。',
 geometry:{type:'Polygon',coordinates:[panchCoreRing]},boundary:{type:'MultiLineString',coordinates:[panchCoreRing]},label:[67.657,39.487],display:{washOpacity:.25}};
}
export function panchOasis(familyIds:string[]):MapRange{
 return{id:'synthesis:panch:local-oasis:v1',objectId:'region:panch',familyIds,defaultPriority:10,
 kind:'context',spatialMeaning:'region',title:'潘治绿洲 / Panch｜地域背景',labelTitle:'潘治绿洲',labelLatin:'PANCH OASIS',
 start:null,end:null,timeApplicability:'cross-period',periodText:'跨时期地方绿洲背景',precision:'approximate',source,
 coverage:{extent:'partial',note:'古城附近南岸河谷—马吉安河口阶地；地方地域核心。'},
 note:'采用古城附近泽拉夫尚南岸河谷、农业阶地与马吉安河口的地方绿洲核心定义。调查图提供河谷及山前参照，西侧较宽地域过渡留待细化；范围与历史地方政权分别登记。地理背景沿用跨时期规则，古水道及农业边缘变化保留后续项。未使用现代行政区、任意城市缓冲圈或钱币点包络。',
 geometry:{type:'Polygon',coordinates:[panchOasisRing]},boundary:{type:'MultiLineString',coordinates:[panchOasisRing]},label:[67.677,39.500],display:{washOpacity:.20}};
}
