import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalVisibleRanges} from '../lib/range-linking.ts';
import {historicalRangeViews} from '../lib/range-time.ts';
import {defaultLayers} from '../lib/map-layers.ts';
import {panchCore,panchOasis} from '../lib/panch-ranges.ts';
import {rangeBoundaryFeatures} from '../lib/range-boundaries.ts';
const a=panchCore(['family']),b={...a,id:'other',objectId:'other',familyIds:['family']};
const background={places:[],ranges:[a,b,panchOasis(['family'])]},layers={...defaultLayers,polities:true},all={mode:'all',year:750};
test('basemap gates all polity features even for explicit backgrounds',()=>{
 for(const base of ['terrain','topographic'])assert.deepEqual(historicalVisibleRanges(background,layers,all,base,a.objectId,{},[a.objectId],'family'),[]);
 assert.equal(historicalVisibleRanges(background,layers,all,'historical',a.objectId).length,2);
});
test('global set is independent of current range and supports multiple associated polities',()=>{
 const shown=historicalVisibleRanges(background,layers,all,'historical',a.objectId,{},[],'family');
 assert.equal(shown.length,2);assert.ok(shown.every(r=>r.presentation.highlighted));
 assert.ok(historicalVisibleRanges(background,layers,all,'historical').every(r=>!r.presentation.highlighted));
 assert.deepEqual(historicalVisibleRanges(background,{...layers,polities:false},all,'historical',a.objectId,{},[],'family'),[]);
 assert.equal(shown[0].geometry,a.geometry);assert.equal(rangeBoundaryFeatures(shown).features[0].properties.highlighted,true);
});
test('year picks matching version per polity even when explicit default does not match',()=>{
 const older={...a,id:'older',start:600,end:700,defaultPriority:0},newer={...a,id:'newer',start:701,end:800,defaultPriority:2};
 const second={...b,start:600,end:700};const ranges=[newer,second,older];
 const views=historicalRangeViews(ranges,{mode:'year',year:650},{[a.objectId]:'newer'},[a.objectId]);
 assert.equal(views.find(v=>v.objectId===a.objectId).selected.id,'older');assert.ok(views.every(v=>v.visible));
 assert.equal(historicalRangeViews(ranges,all).find(v=>v.objectId===a.objectId).selected.id,'newer');
 assert.deepEqual(historicalRangeViews([...ranges].reverse(),all).map(v=>v.selected.id),historicalRangeViews(ranges,all).map(v=>v.selected.id));
});
test('uncertain version cannot displace matching version; unknown state follows range dates',()=>{
 const dated={...a,id:'dated',start:700,end:800,defaultPriority:0},unknown={...a,id:'unknown',start:null,end:null,defaultPriority:3};
 assert.equal(historicalRangeViews([unknown,dated],{mode:'year',year:750},{},[a.objectId])[0].selected.id,'dated');
 assert.equal(historicalRangeViews([dated,unknown],{mode:'unknown',year:750})[0].selected.id,'unknown');
 assert.equal(historicalRangeViews([dated],{mode:'unknown',year:750})[0].visible,false);
});
