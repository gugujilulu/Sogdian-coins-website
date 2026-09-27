import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {collectionMembers,galleryRecords,validGallerySelection,emptyFilters,keepFullFamilySession,anchorPan} from '../lib/map-selection.ts';
import {coinPlaces,uniqueMembers} from '../lib/coin-map.ts';
import {filterAtlasRecords} from '../lib/record-filters.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
test('collection context retains original families only, projects latest covers/counts, supports one and zero survivors',()=>{
 const groups=coinPlaces(data.families,data.specimens,data.places),nana=groups.find(g=>g.members.some(m=>m.family.id==='lady-nana'));
 const context={placeIds:[nana.place.id],familyIds:['lady-nana'],scrollTop:90};
 const before=JSON.stringify(groups);
 assert.deepEqual(uniqueMembers(collectionMembers(groups,context)).map(m=>m.family.id),['lady-nana']);
 const r=data.specimens.find(r=>r.familyId==='lady-nana');
 const one=collectionMembers(coinPlaces(data.families,[r],data.places),context);
 assert.equal(uniqueMembers(one)[0].recordCount,1);assert.equal(uniqueMembers(one)[0].record.id,r.id);
 assert.deepEqual(collectionMembers([],context),[]);assert.equal(JSON.stringify(groups),before);
});
test('local gallery narrows global result without mutating it; group and facet are AND',()=>{
 const records=[{id:'a',variantId:'g1',facets:['x']},{id:'b',variantId:'g1',facets:['y']},{id:'c',variantId:null,facets:['x']}];
 const before=JSON.stringify(records);assert.deepEqual(galleryRecords(records,'g1','x').map(r=>r.id),['a']);
 assert.equal(galleryRecords(records,'all','all').length,3);assert.equal(galleryRecords(records,'g1','absent').length,0);
 assert.equal(galleryRecords(records,'unassigned','x')[0].id,'c');assert.equal(JSON.stringify(records),before);
 assert.deepEqual(validGallerySelection(records,'gone','gone'),{group:'all',facet:'all'});
});
test('single full-family snapshot preserves every filter and local choice, expires on global edits or family change',()=>{
 const filters={query:'nana',region:['region:semirechye'],polity:['polity:turgesh'],city:['place:suyab'],familyFilter:'lady-nana',sourceFilter:'Zeno',inscriptionFilter:'legend',tamghaFilter:'tamgha',featureFilter:'feature',statusFilter:'review',year:700,dateMode:'year'};
 const expanded={...emptyFilters,year:700};const session={familyId:'lady-nana',filters:{...filters},group:'g',facet:'x',expandedSignature:JSON.stringify(expanded)};
 assert.equal(keepFullFamilySession(session,'lady-nana',expanded),session);assert.deepEqual(session.filters,filters);
 for(const key of Object.keys(filters)){const changed={...expanded,[key]:key==='year'?701:'changed'};assert.equal(keepFullFamilySession(session,'lady-nana',changed),null,key)}
 assert.equal(keepFullFamilySession(session,'other',expanded),null);assert.equal(keepFullFamilySession(null,'lady-nana',expanded),null);
 const original=filterAtlasRecords(data,{sources:['Zeno']}).records.filter(r=>r.familyId==='lady-nana');
 const all=data.specimens.filter(r=>r.familyId==='lady-nana');assert.ok(all.length>=original.length);assert.equal(all.length,20);
});
test('visible anchor never pans, outside uses smallest pan, explicit locate centers at unchanged zoom',()=>{
 const area={left:40,right:700,top:120,bottom:600};assert.deepEqual(anchorPan({x:200,y:300},area),[0,0]);
 assert.deepEqual(anchorPan({x:800,y:650},area),[100,50]);assert.deepEqual(anchorPan({x:0,y:20},area),[-40,-100]);
 assert.deepEqual(anchorPan({x:200,y:300},area,true),[-170,-60]);
 assert.deepEqual(anchorPan({x:195,y:500},{left:40,right:335,top:100,bottom:220}),[0,280]);
});
test('camera avoids the actual search/control rectangles with minimal translation',()=>{
 const area={left:40,right:800,top:40,bottom:600},search={left:0,right:390,top:0,bottom:200};
 assert.deepEqual(anchorPan({x:200,y:180},area,false,[search]),[0,-21]);
 assert.deepEqual(anchorPan({x:600,y:180},area,false,[search]),[0,0]);
});
