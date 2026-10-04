import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGeographyIndex} from '../lib/geography-index.ts';
import {buildMapBackground,rangeColor} from '../lib/map-layers.ts';
import {rangeViews} from '../lib/range-time.ts';
import {rangeBoundaryFeatures} from '../lib/range-boundaries.ts';
import {rangeName,rangePeriodCopy,rangeLabelColor} from '../lib/range-copy.ts';
import {rangeLabelOffset} from '../lib/range-labels.ts';
import {ensureRangeStyle} from '../lib/map-layer-style.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const ranges=buildMapBackground(data,buildGeographyIndex(data)).ranges;
const ids=['polity:turgesh','region:semirechye','polity:samarkand','region:samarkand','polity:panch','region:panch','polity:qara-khitai'];
const core=ranges.filter(r=>ids.includes(r.objectId)&&r.geometry);
test('formal collection selects the same overall default in any order and retains explicit research excerpt',()=>{
 for(const input of [core,[...core].reverse()]){
  const views=rangeViews(input,{mode:'all',year:750});assert.deepEqual(views.map(v=>v.objectId).sort(),ids.sort());
  assert.equal(views.find(v=>v.objectId==='polity:turgesh').selected.id,'synthesis:turgesh:foundation:overall:v1');
  assert.ok(views.every(v=>v.visible));
 }
 const excerpt=core.find(r=>r.id.startsWith('bregel:2003:map9:'));
 assert.equal(rangeViews(core,{mode:'all',year:750},{'polity:turgesh':excerpt.id}).find(v=>v.objectId==='polity:turgesh').selected.id,excerpt.id);
 assert.ok(excerpt.coverageEdge);assert.ok(core.find(r=>r.objectId==='polity:qara-khitai').coverageEdge);
});
test('fill closure cannot become a border for a cropped version, even if boundary metadata is missing',()=>{
 const cropped=core.filter(r=>r.coverageEdge);
 for(const r of cropped){assert.deepEqual(rangeBoundaryFeatures([r]).features[0].geometry,r.boundary);assert.equal(rangeBoundaryFeatures([{...r,boundary:undefined}]).features.length,0)}
 const intact=core.find(r=>r.objectId==='region:semirechye');assert.deepEqual(rangeBoundaryFeatures([{...intact,boundary:undefined}]).features[0].geometry,intact.geometry);
});
test('actual fill style has no implicit closed outline; explicit political/context lines remain independent',()=>{
 const sources=new Map(),layers=new Map();const map={getSource:id=>sources.get(id),addSource:(id,s)=>sources.set(id,s),getLayer:id=>layers.get(id),addLayer:l=>layers.set(l.id,l)};
 ensureRangeStyle(map);
 assert.equal(layers.get('history-wash').paint['fill-outline-color'],'rgba(0,0,0,0)');
 assert.equal(layers.get('history-ink').source,'historical-boundaries');assert.equal(layers.get('history-context').source,'historical-boundaries');
 assert.ok([...layers.values()].every(l=>!('line-blur' in l.paint)));
});
test('short trilingual captions preserve core/oasis/partial identities and original time evidence',()=>{
 const before=JSON.stringify(core);
 for(const locale of ['en','zh','ru'])for(const r of core){assert.ok(rangeName(r,locale));assert.ok(rangePeriodCopy(r,locale));assert.notEqual(rangeLabelColor(r.objectId),rangeColor(r.objectId))}
 assert.notEqual(rangeName(core.find(r=>r.objectId==='polity:panch'),'en'),rangeName(core.find(r=>r.objectId==='region:panch'),'en'));
 assert.match(rangeName(core.find(r=>r.objectId==='polity:qara-khitai'),'en'),/partial/);
 assert.equal(rangePeriodCopy(core.find(r=>r.objectId==='polity:qara-khitai'),'en'),'After 1141');assert.equal(JSON.stringify(core),before);
});
test('bounded label placement avoids actual coins and overlays without changing the anchor',()=>{
 const box={left:160,right:240,top:200,bottom:230},viewport={left:0,right:390,top:72,bottom:720},city={left:155,right:250,top:200,bottom:230};
 const first=rangeLabelOffset(box,viewport,[city]);assert.deepEqual(first,[0,-60]);assert.deepEqual(rangeLabelOffset(box,viewport,[city]),first);
 assert.deepEqual(box,{left:160,right:240,top:200,bottom:230});
 assert.equal(rangeLabelOffset(box,viewport,[viewport]),null);
 const edge={left:2,right:82,top:200,bottom:230};assert.ok(rangeLabelOffset(edge,viewport,[])[0]>0);
});
