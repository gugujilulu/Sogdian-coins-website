import type {MapRange,MapTime} from './map-layers';
export type RangeTimeState='bounded'|'lower'|'upper'|'unknown'|'invalid';
export type YearAssessment='match'|'no-match'|'uncertain';
export type RangeView={objectId:string;choices:MapRange[];selected?:MapRange;assessment:YearAssessment;message:string;visible:boolean;background:boolean};
export function rangeTimeState(r:MapRange):RangeTimeState{
 const start=r.start,end=r.end;
 if((start!=null&&!Number.isFinite(start))||(end!=null&&!Number.isFinite(end))||(start!=null&&end!=null&&start>end))return 'invalid';
 return start!=null&&end!=null?'bounded':start!=null?'lower':end!=null?'upper':'unknown';
}
export function assessRangeYear(r:MapRange,year:number):YearAssessment{
 if(!Number.isFinite(year)||rangeTimeState(r)==='invalid')return 'uncertain';
 if(r.start!=null&&(year<r.start||(year===r.start&&r.timeEvidence?.startInclusive===false)))return 'no-match';
 if(r.end!=null&&(year>r.end||(year===r.end&&r.timeEvidence?.endInclusive===false)))return 'no-match';
 return rangeTimeState(r)==='bounded'?'match':'uncertain';
}
export function rangeTimeDescription(r:MapRange){
 const state=rangeTimeState(r),raw=r.periodText?.trim();
 const fallback=state==='bounded'?`${r.start}–${r.end}年`:state==='lower'?`${r.start}年${r.timeEvidence?.startInclusive===false?'之后':'起'}`:state==='upper'?`${r.end}年${r.timeEvidence?.endInclusive===false?'之前':'及以前'}`:'适用时期未记录';
 const detail={bounded:'起止已知',lower:'下界已知，上界未知；不能推定持续有效',upper:'上界已知，下界未知；不能推定此前持续有效',unknown:'年代完全未知',invalid:'年代数据异常，不能计算匹配'}[state];
 return `${raw||fallback} · ${detail}`;
}
export function rangeSpaceDescription(r:MapRange){
 const meaning={polity:'政权范围','local-system':'地方体系范围',region:'地域背景',core:'本部范围',dependency:'附属范围',influence:'影响范围',circulation:'钱币流通范围',unknown:'空间含义未记录'};
 const semantic=r.spatialMeaning?meaning[r.spatialMeaning]:(r.kind==='polity'?'政权范围（本部／附属等含义未记录）':r.kind==='context'?'地域背景':'钱币流通范围');
 const partial=r.coverage?.extent==='partial'||!!r.coverageEdge;
 return `${semantic} · ${partial?'局部范围':r.coverage?.extent==='complete'?'该资料版本完整范围':'覆盖完整性未记录'}${partial?`；${r.coverage?.note||'原图裁切，未覆盖部分保留未知；资料覆盖边缘不是国界'}`:''}`;
}
export function orderedVersions(ranges:MapRange[]){return [...ranges].sort((a,b)=>(b.defaultPriority||0)-(a.defaultPriority||0)||Number(!!b.geometry)-Number(!!a.geometry)||(Number.isFinite(a.start)?a.start??Infinity:Infinity)-(Number.isFinite(b.start)?b.start??Infinity:Infinity)||(a.id<b.id?-1:a.id>b.id?1:0))}
export function rangeViews(ranges:MapRange[],time:MapTime,versions:Record<string,string>={},backgrounds:string[]=[]):RangeView[]{
 const objects=[...new Set(ranges.map(r=>r.objectId))].sort();
 return objects.map(objectId=>{
  const choices=orderedVersions(ranges.filter(r=>r.objectId===objectId)),explicit=versions[objectId];
  const selected=explicit?choices.find(r=>r.id===explicit):choices[0];
  if(!selected)return{objectId,choices,assessment:'uncertain',message:'所选范围版本不存在；请明确选择已有版本',visible:false,background:false};
  const assessment=assessRangeYear(selected,time.year),state=rangeTimeState(selected);
  const allowed=time.mode==='all'||(time.mode==='unknown'?['lower','upper','unknown'].includes(state):assessment==='match');
  const background=!allowed&&backgrounds.includes(objectId)&&!!selected.geometry;
  const message=!selected.geometry?'范围待补；对象与来源入口保留':time.mode==='all'?'显示所选版本':time.mode==='unknown'?(allowed?'范围年代待定':'该范围起止已知，不属于年代未知'):assessment==='match'?`${time.year}年：所选版本明确匹配`:assessment==='no-match'?`${time.year}年：所选版本明确不匹配`:`${time.year}年：该年范围待定`;
  const alternatives=time.mode==='year'&&!allowed&&choices.some(r=>r.geometry&&assessRangeYear(r,time.year)==='match')?'；其他版本有明确匹配，请主动选择（不会自动换期）':'';
  return{objectId,choices,selected,assessment,message:message+alternatives+(background?'；历史背景':''),visible:!!selected.geometry&&(allowed||background),background};
 });
}
export type RangeSelection={context:string;versions:Record<string,string>;backgrounds:string[]};
export type RangeAction={type:'version';objectId:string;id:string}|{type:'background';objectId:string;enabled:boolean}|{type:'context'};
export function updateRangeSelection(state:RangeSelection,context:string,action:RangeAction):RangeSelection{
 const current=state.context===context?state:{...state,context,backgrounds:[]};
 if(action.type==='context')return current;
 if(action.type==='version')return{...current,versions:{...current.versions,[action.objectId]:action.id},backgrounds:[]};
 return{...current,backgrounds:action.enabled?[...new Set([...current.backgrounds,action.objectId])]:current.backgrounds.filter(id=>id!==action.objectId)};
}
