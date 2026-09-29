import test from 'node:test';
import assert from 'node:assert/strict';
import {visualFixture} from '../app/t21-preview/fixture.ts';
import {maskLayout,pointInRing,project,unproject} from '../lib/range-mask.ts';
const previous=process.env.NODE_ENV;process.env.NODE_ENV='development';
const fixture=visualFixture({places:[]});process.env.NODE_ENV=previous;
function cross(a,b,c){return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
test('terrain study rings are closed, without crossings or holes; labels are inside their own range',()=>{
 for(const r of fixture.ranges){const [ring]=r.geometry.coordinates;assert.equal(r.geometry.coordinates.length,1);assert.deepEqual(ring[0],ring.at(-1));assert.ok(pointInRing(r.label,ring));
 for(let i=0;i<ring.length-1;i++)for(let j=i+2;j<ring.length-1;j++){if(i===0&&j===ring.length-2)continue;const a=ring[i],b=ring[i+1],c=ring[j],d=ring[j+1];assert.ok(!(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0),`${r.id}: segments ${i}/${j}`)}
 }
});
test('display mask preserves source geometry and pads all sides for the fading band',()=>{
 const r=fixture.ranges[1],before=JSON.stringify(r),mask=maskLayout(r);
 assert.equal(JSON.stringify(r),before);assert.ok(mask.blur>0);assert.ok(mask.width<=1201&&mask.height<=1201);
 for(const ring of mask.rings)for(const [x,y] of ring){assert.ok(x>mask.blur&&x<mask.width-mask.blur);assert.ok(y>mask.blur&&y<mask.height-mask.blur)}
 for(const point of r.geometry.coordinates[0]){const round=unproject(project(point));assert.ok(Math.abs(round[0]-point[0])<1e-9&&Math.abs(round[1]-point[1])<1e-9)}
 assert.equal(maskLayout({...r,geometry:undefined}),null);
});
test('visual fixture remains excluded from production',()=>{const old=process.env.NODE_ENV;try{process.env.NODE_ENV='production';assert.deepEqual(visualFixture({places:[]}),{places:[],ranges:[]})}finally{process.env.NODE_ENV=old}});

test('each range can configure its own transition without changing its query geometry',()=>{
 const r=fixture.ranges[0],before=JSON.stringify(r.geometry);
 const narrow=maskLayout({...r,display:{transitionKm:4}}),wide=maskLayout({...r,display:{transitionKm:12}});
 assert.ok(wide.blur>narrow.blur);assert.ok(wide.coordinates[0][0]<narrow.coordinates[0][0]);
 assert.equal(JSON.stringify(r.geometry),before);
});
