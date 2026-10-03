import {tr,copyKnown,type Locale,type CopyKey} from './i18n.ts';
import {rangeTimeState,type RangeView} from './range-time.ts';
import type {MapRange} from './map-layers.ts';
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
