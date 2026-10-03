import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coinPlaces,coverMember,layoutCoinEntries,markerGeometry,uniqueMembers,intersects} from '../lib/coin-map.ts';
const d=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const template=coinPlaces(d.families,d.specimens,d.places)[0];
function point(key,x,y,photo=true,count=1){
 const groups=[{place:{...template.place,id:key},members:Array.from({length:count},(_,i)=>({...template.members[0],family:{...template.members[0].family,id:key+i},image:photo?template.members[0].image:null}))}];
 return {key,point:{x,y},coords:[67+x/10000,39+y/10000],groups,cluster:false,id:0};
}
function verify(input,output){
 assert.deepEqual(output.flatMap(e=>e.entryKeys).sort(),input.map(e=>e.key).sort());
 assert.equal(uniqueMembers(output.flatMap(e=>e.groups)).length,uniqueMembers(input.flatMap(e=>e.groups)).length);
 for(let i=0;i<output.length;i++)for(let j=i+1;j<output.length;j++)assert.equal(intersects(output[i].bounds,output[j].bounds),false);
}
test('photo plus nearby compact form an accessible display collection, preserving originals',()=>{
 const entries=[point('a',150,180),point('b',173,130,false)],before=JSON.stringify(entries);
 const result=layoutCoinEntries(entries,[],500,400);verify(entries,result);
 assert.equal(result.length,1);assert.equal(result[0].displayCollection,true);assert.equal(result[0].groups.length,2);
 assert.equal(JSON.stringify(entries),before);
});
test('two overlapping compact entries keep both members; selected anchor wins independent of input order',()=>{
 const entries=[point('a',150,180,false),point('b',175,180,false)];
 const result=layoutCoinEntries(entries,[],500,400,'b0');verify(entries,result);
 assert.equal(result.length,1);assert.deepEqual(result[0].coords,entries[1].coords);assert.equal(result[0].large,false);assert.equal(coverMember(uniqueMembers(result[0].groups),'b0').family.id,'b0');
 assert.deepEqual(result,layoutCoinEntries([...entries].reverse(),[],500,400,'b0'));
});
test('protruding badge participates even when compact bodies do not intersect',()=>{
 const entries=[point('a',150,180,false,2),point('b',206,180,false,2)];
 assert.equal(intersects({x:150,y:168,w:48,h:32},{x:206,y:168,w:48,h:32}),false);
 assert.equal(intersects(markerGeometry(entries[0].point,false,true,2).box,markerGeometry(entries[1].point,false,true,2).box),true);
 const result=layoutCoinEntries(entries,[],390,400);verify(entries,result);assert.equal(result.length,1);
});
test('growing display collections recheck third entries and remain unique at desktop and mobile widths',()=>{
 const entries=[point('a',100,150,true,8),point('b',126,150,false,8),point('c',160,150,false,8),point('d',300,280)];
 for(const width of [390,1280]){const result=layoutCoinEntries(entries,[],width,720,'b0');verify(entries,result);assert.ok(result.some(e=>e.displayCollection));}
});
test('label collision downgrades a photo to compact and registers its new footprint',()=>{
 const entries=[point('a',150,180),point('b',200,180)];
 const result=layoutCoinEntries(entries,[{x:200,y:120,w:20,h:12}],600,400);verify(entries,result);
 assert.ok(result.some(e=>!e.large));
});
