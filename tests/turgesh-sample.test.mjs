import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGeographyIndex} from '../lib/geography-index.ts';
import {buildMapBackground,rangeBounds} from '../lib/map-layers.ts';
import {turgeshSample} from '../lib/turgesh-sample.ts';
import {assessRangeYear} from '../lib/range-time.ts';
import {checkRangeIntake} from '../scripts/check-range-intake.mjs';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const geo=buildGeographyIndex(data),bg=buildMapBackground(data,geo),sample=bg.ranges.find(r=>r.id==='bregel:2003:map9:turgesh:first-half-8c:excerpt');
test('stable Turgesh version reuses frozen 239 record association and keeps Qara Khitai',()=>{
 assert.equal(sample.id,'bregel:2003:map9:turgesh:first-half-8c:excerpt');
 assert.equal([...geo.main.values()].filter(m=>m.polity?.includes('polity:turgesh')).length,239);
 assert.equal(sample.familyIds.length,6);
 assert.deepEqual(sample.familyIds,geo.nodes.find(n=>n.id==='polity:turgesh').relatedFamilies);
 assert.equal(bg.ranges.filter(r=>r.objectId==='polity:turgesh').length,2);
 assert.ok(bg.ranges.find(r=>r.objectId==='polity:qara-khitai').geometry);
 assert.deepEqual(checkRangeIntake(bg,{objectIds:new Set([...geo.nodes.map(n=>n.id),...data.areas.map(a=>`area:${a.id}`)]),familyIds:new Set(data.families.map(f=>f.id))}),[]);
});
test('local open border excerpt remains traceable and year cannot confirm multi-date map',()=>{
 assert.match(sample.source,/第9图/);assert.match(sample.periodText,/多时点/);assert.equal(sample.start,null);assert.equal(sample.end,null);
 for(const year of [700,714,730,750,1200])assert.equal(assessRangeYear(sample,year),'uncertain');
 assert.equal(sample.coverage.extent,'partial');assert.match(sample.coverage.note,/北侧/);assert.equal(sample.spatialMeaning,'polity');assert.ok(rangeBounds([sample]));
});
test('closed fill is valid and no closure enters political boundary',()=>{
 const ring=sample.geometry.coordinates[0],seam=sample.coverageEdge.coordinates;
 assert.deepEqual(ring[0],ring.at(-1));assert.ok(ring.every(p=>p.every(Number.isFinite)));
 for(const line of sample.boundary.coordinates)for(let i=1;i<line.length;i++)for(let j=1;j<seam.length;j++)assert.notDeepEqual([line[i-1],line[i]],[seam[j-1],seam[j]]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=1;i<ring.length;i++)for(let j=i+2;j<ring.length;j++){
  if(i===1&&j===ring.length-1)continue;
  const a=ring[i-1],b=ring[i],c=ring[j-1],d=ring[j];assert.ok(!(cross(a,b,c)*cross(a,b,d)<-1e-15&&cross(c,d,a)*cross(c,d,b)<-1e-15));
 }
});
