import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coinPlaces,displayCoins,intersects,markerGeometry} from '../lib/coin-map.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const groups=coinPlaces(data.families,data.specimens,data.places),suyab=groups.find(g=>g.place.id==='suyab'),balasagun=groups.find(g=>g.place.id==='balasagun'),panch=groups.find(g=>g.place.id==='panjakent');
const entry=(g,x,y)=>({key:g.place.id,coords:g.place.coordinates,point:{x,y},groups:[g],cluster:false,id:0});
const run=(extra={})=>displayCoins({zoom:9,width:1280,height:702,labels:[],entries:[entry(suyab,640,350),entry(balasagun,680,425)],...extra});
const previous=entries=>new Map(entries.filter(e=>!e.overflow).map(e=>[e.key,{offsetX:e.offsetX,offset:e.offset}]));
const signature=entries=>entries.map(e=>[e.key,e.offsetX,e.offset,e.representative?.image?.id,e.bounds,e.members.map(m=>m.family.id)]);
const ids=entries=>entries.flatMap(e=>e.members.map(m=>m.family.id)).sort();
const noCollisions=entries=>{for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++)assert.equal(intersects(entries[i].bounds,entries[j].bounds),false,entries[i].key+' / '+entries[j].key)};
test('real neighbouring cities share actual outer-box occupancy, preserve identity and all 16 members',()=>{
 const before=JSON.stringify([suyab,balasagun]),result=run();assert.equal(result.length,16);noCollisions(result);
 assert.deepEqual(ids(result),[...suyab.members,...balasagun.members].map(m=>m.family.id).sort());
 assert.equal(new Set(result.map(e=>e.key)).size,16);assert.equal(JSON.stringify([suyab,balasagun]),before);
 for(const e of result){const g=groups.find(g=>g.place.id===e.anchors[0].placeId);assert.deepEqual(e.coords,g.place.coordinates);const image=markerGeometry({x:e.point.x+e.offsetX,y:e.point.y+e.offset},true,false,1,0,e.representative.image);assert.ok(e.bounds.w>=image.box.w+4);assert.ok(e.bounds.h>=image.box.h+4)}
 const locations=result.filter(e=>e.anchors[0].placeId==='suyab');assert.ok(new Set(locations.map(e=>e.offsetX)).size>10);assert.ok(new Set(locations.map(e=>e.offset)).size>10);assert.ok(locations.some(e=>e.offsetX<-70)&&locations.some(e=>e.offsetX>70)&&locations.some(e=>e.offset<-70)&&locations.some(e=>e.offset>70));
});
test('stable IDs and valid cached offsets survive selection, small pans, filters and zoom return',()=>{
 const initial=run(),cache=previous(initial);assert.deepEqual(run(),initial);
 const reversed=run({entries:[entry(balasagun,680,425),entry({...suyab,members:[...suyab.members].reverse()},640,350)]});assert.deepEqual(signature(reversed),signature(initial));
 const changed=run({previous:cache,selectedId:'sr9',entries:[entry(suyab,647,354),entry(balasagun,687,429)]});assert.deepEqual(changed.map(e=>[e.key,e.offsetX,e.offset]),initial.map(e=>[e.key,e.offsetX,e.offset]));
 const subset={...suyab,members:suyab.members.filter(m=>m.family.id.startsWith('sr'))};const filtered=run({previous:cache,entries:[entry(subset,640,350)]});for(const e of filtered)assert.deepEqual([e.offsetX,e.offset],[cache.get(e.key).offsetX,cache.get(e.key).offset]);
 assert.deepEqual(signature(run({previous:cache})),signature(initial));assert.equal(run({zoom:8})[0].stage,'middle');
});
test('mobile uses available directions; selected family survives a constrained panel with accurate remaining members',()=>{
 const result=run({width:390,height:746,entries:[entry(suyab,195,340)]});assert.equal(result.length,15);noCollisions(result);
 const limited=run({width:390,height:746,expansionTop:118,expansionHeight:320,previous:previous(result),selectedId:'alp-tagh',entries:[entry(suyab,195,340)]});
 assert.ok(limited.find(e=>e.kind==='family'&&e.members[0].family.id==='alp-tagh'));assert.ok(limited.some(e=>e.overflow));assert.ok(!limited.find(e=>e.overflow).members.some(m=>m.family.id==='alp-tagh'));assert.deepEqual(ids(limited),suyab.members.map(m=>m.family.id).sort());noCollisions(limited);
 for(const e of limited){assert.ok(e.bounds.y-e.bounds.h/2>=130);assert.ok(e.bounds.y+e.bounds.h/2<=308);assert.ok(e.bounds.x-e.bounds.w/2>=12);assert.ok(e.bounds.x+e.bounds.w/2<=378)}
});
test('edge, label, search, controls and scale footprints are excluded without geographic changes',()=>{
 const controls=[{x:190,y:45,w:350,h:70},{x:367,y:180,w:40,h:190},{x:55,y:715,w:100,h:32}],labels=[{x:190,y:370,w:145,h:45}];
 const result=run({width:390,height:746,labels,expansionObstacles:controls,entries:[entry(suyab,190,350),entry(balasagun,210,420)]});
 assert.deepEqual(ids(result),[...suyab.members,...balasagun.members].map(m=>m.family.id).sort());noCollisions(result);
 for(const e of result)for(const b of [...controls,...labels])assert.equal(intersects(e.bounds,b),false);
 const corner=run({width:390,height:746,entries:[entry(panch,15,720)]});assert.deepEqual(ids(corner),panch.members.map(m=>m.family.id).sort());noCollisions(corner);for(const e of corner)assert.ok(e.bounds.x-e.bounds.w/2>=12&&e.bounds.y+e.bounds.h/2<=734);
});
test('Panch four members have staggered distances and directions, no city-centre cover',()=>{
 const result=run({entries:[entry(panch,640,350)]});assert.equal(result.length,4);noCollisions(result);
 assert.ok(new Set(result.map(e=>Math.round(Math.hypot(e.offsetX,e.offset)))).size>=3);
 for(const e of result)assert.equal(intersects(e.bounds,{x:640,y:359,w:126,h:64}),false);
});

test('a fully covered map retains all identities without hidden keyboard targets in the renderer model',()=>{const result=run({expansionObstacles:[{x:640,y:351,w:1280,h:702}]});assert.deepEqual(ids(result),[...suyab.members,...balasagun.members].map(m=>m.family.id).sort());assert.ok(result.every(e=>e.occluded&&e.overflow));});
