import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {buildGeographyIndex} from '../lib/geography-index.ts';
import {buildMapBackground,defaultLayers,visibleRanges,rangeColor,rangeBounds,rangeFocusMaxZoom,backgroundLayers} from '../lib/map-layers.ts';
import {rangeViews,assessRangeYear,orderedVersions,updateRangeSelection} from '../lib/range-time.ts';
import {checkRangeIntake} from '../scripts/check-range-intake.mjs';
const d=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url))),g=buildGeographyIndex(d),b=buildMapBackground(d,g);
const p=b.ranges.find(r=>r.objectId==='polity:panch'),r=b.ranges.find(r=>r.objectId==='region:panch');
test('two independent source versions reuse frozen references without expanding or reclassifying coins',()=>{
 for(const [v,dim,families,count] of [[p,'polity',4,35],[r,'region',4,29]]){
  assert.deepEqual(v.familyIds,g.nodes.find(n=>n.id===v.objectId).relatedFamilies);assert.equal(v.familyIds.length,families);
  assert.equal([...g.main.values()].filter(m=>m[dim].includes(v.objectId)).length,count);
  assert.equal(b.ranges.filter(x=>x.objectId===v.objectId).length,1);assert.ok(v.source.includes('https://'));assert.ok(rangeBounds([v]));
 }
 assert.equal(rangeFocusMaxZoom(rangeBounds([p])),11);assert.equal(rangeFocusMaxZoom([[66,39],[68,40]]),8);assert.equal(p.kind,'polity');assert.equal(p.spatialMeaning,'core');assert.equal(p.coverage.extent,'partial');assert.equal(r.kind,'context');assert.equal(r.spatialMeaning,'region');
 assert.notDeepEqual(p.geometry,r.geometry);assert.ok(b.ranges.find(x=>x.objectId==='polity:samarkand').geometry);assert.ok(b.ranges.find(x=>x.objectId==='region:samarkand').geometry);assert.notEqual(rangeColor(p.objectId),rangeColor(r.objectId));assert.equal(p.familyIds.includes('lady-nana'),true);assert.equal(r.familyIds.includes('lady-nana'),true);
 assert.deepEqual([d.families.length,d.variants.length,d.specimens.length,d.specimens.reduce((n,s)=>n+s.images.length,0),d.relatedRecords.length],[56,120,1010,1013,701]);
 const nana=d.specimens.filter(s=>s.familyId==='lady-nana');assert.deepEqual([nana.length,nana.reduce((n,s)=>n+s.images.length,0),nana.filter(s=>s.id.startsWith('zeno-')).length],[20,22,14]);
 assert.equal(g.nodes.find(n=>n.id==='region:semirechye').relatedFamilies.length,17);assert.equal(b.ranges.filter(x=>x.objectId==='polity:turgesh').length,2);assert.ok(b.ranges.find(x=>x.objectId==='polity:qara-khitai').coverageEdge);
});
test('source calibration and inferred political segments remain explicit; valid closed rings do not cross',()=>{
 const c=JSON.parse(readFileSync(new URL('../docs/reviews/T22-18/construction.json',import.meta.url)));const ids=new Set(c.sources.map(s=>s.id));
 assert.equal(c.calibration.controls.length,2);assert.ok(c.versions.every(v=>v.sources.every(id=>ids.has(id))));assert.match(c.method,/NOT a traced/);
 for(const v of [p,r]){const ring=v.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));assert.ok(ring.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x)<=180&&Math.abs(y)<=90));
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for(let i=1;i<ring.length;i++)for(let j=i+2;j<ring.length;j++){if(i===1&&j===ring.length-1)continue;assert.ok(!(cross(ring[i-1],ring[i],ring[j-1])*cross(ring[i-1],ring[i],ring[j])<0&&cross(ring[j-1],ring[j],ring[i-1])*cross(ring[j-1],ring[j],ring[i])<0),`${v.id}: ${i},${j}`);}
  assert.equal(v.coverageEdge,undefined);assert.ok(v.boundary);assert.ok(v.coverage.note);
 }
 assert.deepEqual(checkRangeIntake(b,{objectIds:new Set([...g.nodes.map(n=>n.id),...d.areas.map(a=>`area:${a.id}`)]),familyIds:new Set(d.families.map(f=>f.id))}),[]);
});
test('general polity stage is not an annual interval; cross-period oasis keeps T22-8 semantics',()=>{
 assert.equal(p.start,null);assert.equal(p.end,null);assert.match(p.periodText,/7世纪末—8世纪初/);
 for(const year of [660,750,1150]){assert.equal(assessRangeYear(p,year),'uncertain');assert.equal(assessRangeYear(r,year),'match');assert.equal(rangeViews([p],{mode:'year',year})[0].visible,false);assert.equal(rangeViews([p],{mode:'year',year},{},[p.objectId])[0].background,true);}
 assert.equal(rangeViews([p,r],{mode:'all',year:660}).every(v=>v.visible),true);
 assert.equal(rangeViews([r],{mode:'unknown',year:660})[0].visible,false);assert.equal(rangeViews([p],{mode:'unknown',year:660})[0].visible,true);
 const state={context:'year:660',versions:{},backgrounds:[p.objectId]};assert.deepEqual(updateRangeSelection(state,'year:750',{type:'context'}).backgrounds,[]);
 const alt={...p,id:'fixture:alt',defaultPriority:0};for(const a of [[p,alt],[alt,p]])assert.equal(orderedVersions(a)[0].id,p.id);
});
test('global and family entries expose both layers without changing result membership',()=>{
 const s={...defaultLayers,context:true,polities:true};const visible=visibleRanges(b,s,{mode:'all',year:660});assert.ok(visible.some(x=>x.id===p.id));assert.ok(visible.some(x=>x.id===r.id));
 assert.ok(backgroundLayers(b,'lady-nana').context);assert.ok(backgroundLayers(b,'lady-nana').polities);
 assert.equal(visibleRanges(b,{...s,polities:false},{mode:'all',year:660}).some(x=>x.id===p.id),false);
 assert.equal(visibleRanges(b,{...s,context:false},{mode:'all',year:660}).some(x=>x.id===r.id),false);
});
