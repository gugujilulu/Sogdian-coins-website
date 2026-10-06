import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coinPlaces,displayCoins,coinMarkerVisual,markerGeometry,coinImageScale} from '../lib/coin-map.ts';
const d=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const places=coinPlaces(d.families,d.specimens,d.places);
const panch=places.find(g=>g.members.some(m=>m.family.id==='lady-nana'));
const entry=g=>({key:g.place.id,coords:g.place.coordinates,point:{x:200,y:200},groups:[g],cluster:false,id:0});
const run=(groups,zoom=4,extra={})=>displayCoins({entries:groups.map(entry),zoom,width:800,height:600,labels:[],...extra});
test('T67.9 photograph dimensions enlarge 1.5x including height caps; other targets stay unchanged',()=>{
 assert.equal(coinImageScale,1.5);
 for(const [width,height,desktop,mobile]of [[800,800,[60,60],[56,56]],[1600,800,[72,36],[64,32]],[800,1600,[30,60],[28,56]]]){
  for(const small of [false,true]){
   const before=small?mobile:desktop,after=markerGeometry({x:100,y:100},true,small,15,0,{width,height});
   assert.equal(after.width,before[0]*1.5);assert.equal(after.height,before[1]*1.5);assert.equal(after.badgeWidth,24);
  }
 }
 for(const small of [false,true]){
  const compact=markerGeometry({x:100,y:100},false,small,1,0,{width:1600,height:800});
  assert.equal(compact.width,(small?56:60)*1.5);assert.equal(compact.height,(small?28:30)*1.5);
  const fallback=markerGeometry({x:100,y:100},true,small,15,0,null);assert.equal(fallback.width,48);assert.equal(fallback.height,32);assert.equal(fallback.badgeWidth,24);
  const narrow=markerGeometry({x:100,y:100},true,small,1,0,{width:100,height:1000});assert.ok(narrow.box.w>=44&&narrow.box.h>=32);
 }
});
test('single and multi-family entries share photo policy and complete family counts',()=>{
 const one={...panch,members:[panch.members.find(m=>m.family.id==='lady-nana')]};
 assert.equal(run([one])[0].kind,'family');assert.equal(coinMarkerVisual(run([one])[0].representative.image),'image');
 const collection=run([panch])[0];assert.equal(collection.kind,'collection');assert.equal(collection.members.length,panch.members.length);assert.ok(collection.representative.image);
 // Label pressure changes size, never the photo policy.
 const compact=run([one],4,{labels:[{x:200,y:164,w:90,h:50}]})[0];assert.equal(compact.large,false);assert.equal(coinMarkerVisual(compact.representative.image),'image');
});
test('stages and same-city expansion retain all members and real anchors',()=>{
 for(const [zoom,stage,expand]of [[4,'far',false],[6,'middle',false],[9,'near',true]]){
  const results=run([panch],zoom),result=results[0];assert.equal(result.stage,stage);assert.equal(result.sameCityExpansion,expand);
  assert.deepEqual(results.flatMap(e=>e.members.map(m=>m.family.id)).sort(),panch.members.map(m=>m.family.id).sort());assert.deepEqual(result.anchors[0].coordinates,panch.place.coordinates);
  assert.equal(results.length,expand?panch.members.length:1);
 }
});
test('projected separation permits independent images, stable order and selected cover',()=>{
 const second=places.find(g=>g.place.id!==panch.place.id),a=entry(panch),b={...entry(second),point:{x:500,y:200}};
 const input={entries:[a,b],zoom:6,width:800,height:600,labels:[],selectedId:'lady-nana'};
 const result=displayCoins(input);assert.equal(result.length,2);assert.equal(result[0].representative.family.id,'lady-nana');
 assert.deepEqual(result,displayCoins({...input,entries:[b,a]}));
});
test('source-restricted covers and missing/failed images use bounded neutral fallback',()=>{
 const r=d.specimens.find(r=>r.id==='zeno-264408');
 const groups=coinPlaces(d.families,[r],d.places,i=>i.sourceName==='Bactrianumis');
 assert.equal(run(groups)[0].representative.image.sourceName,'Bactrianumis');
 assert.equal(coinMarkerVisual(run(groups)[0].representative.image,true),'placeholder');
 const none=coinPlaces(d.families,[r],d.places,()=>false);assert.equal(run(none)[0].members.length,1);assert.equal(coinMarkerVisual(run(none)[0].representative.image),'placeholder');
});

test('actual aspect-ratio footprints preserve wide, square and single-face images; compact remains readable',()=>{
 for(const small of [false,true])for(const [width,height]of [[2200,1100],[800,800],[400,700]]){
  const image={width,height};const normal=markerGeometry({x:200,y:200},true,small,3,-64,image),compact=markerGeometry({x:200,y:200},false,small,3,-64,image);
  assert.ok(Math.abs(normal.width/normal.height-width/height)<.001);
  assert.ok(Math.abs(compact.width/compact.height-width/height)<.001);
  assert.ok(compact.width/normal.width>=.8);assert.ok(compact.height/normal.height>=.8);
  assert.ok(normal.box.w>normal.width);assert.ok(normal.box.h>normal.height);
 }
});
test('Bukhara presentation preference uses inspected existing photo, with filtered fallback',()=>{
 const member=coinPlaces(d.families,d.specimens,d.places).flatMap(g=>g.members).find(m=>m.family.id==='bukhara-kaiyuan-tamgha');
 assert.equal(member.image.id,'z1062');assert.equal(member.record.id,'zeno-1062');
 const only=d.specimens.filter(r=>r.id==='zeno-1031');const filtered=coinPlaces(d.families,only,d.places).flatMap(g=>g.members)[0];
 assert.equal(filtered.image.id,'z1031');assert.equal(filtered.recordCount,1);
});
