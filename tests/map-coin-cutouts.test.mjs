import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {coinPlaces,mapCoinImage,markerGeometry} from '../lib/coin-map.ts';
import {recordSourceProvider} from '../lib/record-filters.ts';
const root=new URL('../',import.meta.url);
const data=JSON.parse(readFileSync(new URL('public/data/atlas.json',root)));
const index=JSON.parse(readFileSync(new URL('public/data/map-coin-cutouts.json',root)));
test('every default and source-restricted selectable map cover has its own derived image',()=>{
 const covers=new Map();
 const add=groups=>groups.flatMap(g=>g.members).forEach(m=>{if(m.image)covers.set(m.image.path,m.image)});
 add(coinPlaces(data.families,data.specimens,data.places));
 for(const record of data.specimens){
  const provider=i=>recordSourceProvider({url:i.sourceRecordUrl||'',label:'',relation:'same_specimen'});
  for(const source of new Set(['all',...record.images.map(provider)]))add(coinPlaces(data.families,[record],data.places,i=>source==='all'||provider(i)===source));
 }
 assert.deepEqual(Object.keys(index).sort(),[...covers.keys()].sort());
 for(const [path,image]of covers){
  const derived=mapCoinImage(image);assert.equal(derived.originalPath,path);assert.equal(derived.originalId,image.id);
  assert.ok(existsSync(new URL('public'+derived.path,root)));assert.ok(derived.width>=20&&derived.height>=20);
 }
});
test('render resource and collision footprint use the derived ratio without replacing source identity',()=>{
 for(const group of coinPlaces(data.families,data.specimens,data.places))for(const member of group.members){
  const source=member.image,derived=mapCoinImage(source);assert.ok(member.record.images.includes(source));assert.notEqual(source.path,derived.path);
  for(const mobile of [true,false])for(const count of [1,15]){
   const geometry=markerGeometry({x:120,y:160},true,mobile,count,0,source);
   assert.ok(Math.abs(geometry.width/geometry.height-derived.width/derived.height)<1e-8);
   assert.ok(geometry.box.w>=geometry.width&&geometry.box.h>=geometry.height);
  }
 }
 assert.equal(mapCoinImage({path:'/missing-photo.jpg'}),null);assert.equal(mapCoinImage(null),null);
});
