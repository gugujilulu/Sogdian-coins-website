import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {buildGeographyIndex} from '../lib/geography-index.ts';
import {buildMapBackground} from '../lib/map-layers.ts';
import {rangeTimeState,isCrossPeriodRegion} from '../lib/range-time.ts';

/** Structural intake checks only; not validation of historical accuracy. */
export function checkRangeIntake(background,{objectIds,familyIds}) {
 const errors=[], seen=new Set();
 const issue=(r,message)=>errors.push(`${r.id}: ${message}`);
 const point=p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
 const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 if(background.demo) errors.push('演示集合不能进入正式范围集合');
 for(const r of background.ranges){
  if(!r.id||seen.has(r.id)) issue(r,'范围版本ID缺失或重复');
  seen.add(r.id);
  if(r.id?.startsWith('demo:')||r.objectId?.startsWith('demo:')) issue(r,'演示身份进入正式集合');
  if(!objectIds.has(r.objectId)) issue(r,'建设对象引用不存在');
  for(const id of r.familyIds) if(!familyIds.has(id)) issue(r,`家族引用不存在：${id}`);
  if(!r.source?.trim()) issue(r,'来源/待解析登记说明缺失');
  if(r.timeApplicability&&!isCrossPeriodRegion(r)) issue(r,'跨时期仅用于无数字端点的明确地域背景');
  if(rangeTimeState(r)==='invalid') issue(r,'年代非法或倒置');
  if((r.start===null||r.end===null)&&r.geometry&&!r.periodText?.trim()) issue(r,'不完整年代缺少原文或未知说明');
  if(r.precision==='undrawn'&&r.geometry) issue(r,'待绘状态与几何冲突');
  if(!r.geometry&&r.precision!=='undrawn') issue(r,'无几何须明确待绘状态');
  if(r.geometry){
   if(!['Polygon','MultiPolygon'].includes(r.geometry.type)) issue(r,'不支持的填色几何');
   else {
    const polygons=r.geometry.type==='Polygon'?[r.geometry.coordinates]:r.geometry.coordinates;
    if(!polygons.length) issue(r,'空填色几何');
    for(const polygon of polygons){
     if(!polygon.length) issue(r,'空polygon');
     for(const ring of polygon) if(ring.length<4||!ring.every(point)||!same(ring[0],ring.at(-1))) issue(r,'polygon坐标非法或未闭合');
    }
   }
  }
  if(r.label&&!point(r.label)) issue(r,'标签坐标非法');
  if(r.coverage?.extent==='partial'||r.coverageEdge){
   if(!r.coverage?.note?.trim()) issue(r,'局部/裁切说明缺失');
  }
  if(r.boundary) for(const line of r.boundary.coordinates) if(line.length<2||!line.every(point)) issue(r,'政治边界坐标非法');
  if(r.coverageEdge){
   const seam=r.coverageEdge.coordinates;
   if(seam.length<2||!seam.every(point)) issue(r,'资料边缘坐标非法');
   if(!r.boundary) issue(r,'裁切填色必须提供独立政治边界，不能回退到polygon轮廓');
   else for(const line of r.boundary.coordinates) for(let i=1;i<line.length;i++) for(let j=1;j<seam.length;j++){
    if((same(line[i-1],seam[j-1])&&same(line[i],seam[j]))||(same(line[i],seam[j-1])&&same(line[i-1],seam[j]))) issue(r,'资料闭合边进入政治边界');
   }
  }
 }
 return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
 const geo=buildGeographyIndex(data), background=buildMapBackground(data,geo);
 const errors=checkRangeIntake(background,{objectIds:new Set([...geo.nodes.map(n=>n.id),...data.areas.map(a=>`area:${a.id}`)]),familyIds:new Set(data.families.map(f=>f.id))});
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log(`范围接入结构通过：${background.ranges.length}版本，${background.ranges.filter(r=>r.geometry).length}有几何；待建及未知状态保留。`);
}
