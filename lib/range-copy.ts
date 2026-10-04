import {tr,copyKnown,type Locale,type CopyKey} from './i18n.ts';
import {rangeTimeState,type RangeView} from './range-time.ts';
import {rangeColor,type MapRange} from './map-layers.ts';
/** Display adapters only: preserve raw source wording and all range assessments. */
export function timeCopy(r:MapRange,locale:Locale){
 const keys:Record<ReturnType<typeof rangeTimeState>,CopyKey>={'cross-period':'跨时期定义',bounded:'时间区间',lower:'时间下界',upper:'时间上界',unknown:'时间未定',invalid:'时间异常'};
 const dates=r.periodText||(r.start!=null&&r.end!=null?`${r.start}–${r.end}`:r.start!=null?`${r.start}`:r.end!=null?`${r.end}`:tr('范围时期未记录',locale));
 return `${dates} · ${tr(keys[rangeTimeState(r)],locale)}`;
}
export function spaceCopy(r:MapRange,locale:Locale){
 const meanings={polity:'政权范围',core:'本部范围',dependency:'附属范围',influence:'影响范围',region:'地域背景','local-system':'地方体系范围',circulation:'钱币流通范围',unknown:'空间含义未记录'} as const;
 const partial=r.coverage?.extent==='partial'||!!r.coverageEdge;
 return `${tr(meanings[r.spatialMeaning||'unknown'],locale)} · ${tr(partial?'部分覆盖':r.coverage?.extent==='complete'?'完整资料版本':'覆盖未知',locale)}${r.coverage?.note?' · '+r.coverage.note:''}`;
}
export function rangeMessage(v:RangeView,locale:Locale){return v.message.split('；').map(part=>{const dated=part.match(/^(\d+)年：(.*)$/);return dated?`${dated[1]}: ${copyKnown(dated[2],locale)}`:copyKnown(part,locale)}).join(' · ')}

/** Core-version captions are display-only; original time/source evidence stays on MapRange. */
const captions:Record<string,{name:CopyKey;period:CopyKey}>={
 'synthesis:turgesh:foundation:overall:v1':{name:'突骑施',period:'约700年前后'},
 'bregel:2003:map9:turgesh:first-half-8c:excerpt':{name:'突骑施｜南侧研究摘录',period:'8世纪上半叶'},
 'synthesis:semirechye:core-chu:v1':{name:'七河',period:'跨时期定义'},
 'synthesis:samarkand:core-c7:v1':{name:'康国／撒马尔罕｜本部',period:'7世纪后半叶'},
 'synthesis:samarkand:four-doabs:v1':{name:'撒马尔罕绿洲',period:'跨时期定义'},
 'synthesis:panch:core-early-c8:v1':{name:'潘治｜本部',period:'7世纪末—8世纪初'},
 'synthesis:panch:local-oasis:v1':{name:'潘治绿洲',period:'跨时期定义'},
 'bregel:2003:map15:qara-khitai:after-1141:excerpt':{name:'西辽｜局部范围',period:'1141年后'},
};
export function rangeName(r:MapRange,locale?:Locale,fallback=''){return captions[r.id]?tr(captions[r.id].name,locale):fallback||r.title}
export function rangePeriodCopy(r:MapRange,locale?:Locale){return captions[r.id]?tr(captions[r.id].period,locale):r.periodText?.split(/[（(]/)[0].trim()||tr('范围时期未记录',locale)}
export function rangeLabelColor(objectId:string){return '#'+rangeColor(objectId).slice(1).match(/../g)!.map(v=>Math.round(parseInt(v,16)*.55).toString(16).padStart(2,'0')).join('')}
