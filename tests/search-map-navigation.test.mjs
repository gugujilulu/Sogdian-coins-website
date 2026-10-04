import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchMapTarget,searchBounds,searchMapPadding,searchNavigationQueue,searchEnter} from '../lib/search-map-navigation.ts';
import {filterAtlasRecords} from '../lib/record-filters.ts';
import {coinPlaces} from '../lib/coin-map.ts';
import {durationFor} from '../lib/motion.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
test('real matching records and source constraints supply the same map anchors as coin display',()=>{
 const result=filterAtlasRecords(data,{query:'Lady Nana',sources:['Bactrianumis']}),target=searchMapTarget(data,result.records);
 assert.ok(result.records.length>0);assert.equal(target.kind,'single');assert.deepEqual(target.placeIds,['panjakent']);
 assert.deepEqual(target.coordinates,coinPlaces(result.families,result.records,data.places).map(g=>g.place.coordinates));
 assert.equal(target.recordCount,result.records.length);assert.equal(target.unlocatedRecords,0);
 assert.deepEqual(searchBounds(target),[target.coordinates[0],target.coordinates[0]]);
});
const fixture={families:[{id:'a',anchor:{placeId:'one'}},{id:'b',anchor:{placeId:'two'}},{id:'c',anchor:null}],places:[{id:'one',coordinates:[70,40]},{id:'two',coordinates:[70,40]}]};
const records=[{id:'1',familyId:'a'},{id:'2',familyId:'b'},{id:'3',familyId:'c'}];
test('coincident coordinates deduplicate navigation only; place identities and mixed missing records remain',()=>{
 const target=searchMapTarget(fixture,[...records,records[0]]);assert.equal(target.kind,'single');assert.deepEqual(target.placeIds,['one','two']);assert.equal(target.recordCount,3);assert.equal(target.unlocatedRecords,1);
 const multi=searchMapTarget({...fixture,places:[fixture.places[0],{id:'two',coordinates:[74,42]}]},records);assert.equal(multi.kind,'multiple');assert.deepEqual(searchBounds(multi),[[70,40],[74,42]]);
});
test('no results and unlocated or illegal coordinates never create a camera target',()=>{
 assert.equal(searchMapTarget(fixture,[]).kind,'none');const missing=searchMapTarget(fixture,[records[2]]);assert.equal(missing.kind,'unlocated');assert.equal(searchBounds(missing),null);
 const invalid=searchMapTarget({...fixture,places:[{id:'one',coordinates:[NaN,40]}]},[records[0]]);assert.equal(invalid.unlocatedRecords,1);assert.equal(searchBounds(invalid),null);
});
test('latest explicit request queues once, does not replay on readiness or after consumption, and cleans up',()=>{
 const seen=[],queue=searchNavigationQueue(r=>seen.push(r.serial)),request=serial=>({serial,target:searchMapTarget(fixture,records)});
 queue.offer(request(1));queue.offer(request(2));assert.deepEqual(seen,[]);queue.setReady(true);assert.deepEqual(seen,[2]);
 queue.offer(request(1));queue.offer(request(2));queue.setReady(false);queue.setReady(true);assert.deepEqual(seen,[2]);
 queue.offer(request(3));queue.offer(request(4));assert.deepEqual(seen,[2,3,4]);queue.setReady(false);queue.offer(request(5));queue.dispose();queue.setReady(true);assert.deepEqual(seen,[2,3,4]);
});
test('Enter submits except during IME composition; editing and other keys do not submit',()=>{
 assert.ok(searchEnter('Enter'));assert.ok(!searchEnter('Enter',true));assert.ok(!searchEnter('Enter',false,229));for(const key of ['a','Backspace','Escape'])assert.ok(!searchEnter(key));
});
test('actual phone sheet and controls leave valid camera padding; desktop side panel and short screens stay bounded',()=>{
 const obstacles=[{left:12,right:314,top:12,bottom:66},{left:338,right:378,top:12,bottom:194},{left:0,right:390,top:399,bottom:796}];
 const padding=searchMapPadding(390,796,obstacles);assert.ok(padding);assert.ok(padding.bottom>=409);assert.ok(padding.left+padding.right<350);assert.ok(padding.top+padding.bottom<756);
 const point={x:(padding.left+390-padding.right)/2,y:(padding.top+796-padding.bottom)/2};for(const b of obstacles)assert.ok(point.x<b.left||point.x>b.right||point.y<b.top||point.y>b.bottom);
 const desktop=searchMapPadding(1280,702,[{left:852,right:1280,top:0,bottom:702},{left:12,right:462,top:12,bottom:200}]);assert.ok(1280-desktop.right<852);
 const short=searchMapPadding(360,400,[{left:0,right:360,top:200,bottom:400}]);assert.ok(short.top+short.bottom<400);
 assert.equal(searchMapPadding(390,796,[{left:0,right:390,top:0,bottom:796}]),null);
 assert.equal(durationFor(550,true),0);assert.equal(durationFor(550,false),550);
});
