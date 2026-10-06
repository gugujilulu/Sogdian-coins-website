import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {automaticLinkWrite,serializeLink,parseLink,cameraHistoryState,historyCamera} from '../lib/deep-links.ts';
import {emptyFilters,collectionMembers} from '../lib/map-selection.ts';
import {contextRecordFilters,filterAtlasRecords,recordSourceProvider} from '../lib/record-filters.ts';
import {searchMapTarget,searchSelection,searchNavigationQueue} from '../lib/search-map-navigation.ts';
import {coinPlaces} from '../lib/coin-map.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const link=filters=>serializeLink({view:'atlas',filters,region:filters.region,polity:filters.polity,city:filters.city});
test('submitted search remains returnable while a new query is only a draft; explicit changes and clears write once',()=>{
 const nana={...emptyFilters,query:'Lady Nana'},base=link(nana),draft=link({...nana,query:'Vah'});
 assert.equal(automaticLinkWrite(base,draft),'draft');assert.equal(automaticLinkWrite(base,link({...nana,query:'Vahshutava'})),'draft');
 assert.equal(automaticLinkWrite(base,link({...nana,query:''})),'pushState');
 assert.equal(automaticLinkWrite(base,link({...nana,query:'Vah',sourceFilter:'Zeno'})),'pushState');
 const family=serializeLink({...parseLink(base),family:'lady-nana'});assert.equal(automaticLinkWrite(base,family),'pushState');
 assert.equal(automaticLinkWrite(base,link({...nana,year:751})),'replaceState');
 const {region,polity,city,...savedFilters}=nana;assert.deepEqual(parseLink(base).filters,savedFilters);
});
test('history contains only an owned, valid camera snapshot, preserves other owners and rejects stale or malformed views',()=>{
 const signature=link({...emptyFilters,query:'Lady Nana'}),camera={center:[67.62,39.5],zoom:9};
 const state=cameraHistoryState({router:'keep'},signature,camera);assert.equal(state.router,'keep');assert.deepEqual(historyCamera(state,signature),camera);
 assert.equal(historyCamera(state,link(emptyFilters)),null);assert.equal(historyCamera(cameraHistoryState(null,signature,{center:[NaN,40],zoom:9}),signature),null);
 assert.equal(historyCamera(cameraHistoryState(null,signature,{center:[70,40],zoom:Infinity}),signature),null);
 assert.deepEqual(Object.keys(state.coinAtlas).sort(),['camera','signature']);
});
test('clear query retains source and time; clear all restores existing full result without changing data',()=>{
 const filters={...emptyFilters,query:'Lady Nana',sourceFilter:'Bactrianumis',dateMode:'year',year:700};
 const before=filterAtlasRecords(data,contextRecordFilters(filters));assert.equal(before.records.length,1);
 const cleared={...filters,query:''};const after=filterAtlasRecords(data,contextRecordFilters(cleared));assert.ok(after.records.length>=before.records.length);assert.ok(after.records.every(r=>r.sources.some(s=>s.relation==='same_specimen'&&recordSourceProvider(s)==='Bactrianumis')));
 assert.equal(contextRecordFilters(cleared).date.year,700);const sourceOnly=filterAtlasRecords(data,contextRecordFilters({...cleared,dateMode:'all'}));assert.deepEqual(sourceOnly.records.map(r=>r.id),before.records.map(r=>r.id));assert.deepEqual(contextRecordFilters(cleared).sources,['Bactrianumis']);
 const all=filterAtlasRecords(data,contextRecordFilters({...emptyFilters,year:700}));assert.equal(all.families.length,56);assert.equal(all.records.length,1010);
});
test('real matching records drive covers, city members and family selection without reducing the other search results',()=>{
 const filters={...emptyFilters,query:'Samarkand'},result=filterAtlasRecords(data,contextRecordFilters(filters));
 const groups=coinPlaces(result.families,result.records,data.places),context={placeIds:['panjakent'],familyIds:groups.find(g=>g.place.id==='panjakent').members.map(m=>m.family.id),scrollTop:0};
 const collection=collectionMembers(groups,context);assert.equal(collection[0].members.length,4);assert.equal(result.records.length,272);
 const selected=searchMapTarget(data,result.records.filter(r=>r.familyId==='lady-nana'));assert.deepEqual(selected.placeIds,['panjakent']);assert.equal(selected.recordCount,20);assert.equal(result.families.length,19);
 const source=filterAtlasRecords(data,contextRecordFilters({...emptyFilters,query:'Lady Nana',sourceFilter:'Bactrianumis'}));
 const cover=coinPlaces(source.families,source.records,data.places,image=>recordSourceProvider({url:image.sourceRecordUrl||'',relation:'same_specimen',label:''})==='Bactrianumis');
 assert.match(cover[0].members[0].image.path,/bactrianumis/);
});
test('clear cancels a not-yet-ready target; a repeated valid submission gets a fresh execution, never replays cancelled work',()=>{
 const seen=[],queue=searchNavigationQueue(r=>seen.push(r.serial)),request=serial=>({serial,target:searchMapTarget(data,[])});
 queue.offer(request(1));queue.cancel();queue.setReady(true);assert.deepEqual(seen,[]);
 queue.offer(request(2));queue.offer(request(3));assert.deepEqual(seen,[2,3]);queue.setReady(false);queue.offer(request(4));queue.cancel();queue.offer(request(5));queue.setReady(true);assert.deepEqual(seen,[2,3,5]);
 queue.setReady(false);queue.offer(request(6));queue.cancel();queue.setReady(true);assert.deepEqual(seen,[2,3,5]);queue.dispose();
});

test('family and record suggestions share the real city and retain only current matching collection members',()=>{
 const matches=filterAtlasRecords(data,{query:'Samarkand'}).records,before=matches.map(r=>r.id);
 const family=searchSelection(data,'lady-nana',matches),record=data.specimens.find(r=>r.familyId==='lady-nana');
 assert.deepEqual(searchSelection(data,record.familyId,matches),family);assert.deepEqual(family.target.placeIds,['panjakent']);assert.equal(family.target.kind,'single');
 assert.equal(family.context.familyIds.length,4);assert.ok(family.context.familyIds.includes('lady-nana'));assert.deepEqual(matches.map(r=>r.id),before);
 const source=filterAtlasRecords(data,{query:'Lady Nana',sources:['Bactrianumis']}).records,restricted=searchSelection(data,'lady-nana',source);
 assert.deepEqual(restricted.context.familyIds,['lady-nana']);assert.deepEqual(restricted.target.coordinates,family.target.coordinates);
 const absent=searchSelection(data,'lady-nana',[]);assert.equal(absent.context,undefined);assert.deepEqual(absent.target.coordinates,family.target.coordinates);
});
test('unlocated suggestion keeps its selected identity and has no invented camera coordinates',()=>{
 const unlocated=data.families.find(f=>!f.anchor),selection=searchSelection(data,unlocated.id,data.specimens);
 assert.equal(selection.familyId,unlocated.id);assert.equal(selection.target.kind,'unlocated');assert.deepEqual(selection.target.coordinates,[]);assert.equal(selection.context,undefined);
});
