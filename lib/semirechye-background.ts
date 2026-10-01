import {semirechyeRing as ring} from './semirechye-geometry.ts';
import type {MapRange} from './map-layers';
export function semirechyeBackground(familyIds:string[]):MapRange{
 return {id:'synthesis:semirechye:core-chu:v1',objectId:'region:semirechye',familyIds,defaultPriority:10,
 title:'七河 / Semirechye｜地域背景',labelTitle:'七 河',labelLatin:'SEMIRECHYE · JETY SU',
 kind:'context',spatialMeaning:'region',precision:'approximate',start:null,end:null,timeApplicability:'cross-period',periodText:'跨时期地域背景',
 coverage:{extent:'complete',note:'本定义的整体概括版本；地域边缘为自然过渡。'},
 source:'Советская историческая энциклопедия，СЕМИРЕЧЬЕ条目（Gufo文本入口）\nhttps://gufo.me/dict/history_encyclopedia/СЕМИРЕЧЬЕ\nMichael Fedorov，Money Circulation in Early-Mediaeval Semirech’e (Jety Su)，ONS Newsletter 178，2004，p.7\nhttps://www.orientalnumismaticsociety.org/archive/ONS_178.pdf\nNina Bogutskaya，Freshwater Ecoregions of the World，Balkash – Alakul 624（地理参照）\nhttps://www.feow.org/ecoregions/details/624',
 note:'采用核心七河＋楚河流域的广义定义。核心以巴尔喀什、萨瑟克／阿拉湖、准噶尔阿拉套、北天山与楚伊犁山为参照，西部延入楚河谷及下游过渡。轮廓按文献与具名地理参照综合重建，非原图逐点描绘；楚河荒漠西缘需进一步细化。未自动合入完整怛罗斯流域、伊塞克湖盆地或全部上伊犁；不同定义留待另版。分段底稿见七河接入登记。',
 geometry:{type:'Polygon',coordinates:[ring]},boundary:{type:'MultiLineString',coordinates:[ring]},label:[77.7,44.9],display:{washOpacity:.25}};
}
