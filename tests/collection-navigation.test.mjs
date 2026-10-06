import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coinPlaces,displayCoins,collectionCityTarget,coinEntryAction,displayCollectionContext,collectionViewReady} from '../lib/coin-map.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const groups=coinPlaces(data.families,data.specimens,data.places);
const suyab=groups.find(g=>g.place.id==='suyab'),balasagun=groups.find(g=>g.place.id==='balasagun');
const entry=gs=>({key:'cluster',coords:[75.22,42.78],point:{x:600,y:300},groups:gs,cluster:true,id:1});
const run=(gs,zoom=6)=>displayCoins({entries:[entry(gs)],labels:[],width:1280,height:800,zoom,project:c=>({x:c[0]===75.2?600:700,y:350})});
test('ordinary single-city and cross-city collections navigate on every click, not to a list',()=>{
 for(const gs of [[suyab],[suyab,balasagun]]){
  const e=run(gs)[0],before=JSON.stringify(gs),action=coinEntryAction(e);
  assert.equal(action.kind,'navigate');assert.deepEqual(coinEntryAction(e),action);
  assert.equal(action.target.kind,gs.length===1?'single':'multiple');
  assert.deepEqual(action.target.placeIds,gs.map(g=>g.place.id).sort());
  assert.deepEqual(action.target.coordinates,[...gs].sort((a,b)=>a.place.id.localeCompare(b.place.id)).map(g=>g.place.coordinates));
  assert.equal(JSON.stringify(gs),before);
 }
 const collision=displayCoins({entries:[{...entry([suyab]),cluster:false,key:'suyab'},{...entry([balasagun]),cluster:false,key:'balasagun',point:{x:608,y:300}}],labels:[],width:1280,height:800,zoom:6})[0];
 assert.equal(collision.displayCollection,true);assert.equal(coinEntryAction(collision).kind,'navigate');assert.deepEqual(coinEntryAction(collision).target.placeIds,['balasagun','suyab']);
 const atSameCoordinate={...balasagun,place:{...balasagun.place,coordinates:suyab.place.coordinates}};
 const target=collectionCityTarget([suyab,atSameCoordinate]);assert.equal(target.kind,'multiple');assert.equal(target.coordinates.length,1);assert.equal(target.placeIds.length,2);
});
test('near expansion resolves actual Suyab 15 and Balasagun 1 members to their own anchors',()=>{
 const display=run([suyab,balasagun],9);assert.equal(display.length,16);
 for(const e of display){assert.equal(coinEntryAction(e).kind,'family');const member=e.members[0];assert.equal(e.anchors.length,1);assert.equal(e.anchors[0].placeId,member.family.anchor.placeId);assert.deepEqual(e.coords,groups.find(g=>g.place.id===member.family.anchor.placeId).place.coordinates)}
 assert.equal(display.filter(e=>e.anchors[0].placeId==='suyab').length,15);
 assert.equal(display.filter(e=>e.anchors[0].placeId==='balasagun').length,1);
});
test('only remaining entry opens supplementary full members; single-filtered family stays direct',()=>{
 const short=displayCoins({entries:[{...entry([suyab]),point:{x:195,y:90}}],labels:[],width:390,height:180,zoom:9});
 const remaining=short.find(e=>e.overflow);assert.ok(remaining);assert.equal(coinEntryAction(remaining).kind,'remaining');assert.equal(displayCollectionContext(remaining).familyIds.length,15);
 const one={...suyab,members:suyab.members.slice(0,1)};assert.equal(coinEntryAction(run([one],9)[0]).familyId,one.members[0].family.id);
});

test('fit padding edges are already arrived; single/multi repeat skip, pan/zoom away repositions',()=>{
 for(const viewport of [{width:1280,height:800,padding:{left:440,right:44,top:44,bottom:44}},{width:390,height:844,padding:{left:44,right:44,top:230,bottom:440}}]){
  const {width,height,padding}=viewport;
  for(const points of [[{x:(padding.left+width-padding.right)/2,y:(padding.top+height-padding.bottom)/2}],[{x:padding.left,y:padding.top},{x:width-padding.right,y:height-padding.bottom}]]){
   const at={...viewport,points,zoom:9,targetZoom:9};
   assert.equal(collectionViewReady(at),true);assert.equal(collectionViewReady(at),true);
   assert.equal(collectionViewReady({...at,zoom:8}),false);
   assert.equal(collectionViewReady({...at,points:[{x:padding.left-3,y:padding.top}]}),false);
   assert.equal(collectionViewReady({...at,points:[{x:padding.left-1,y:padding.top-1}]}),true);
  }
  const broad={...viewport,points:[{x:padding.left,y:padding.top}],zoom:7.995,targetZoom:8};
  assert.equal(collectionViewReady(broad),true);assert.equal(collectionViewReady({...broad,zoom:7.9}),false);
 }
});
