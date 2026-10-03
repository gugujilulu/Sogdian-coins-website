import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coinPlaces,displayCoins,displayCollectionContext,intersects,uniqueMembers,coinMarkerVisual} from '../lib/coin-map.ts';
import {collectionReturn} from '../lib/map-selection.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const groups=coinPlaces(data.families,data.specimens,data.places),city=groups.find(g=>g.place.id==='suyab');
const input=(g,extra={})=>({zoom:9,width:1280,height:800,labels:[],entries:[{key:'p'+g.place.id,coords:g.place.coordinates,point:{x:640,y:400},groups:[g],cluster:false,id:0}],...extra});
const ids=result=>result.flatMap(e=>e.members.map(m=>m.family.id)).sort();
test('near city renders 15 separate family images, keeps context and returns current intersection',()=>{
 const result=displayCoins(input(city));assert.equal(result.length,15);assert.deepEqual(ids(result),city.members.map(m=>m.family.id).sort());
 for(const e of result){assert.equal(e.kind,'family');assert.equal(e.members.length,1);assert.equal(e.representative,e.members[0]);assert.deepEqual(e.coords,city.place.coordinates);assert.equal(e.fullMembers.length,15)}
 for(let i=0;i<result.length;i++)for(let j=i+1;j<result.length;j++)assert.equal(intersects(result[i].bounds,result[j].bounds),false);
 const context=displayCollectionContext(result[7]);assert.deepEqual(context.placeIds,['suyab']);assert.equal(context.familyIds.length,15);
 assert.equal(uniqueMembers(collectionReturn(groups,context).groups).length,15);
 const reduced=[{...city,members:city.members.slice(0,1)}];assert.equal(uniqueMembers(collectionReturn(reduced,context).groups).length,1);
 assert.equal(collectionReturn([],context).groups.length,0);assert.equal(context.familyIds.length,15);
});
test('middle-near-middle cycle and selected family do not reshuffle expanded slots or covers',()=>{
 const before=JSON.stringify(city),middle=displayCoins(input(city,{zoom:8.49})),near=displayCoins(input(city,{zoom:8.5}));
 assert.equal(middle.length,1);assert.equal(middle[0].kind,'collection');assert.equal(near.length,15);
 assert.deepEqual(displayCoins(input(city,{zoom:8.49})),middle);
 assert.deepEqual(displayCoins(input(city,{zoom:8.5,selectedId:city.members[8].family.id})),near);
 const shuffled={...city,members:[...city.members].reverse()};assert.deepEqual(displayCoins(input(shuffled,{zoom:8.5})).map(e=>[e.key,e.offsetX,e.offset,e.representative.image?.id]),near.map(e=>[e.key,e.offsetX,e.offset,e.representative.image?.id]));
 assert.equal(JSON.stringify(city),before);
});
test('source constrained multi, single, zero and missing photos stay operable',()=>{
 const matched=data.specimens.filter(r=>r.familyId.startsWith('sr')&&r.sources.some(s=>s.url.includes('zeno.ru')));
 const subset=coinPlaces(data.families,matched,data.places,i=>i.sourceName==='Zeno').find(g=>g.place.id==='suyab');
 assert.ok(subset.members.length>1);for(const e of displayCoins(input(subset)))assert.equal(e.representative.image.sourceName,'Zeno');
 const one={...subset,members:subset.members.slice(0,1)};assert.equal(displayCoins(input(one)).length,1);assert.equal(displayCoins(input(one))[0].sameCityExpansion,false);
 assert.deepEqual(displayCoins({...input(one),entries:[]}),[]);
 const missing={...city,members:city.members.map(m=>({...m,image:null}))};const result=displayCoins(input(missing));assert.equal(result.length,15);assert.ok(result.every(e=>coinMarkerVisual(e.representative.image)==='placeholder'));
});
test('phone edges stay within viewport; constrained height retains a visible remaining entry',()=>{
 for(const point of [{x:12,y:20},{x:380,y:750},{x:195,y:390}]){
  const config=input(city,{width:390,height:780});config.entries[0].point=point;const result=displayCoins(config);
  assert.equal(result.length,15);for(const e of result){assert.ok(e.bounds.x-e.bounds.w/2>=0);assert.ok(e.bounds.x+e.bounds.w/2<=390);assert.ok(e.bounds.y-e.bounds.h/2>=0);assert.ok(e.bounds.y+e.bounds.h/2<=780)}
 }
 const short=input(city,{width:360,height:180});short.entries[0].point={x:180,y:90};const result=displayCoins(short),remaining=result.find(e=>e.overflow);assert.ok(remaining);assert.ok(result.some(e=>e.kind==='family'));
 assert.deepEqual(ids(result),city.members.map(m=>m.family.id).sort());assert.equal(displayCollectionContext(remaining).familyIds.length,15);
});
test('coincident different places retain identities and member deduplication',()=>{
 const second={place:{...city.place,id:'separate-place'},members:[city.members[0]]};const config=input(city);config.entries[0].groups.push(second);
 const result=displayCoins(config);assert.equal(result.length,15);assert.deepEqual(result[0].anchors.map(a=>a.placeId),['separate-place','suyab']);assert.deepEqual(displayCollectionContext(result[0]).placeIds,['separate-place','suyab']);
});
test('8.5 resolves still-clustered source leaves into real city anchors before expansion',()=>{
 const nearby=groups.find(g=>g.place.id==='balasagun'),config=input(city,{zoom:8.5,project:coords=>({x:coords[0]===city.place.coordinates[0]?640:1000,y:400})});
 config.entries[0]={...config.entries[0],cluster:true,groups:[city,nearby],coords:[75.22,42.78]};
 const result=displayCoins(config),expanded=result.filter(e=>e.sameCityExpansion);assert.equal(expanded.length,15);
 assert.ok(expanded.every(e=>e.coords===city.place.coordinates&&e.point.x===640));
 assert.equal(result.find(e=>e.members.some(m=>m.family.id==='western-liao-zhouyuan')).point.x,1000);
});
test('expanded grid avoids visible search controls and reserves a remaining entry above a short sheet',()=>{
 const obstacle={x:230,y:110,w:440,h:180},config=input(city,{expansionObstacles:[obstacle]});
 config.entries[0].point={x:640,y:300};const result=displayCoins(config);assert.ok(result.every(e=>!intersects(e.bounds,obstacle)));
 const phone=input(city,{width:390,height:780,expansionHeight:250,expansionTop:120});phone.entries[0].point={x:195,y:300};
 const limited=displayCoins(phone);assert.ok(limited.some(e=>e.overflow));assert.ok(limited.some(e=>e.kind==='family'));assert.deepEqual(ids(limited),city.members.map(m=>m.family.id).sort());
 assert.ok(limited.every(e=>e.bounds.y+e.bounds.h/2<=250&&e.bounds.y-e.bounds.h/2>=120));
});
