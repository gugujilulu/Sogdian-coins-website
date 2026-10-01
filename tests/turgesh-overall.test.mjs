import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {turgeshOverall} from '../lib/turgesh-overall.ts';
import {turgeshSample} from '../lib/turgesh-sample.ts';
import {orderedVersions,rangeViews} from '../lib/range-time.ts';
const overall=turgeshOverall(['sr6']),excerpt=turgeshSample(['sr6']);
test('explicit priority chooses overall regardless of order; research excerpt remains selectable',()=>{
 for(const ranges of [[overall,excerpt],[excerpt,overall]]){
  assert.equal(orderedVersions(ranges)[0].id,overall.id);
  assert.equal(rangeViews(ranges,{mode:'all',year:700})[0].selected.id,overall.id);
  assert.equal(rangeViews(ranges,{mode:'all',year:700},{'polity:turgesh':excerpt.id})[0].selected.id,excerpt.id);
 }
 assert.notEqual(overall.id,excerpt.id);assert.equal(overall.objectId,excerpt.objectId);
});
test('overall construction has traceable segment sources, closed legal noncrossing geometry and no artificial crop',()=>{
 const source=JSON.parse(readFileSync(new URL('../docs/reviews/T22-4/overall-construction.json',import.meta.url)));
 const ids=new Set(source.sources.map(s=>s.id));
 for(const s of source.segments){assert.ok(s.sources.every(id=>ids.has(id)));assert.ok(s.meaning);assert.ok(s.method);}
 const ring=overall.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));
 assert.ok(ring.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x)<=180&&Math.abs(y)<=90));
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=1;i<ring.length;i++)for(let j=i+2;j<ring.length;j++){
  if(i===1&&j===ring.length-1)continue;
  assert.ok(!(cross(ring[i-1],ring[i],ring[j-1])*cross(ring[i-1],ring[i],ring[j])<0&&cross(ring[j-1],ring[j],ring[i-1])*cross(ring[j-1],ring[j],ring[i])<0));
 }
 assert.equal(overall.coverageEdge,undefined);assert.equal(overall.coverage.extent,'complete');
 assert.match(overall.note,/综合概括/);assert.equal(overall.precision,'approximate');
});
test('general stage never becomes exact numeric annual match; active background and unknown mode work',()=>{
 for(const year of [699,700,706,730,1200]){
  const v=rangeViews([overall],{mode:'year',year})[0];assert.equal(v.assessment,'uncertain');assert.equal(v.visible,false);
  assert.equal(rangeViews([overall],{mode:'year',year},{},[overall.objectId])[0].background,true);
 }
 assert.equal(rangeViews([overall],{mode:'unknown',year:700})[0].visible,true);
});
