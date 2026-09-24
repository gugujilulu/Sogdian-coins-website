import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coinPlaces,uniqueMembers,coverMember,canExpand,intersects} from '../lib/coin-map.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
test('matched records alone form unique location members and covers without mutation',()=>{
 const before=JSON.stringify(data),groups=coinPlaces(data.families,data.specimens,data.places),members=uniqueMembers(groups);
 const expected=data.families.filter(f=>f.anchor&&data.places.some(p=>p.id===f.anchor.placeId)&&data.specimens.some(r=>r.familyId===f.id));
 assert.equal(members.length,expected.length);assert.equal(new Set(members.map(m=>m.family.id)).size,members.length);
 for(const m of members){assert.equal(m.recordCount,data.specimens.filter(r=>r.familyId===m.family.id).length);assert.ok(m.record.images.includes(m.image))}
 assert.equal(members.find(m=>m.family.id==='lady-nana').recordCount,20);
 assert.equal(JSON.stringify(data),before);
});
test('stable covers independent of input order, selected priority, filtered cover and missing image',()=>{
 const groups=coinPlaces(data.families,data.specimens,data.places),reversed=coinPlaces([...data.families].reverse(),[...data.specimens].reverse(),[...data.places].reverse());assert.deepEqual(groups,reversed);
 const members=uniqueMembers(groups);const target=members.find(m=>m.family.id==='lady-nana');assert.equal(coverMember(members,target.family.id),target);
 const r=data.specimens.find(r=>r.familyId==='lady-nana'&&r.images.length);const only=coinPlaces(data.families,[r,r],data.places);assert.equal(uniqueMembers(only)[0].recordCount,1);assert.equal(uniqueMembers(only)[0].record.id,r.id);
 const missing=coinPlaces(data.families,[{...r,images:[]}],data.places);assert.equal(uniqueMembers(missing)[0].image,null);assert.equal(uniqueMembers(missing).length,1);
 assert.deepEqual(coinPlaces(data.families,[],data.places),[]);
});
test('spatial expansion stops for coincident locations or zoom caps; collection members stay reachable',()=>{
 const groups=coinPlaces(data.families,data.specimens,data.places);assert.ok(groups.some(g=>g.members.length>1));
 assert.equal(canExpand(groups,4,13,6),true);assert.equal(canExpand([groups[0]],4,13,6),false);
 assert.equal(canExpand([groups[0],{...groups[1],place:{...groups[1].place,coordinates:groups[0].place.coordinates}}],4,13,6),false);
 assert.equal(canExpand(groups,13,13,14),false);assert.equal(canExpand(groups,8,13,8),false);
 assert.equal(uniqueMembers([groups[0],groups[0]]).length,groups[0].members.length);
 assert.ok(intersects({x:0,y:0,w:60,h:40},{x:20,y:0,w:50,h:30}));assert.ok(!intersects({x:0,y:0,w:60,h:40},{x:200,y:0,w:50,h:30}));
});
