import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {semirechyeBackground} from '../lib/semirechye-background.ts';
import {buildMapBackground,defaultLayers,visibleRanges,backgroundLayers,rangeBounds,rangeColor} from '../lib/map-layers.ts';
import {buildGeographyIndex} from '../lib/geography-index.ts';
import {rangeViews,rangeTimeState,assessRangeYear,orderedVersions} from '../lib/range-time.ts';
import {checkRangeIntake} from '../scripts/check-range-intake.mjs';
const d=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));const g=buildGeographyIndex(d),b=buildMapBackground(d,g),r=b.ranges.find(r=>r.objectId==='region:semirechye');
test('registered association and complete data remain frozen; independent from polity',()=>{
 const before=JSON.stringify(d),n=g.nodes.find(n=>n.id===r.objectId);assert.deepEqual(r.familyIds,n.relatedFamilies);assert.equal(r.familyIds.length,17);assert.equal([...g.main].filter(([id,m])=>m.region.includes(r.objectId)).length,513);
 assert.deepEqual([d.families.length,d.variants.length,d.specimens.length,d.specimens.reduce((s,r)=>s+r.images.length,0),d.relatedRecords.length],[56,120,1010,1013,701]);
 const nana=d.specimens.filter(s=>s.familyId==='lady-nana');assert.equal(nana.length,20);assert.equal(nana.reduce((s,r)=>s+r.images.length,0),22);assert.equal(nana.filter(r=>r.id.startsWith('zeno-')).length,14);
 const t=b.ranges.filter(r=>r.objectId==='polity:turgesh');assert.equal(t.length,2);assert.equal(t[0].familyIds.length,6);assert.equal([...g.main].filter(([id,m])=>m.polity.includes('polity:turgesh')).length,239);
 assert.notDeepEqual(r.geometry,t[0].geometry);assert.notEqual(rangeColor(r.objectId),rangeColor(t[0].objectId));assert.equal(JSON.stringify(d),before);
});
test('cross-period context visible at every selected year, never assigned invented dates; unknown stays distinct',()=>{
 assert.equal(rangeTimeState(r),'cross-period');assert.equal(r.start,null);assert.equal(r.end,null);
 for(const year of [-100,700,1141,1500,2026]){const v=rangeViews([r],{mode:'year',year})[0];assert.equal(v.visible,true);assert.equal(v.background,false);assert.equal(assessRangeYear(r,year),'match');}
 assert.equal(rangeViews([r],{mode:'all',year:0})[0].visible,true);
 assert.equal(rangeViews([r],{mode:'unknown',year:0})[0].visible,false);
 assert.match(rangeViews([r],{mode:'unknown',year:0})[0].message,/非年代缺失/);
 assert.equal(rangeViews([r],{mode:'unknown',year:0},{},[r.objectId])[0].background,true);
 for(const p of b.ranges.filter(p=>p.objectId==='polity:turgesh'))assert.equal(assessRangeYear(p,1500),'uncertain');
 const q=b.ranges.find(r=>r.objectId==='polity:qara-khitai');assert.equal(assessRangeYear(q,1141),'no-match');assert.equal(assessRangeYear(q,1150),'uncertain');
 const fake={...r,kind:'polity'};assert.notEqual(rangeTimeState(fake),'cross-period');assert.ok(checkRangeIntake({ranges:[fake]},{objectIds:new Set([fake.objectId]),familyIds:new Set(fake.familyIds)}).some(e=>e.includes('跨时期')));
});
test('traceable whole regional geometry is closed, legal and has no proper self crossing',()=>{
 const c=JSON.parse(readFileSync(new URL('../docs/reviews/T22-8/construction.json',import.meta.url))),ids=new Set(c.sources.map(s=>s.id));for(const s of c.segments){assert.ok(s.sources.every(id=>ids.has(id)));assert.ok(s.method);}
 const ring=r.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));assert.ok(ring.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x)<=180&&Math.abs(y)<=90));
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=1;i<ring.length;i++)for(let j=i+2;j<ring.length;j++){if(i===1&&j===ring.length-1)continue;assert.ok(!(cross(ring[i-1],ring[i],ring[j-1])*cross(ring[i-1],ring[i],ring[j])<0&&cross(ring[j-1],ring[j],ring[i-1])*cross(ring[j-1],ring[j],ring[i])<0));}
 assert.equal(r.coverageEdge,undefined);assert.equal(r.coverage.extent,'complete');assert.ok(rangeBounds([r]));
});
test('context layer, stable default, family temporary background and polity coexist independently',()=>{
 assert.equal(visibleRanges(b,defaultLayers,{mode:'all',year:0}).length,0);
 const settings={...defaultLayers,context:true,polities:true};const shown=visibleRanges(b,settings,{mode:'all',year:0});assert.ok(shown.some(s=>s.id===r.id));assert.ok(shown.some(s=>s.objectId==='polity:turgesh'));
 assert.ok(backgroundLayers(b,'sr6').context);assert.equal(visibleRanges(b,{...settings,context:false},{mode:'all',year:0}).some(s=>s.id===r.id),false);
 const alternate={...r,id:'fixture:alternate',defaultPriority:0};for(const a of [[r,alternate],[alternate,r]])assert.equal(orderedVersions(a)[0].id,r.id);
});
