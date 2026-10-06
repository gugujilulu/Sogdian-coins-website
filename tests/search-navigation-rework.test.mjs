import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchSelection,searchMapTarget,searchBounds,searchCameraReady,searchNavigationQueue} from '../lib/search-map-navigation.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
test('every located family and record resolves its own real city through the shared request path in all basemaps',()=>{
 let families=0,records=0;
 for(const family of data.families){const city=data.places.find(p=>p.id===family.anchor?.placeId);if(!city)continue;families++;
  const selection=searchSelection(data,family.id,data.specimens);assert.deepEqual(selection.target.placeIds,[city.id]);assert.deepEqual(selection.target.coordinates,[city.coordinates]);
  for(const record of data.specimens.filter(r=>r.familyId===family.id)){records++;assert.deepEqual(searchMapTarget(data,[record]).coordinates,selection.target.coordinates);}
  for(const base of ['historical','terrain','topo']){const seen=[],queue=searchNavigationQueue(request=>seen.push(request));const request={serial:1,intent:'selection',target:selection.target};queue.offer(request);queue.setReady(true);assert.equal(seen.length,1,base);assert.deepEqual(searchBounds(seen[0].target),[city.coordinates,city.coordinates]);queue.dispose();}
 }
 assert.ok(families>30);assert.ok(records>700);console.log(`Located coverage: ${families} families, ${records} records; shared base-independent path.`);
});
test('all submission entrances use fitted zoom and padding; repeated arrival is stable, moving away or zooming out needs relocation',()=>{
 const view={points:[{x:100,y:100},{x:500,y:300}],width:600,height:400,padding:{left:100,right:100,top:100,bottom:100},zoom:6,targetZoom:6};
 assert.equal(searchCameraReady(view),true);assert.equal(searchCameraReady({...view,zoom:5.8}),false);
 assert.equal(searchCameraReady({...view,points:[{x:98.5,y:100},{x:501.5,y:300}]}),true);
 assert.equal(searchCameraReady({...view,points:[{x:70,y:100}]}),false);
 assert.equal(searchCameraReady({...view,points:[]}),false);
 assert.equal(searchCameraReady({...view,zoom:8.6,targetZoom:9}),false);
 assert.equal(searchCameraReady({...view,zoom:10,targetZoom:9}),true);
});
