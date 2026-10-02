import {samarkandCoreRing,samarkandOasisRing} from './samarkand-geometry.ts';
import type {MapRange} from './map-layers';
const landscapeSource='Bernardo Rondelli & Simone Mantellini，Methods and Perspectives for Ancient Settlement Studies in the Middle Zeravshan Valley，The Silk Road 2/2，2004，pp.35–39，图2 p.36\nhttps://edspace.american.edu/silkroadjournal/wp-content/uploads/sites/984/2017/09/srjournal_v2n2-December-2004.pdf';
export function samarkandCore(familyIds:string[]):MapRange{
 return {id:'synthesis:samarkand:core-c7:v1',objectId:'polity:samarkand',familyIds,defaultPriority:10,
  kind:'polity',spatialMeaning:'core',title:'康国／撒马尔罕｜7世纪本部',labelTitle:'康 国',labelLatin:'SAMARKAND · 7世纪后半叶',
  start:null,end:null,periodText:'7世纪后半叶（概括阶段）',precision:'approximate',
  coverage:{extent:'partial',note:'撒马尔罕—达尔戈姆核心区；附属体系另列。'},
  source:'Yuri Bregel，An Historical Atlas of Central Asia，2003，p.16／第8图 p.17\nhttps://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf\nPavel Lurje，SOGDIANA ii. Historical Geography，2017\nhttps://www.iranicaonline.org/articles/sogdiana-historical-geography/\nFrantz Grenet，SAMARQAND i. History and Archaeology，2002，更新2013\nhttps://www.iranicaonline.org/articles/samarqand-i/\n'+landscapeSource,
  note:'本版按本部核心区方案综合重建：首府与达尔戈姆腹地作为中心，周边曹、米、屈霜那等体系分别保留。南侧参考图2河渠地貌，其他方向为推定过渡，并非原图所绘政治界线。Bregel的宗主关系未并为连续疆域；潘治、布哈拉及其他附属关系不进入本部色面。制作底稿记录推定段、比例尺定位和后续核对项。',
  geometry:{type:'Polygon',coordinates:[samarkandCoreRing]},boundary:{type:'MultiLineString',coordinates:[samarkandCoreRing]},label:[67.16,39.585],display:{washOpacity:.25}};
}
export function samarkandOasis(familyIds:string[]):MapRange{
 return {id:'synthesis:samarkand:four-doabs:v1',objectId:'region:samarkand',familyIds,defaultPriority:10,
  kind:'context',spatialMeaning:'region',title:'撒马尔罕绿洲｜地域背景',labelTitle:'撒马尔罕绿洲',labelLatin:'SAMARKAND OASIS',
  start:null,end:null,timeApplicability:'cross-period',periodText:'跨时期绿洲地域背景',precision:'approximate',
  coverage:{extent:'complete',note:'本版四个河渠间地区的整体概括。'},source:landscapeSource,
  note:'采用图2四个河渠间地区构成的绿洲定义，以阿克河、卡拉河、布伦古尔、泽拉夫尚、达尔戈姆与旧安格尔为参照。轮廓概括原图外缘，通过城市近似锚点、比例尺与指北针作局部定位；尚无独立控制点残差。河渠和灌溉边缘随时代变化，详细古水道留待细化。该绿洲定义与更广义撒马尔罕行政地域分别记录，钱币关联沿用地区索引。',
  geometry:{type:'Polygon',coordinates:[samarkandOasisRing]},boundary:{type:'MultiLineString',coordinates:[samarkandOasisRing]},label:[66.63,39.93],display:{washOpacity:.20}};
}
