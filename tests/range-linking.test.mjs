import test from 'node:test';
import assert from 'node:assert/strict';
import {familyRangeObject,linkRangeLayers,linkedVisibleRanges} from '../lib/range-linking.ts';
import {defaultLayers} from '../lib/map-layers.ts';
import {qaraKhitaiSample} from '../lib/qara-khitai-sample.ts';
import {semirechyeBackground} from '../lib/semirechye-background.ts';
import {panchCore,panchOasis} from '../lib/panch-ranges.ts';
import {updateRangeSelection} from '../lib/range-time.ts';
import {searchNavigationQueue} from '../lib/search-map-navigation.ts';
const polity=panchCore(['a']),region=panchOasis(['a']),all={mode:'all',year:750};
const background={places:[],ranges:[region,polity]};
test('single object auto-links and draws through the same enabled layer state',()=>{
 const object=familyRangeObject([polity],'a');assert.equal(object,polity.objectId);
 const layers=linkRangeLayers({...defaultLayers,polities:true},polity);
 assert.deepEqual(linkedVisibleRanges(background,layers,all,object).map(r=>r.id),[polity.id]);
});
test('multiple objects prefer existing polity geometry, retain explicit valid choice and ignore array order',()=>{
 assert.equal(familyRangeObject([region,polity],'a'),polity.objectId);
 assert.equal(familyRangeObject([polity,region],'a'),polity.objectId);
 assert.equal(familyRangeObject([polity,region],'a',region.objectId),region.objectId);
 assert.equal(familyRangeObject([region],'a','unrelated'),region.objectId);
 const unbuilt={...polity,geometry:undefined};assert.equal(familyRangeObject([unbuilt,region],'a'),region.objectId);
 assert.equal(familyRangeObject([unbuilt],'a'),polity.objectId);
 assert.deepEqual(linkedVisibleRanges({places:[],ranges:[unbuilt]},{...defaultLayers,polities:true},all,polity.objectId),[]);
});
test('closed layers stay closed on linking; one explicit show updates the same state',()=>{
 assert.equal(linkRangeLayers(defaultLayers,polity),defaultLayers);
 assert.equal(linkedVisibleRanges(background,defaultLayers,all,polity.objectId).length,0);
 const shown=linkRangeLayers(defaultLayers,polity,true);assert.equal(shown.polities,true);
 assert.equal(linkedVisibleRanges(background,shown,all,polity.objectId).length,1);
 assert.equal(linkRangeLayers(defaultLayers,{...polity,geometry:undefined},true),defaultLayers);
 const switched=linkRangeLayers(shown,region);assert.equal(switched.context,true);
 assert.deepEqual(linkedVisibleRanges(background,switched,all,region.objectId).map(r=>r.id),[region.id]);
});
test('unknown bounds are never bypassed by linking; voluntary background follows existing clearing rules',()=>{
 const sample=qaraKhitaiSample(['a']),b={places:[],ranges:[sample]},layers={...defaultLayers,polities:true};
 for(const year of [1140,1141,2026])assert.equal(linkedVisibleRanges(b,layers,{mode:'year',year},sample.objectId).length,0);
 assert.equal(linkedVisibleRanges(b,layers,{mode:'year',year:2026},sample.objectId,{},[sample.objectId]).length,1);
 const state={context:'all',versions:{},backgrounds:[sample.objectId]};assert.deepEqual(updateRangeSelection(state,'year',{type:'context'}).backgrounds,[]);
});
test('cross-period regional definition and explicit versions retain their independent time rules',()=>{
 const region=semirechyeBackground(['a']),b={places:[],ranges:[region]},layers={...defaultLayers,context:true};
 assert.equal(linkedVisibleRanges(b,layers,{mode:'year',year:1500},region.objectId).length,1);
 assert.equal(linkedVisibleRanges(b,layers,{mode:'unknown',year:1500},region.objectId).length,0);
 const older={...polity,id:'older',start:600,end:700,defaultPriority:0};
 const newer={...polity,id:'newer',start:701,end:800,defaultPriority:1};
 const versions={places:[],ranges:[older,newer]},s={...defaultLayers,polities:true};
 assert.equal(linkedVisibleRanges(versions,s,all,polity.objectId)[0].id,'newer');
 assert.equal(linkedVisibleRanges(versions,s,{mode:'year',year:750},polity.objectId,{[polity.objectId]:'older'}).length,0);
});
test('explicit range navigation cancels a pending search before readiness, without replay',()=>{
 const moves=[],queue=searchNavigationQueue(r=>moves.push(r.serial));queue.offer({serial:1});queue.cancel();queue.setReady(true);assert.deepEqual(moves,[]);
 queue.offer({serial:2});assert.deepEqual(moves,[2]);queue.cancel();queue.setReady(false);queue.setReady(true);assert.deepEqual(moves,[2]);queue.dispose();
});
