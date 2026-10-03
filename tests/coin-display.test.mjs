import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coinPlaces,displayCoins,coinMarkerVisual} from '../lib/coin-map.ts';
const d=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const places=coinPlaces(d.families,d.specimens,d.places);
const panch=places.find(g=>g.members.some(m=>m.family.id==='lady-nana'));
const entry=g=>({key:g.place.id,coords:g.place.coordinates,point:{x:200,y:200},groups:[g],cluster:false,id:0});
const run=(groups,zoom=4,extra={})=>displayCoins({entries:groups.map(entry),zoom,width:800,height:600,labels:[],...extra});
test('single and multi-family entries share photo policy and complete family counts',()=>{
 const one={...panch,members:[panch.members.find(m=>m.family.id==='lady-nana')]};
 assert.equal(run([one])[0].kind,'family');assert.equal(coinMarkerVisual(run([one])[0].representative.image),'image');
 const collection=run([panch])[0];assert.equal(collection.kind,'collection');assert.equal(collection.members.length,panch.members.length);assert.ok(collection.representative.image);
 // Label pressure changes size, never the photo policy.
 const compact=run([one],4,{labels:[{x:200,y:164,w:90,h:50}]})[0];assert.equal(compact.large,false);assert.equal(coinMarkerVisual(compact.representative.image),'image');
});
test('stages and same-city expansion retain all members and real anchors',()=>{
 for(const [zoom,stage,expand]of [[4,'far',false],[6,'middle',false],[9,'near',true]]){
  const result=run([panch],zoom)[0];assert.equal(result.stage,stage);assert.equal(result.sameCityExpansion,expand);
  assert.deepEqual(result.members.map(m=>m.family.id),panch.members.map(m=>m.family.id));assert.deepEqual(result.anchors[0].coordinates,panch.place.coordinates);
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
