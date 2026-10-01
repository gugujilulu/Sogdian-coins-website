import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {qaraKhitaiSample} from '../lib/qara-khitai-sample.ts';
import {qaraKhitaiGeometry} from '../lib/qara-khitai-geometry.ts';
import {rangeBoundaryFeatures} from '../lib/range-boundaries.ts';
import {buildMapBackground,periodLabel,timeMatches,visibleRanges,defaultLayers} from '../lib/map-layers.ts';
import {buildGeographyIndex} from '../lib/geography-index.ts';
const sample=qaraKhitaiSample(['fixture-family']);
test('closed fill never implicitly draws the source-coverage closure as a political border',()=>{
 const ring=sample.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));
 const lines=rangeBoundaryFeatures([sample]).features[0].geometry;
 assert.equal(lines.type,'MultiLineString');assert.equal(lines.coordinates.length,3);
 const seam=sample.coverageEdge.coordinates;
 for(const line of lines.coordinates)for(let i=1;i<line.length;i++)assert.notDeepEqual([line[i-1],line[i]],seam);
 assert.ok(ring.some(p=>JSON.stringify(p)===JSON.stringify(seam[0])));
 assert.ok(ring.some(p=>JSON.stringify(p)===JSON.stringify(seam[1])));
});
test('registration is traceable, finite, limited in precision and fill has no self intersections',()=>{
 assert.equal(qaraKhitaiGeometry.registration.controls.length,8);assert.ok(qaraKhitaiGeometry.registration.maxResidualKm<10);
 const ring=sample.geometry.coordinates[0];assert.ok(ring.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>60&&x<100&&y>35&&y<55));
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=1;i<ring.length;i++)for(let j=i+2;j<ring.length;j++){
  if(i===1&&j===ring.length-1)continue;
  const a=ring[i-1],b=ring[i],c=ring[j-1],d=ring[j];
  assert.ok(!(cross(a,b,c)*cross(a,b,d)<-1e-15&&cross(c,d,a)*cross(c,d,b)<-1e-15),`crossed segments ${i}/${j}`);
 }
});
test('after-1141 label has no invented end year or family-date substitution',()=>{
 assert.equal(sample.start,1141);assert.equal(sample.end,null);assert.match(periodLabel(sample),/未指定终年/);
 assert.equal(timeMatches(sample,{mode:'year',year:1150}),false);
 assert.equal(visibleRanges({places:[],ranges:[sample]},{...defaultLayers,polities:true},{mode:'all',year:0},'fixture-family').length,1);
});
test('existing Qara Khitai association is reused; all other polity entries remain',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url))),before=JSON.stringify(data);
 const geo=buildGeographyIndex(data),background=buildMapBackground(data,geo),node=geo.nodes.find(n=>n.id==='polity:qara-khitai');
 assert.deepEqual(background.ranges.find(r=>r.objectId==='polity:qara-khitai').familyIds,node.relatedFamilies);assert.ok(node.relatedFamilies.length>0);
 assert.equal(background.ranges.length,geo.nodes.filter(n=>n.dimension==='polity').length);
 assert.equal(JSON.stringify(data),before);
});
