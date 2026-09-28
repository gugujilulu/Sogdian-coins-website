import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGeographyIndex,noGeography,geographyRecordIds,geographyCounts,filterRelatedGeography,resolveGeography} from '../lib/geography-index.ts';
import {filterAtlasRecords} from '../lib/record-filters.ts';
import {viewedRecord,collectionReturn,emptyFilters} from '../lib/map-selection.ts';
import {parseLink,serializeLink} from '../lib/deep-links.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const idx=buildGeographyIndex(data);
const base=data.specimens[0],family=data.families[0];
const fixture={...data,families:[{...family,id:'f1',region:'Semirechye',polity:'Türgesh',anchor:{placeId:'suyab'},start:600,end:800},{...family,id:'f2',region:'Chach',polity:'Chach',anchor:{placeId:'chach'}},{...family,id:'missing',region:'',polity:null,anchor:null}],specimens:[{...base,id:'a',familyId:'f1',sourceName:'Fixture',sourcePath:[],facets:['legend X','tamgha X','round'],sources:[{label:'Zeno',url:'https://www.zeno.ru/showphoto.php?photo=1',relation:'same_specimen'}]},{...base,id:'b',familyId:'f2',sourceName:'Fixture',sourcePath:[]},{...base,id:'c',familyId:'missing',sourceName:'Fixture',sourcePath:[]}],relatedRecords:[],evidence:[]};
const fi=buildGeographyIndex(fixture);
const select=(patch={},extra={})=>filterAtlasRecords(fixture,{...extra,geographyRecordIds:geographyRecordIds(fi,{...noGeography,...patch})}).records.map(r=>r.id);
test('single dimensions, cross-dimension AND, same dimension OR and explicit missing states',()=>{
 for(const patch of [{region:['region:semirechye']},{polity:['polity:turgesh']},{place:['place:suyab']},{region:['region:semirechye'],polity:['polity:turgesh']},{region:['region:semirechye'],place:['place:suyab']},{polity:['polity:turgesh'],place:['place:suyab']}])assert.deepEqual(select(patch),['a']);
 assert.deepEqual(select({region:['region:semirechye'],polity:['polity:chach']}),[]);
 assert.deepEqual(select({region:['region:semirechye','region:chach']}),['a','b']);
 for(const d of ['region','polity','place'])assert.deepEqual(select({[d]:[`${d}:state:unknown`]}),['c']);
 assert.deepEqual(select(),['a','b','c']);
});
test('all existing record conditions compose without changing or silently clearing selection',()=>{
 const selection={region:['region:semirechye']},before=JSON.stringify(selection);
 const conditions={date:{mode:'year',year:700},sources:['Zeno'],inscriptions:['legend X'],tamghas:['tamgha X'],features:['round']};
 assert.deepEqual(select(selection,conditions),['a']);
 assert.deepEqual(select(selection,{...conditions,features:['absent']}),[]);assert.equal(JSON.stringify(selection),before);
 assert.deepEqual(select(),['a','b','c']);
});
test('faceted counts ignore own dimension, keep candidate zero options, never invent relations',()=>{
 const counts=geographyCounts(fi,fixture.specimens,{...noGeography,polity:['polity:turgesh']});
 assert.equal(counts.get('region:semirechye'),1);assert.equal(counts.get('region:chach'),0);
 for(const id of ['polity:qarakhanid','polity:uyghur','region:north-afghanistan','region:northeast-afghanistan','region:tarim']){
 const n=idx.nodes.find(n=>n.id===id);assert.ok(n);assert.equal(n.status,'candidate');assert.equal(n.evidenceState,'not yet mapped');assert.ok(n.references.length);
 }
 assert.ok(idx.nodes.every(n=>n.references.length&&n.source_status));
 assert.ok(idx.nodes.filter(n=>n.roles.length).every(n=>n.roles.every(r=>r==='display anchor')));
});
test('related membership uses exact provider category IDs; missing place remains explicitly unknown',()=>{
 const records=[{...data.relatedRecords[0],id:'x',sourceName:'Zeno',sourcePath:[{categoryId:'795',title:'anything'}]},{...data.relatedRecords[0],id:'y',sourceName:'Other',sourcePath:[{categoryId:'795',title:'Türgesh'}]}];
 const index=buildGeographyIndex({...fixture,relatedRecords:records});
 assert.deepEqual(filterRelatedGeography(records,index,{...noGeography,polity:['polity:turgesh']}).map(r=>r.id),['x']);
 assert.equal(filterRelatedGeography(records,index,{...noGeography,place:['place:state:unknown']}).length,2);
 assert.equal(filterRelatedGeography(records,index,noGeography).length,2);
});
test('viewed family/hires record and original collection survive zero, one and restored matches',()=>{
 const record=fixture.specimens[0],context={placeIds:['suyab'],familyIds:['f1'],scrollTop:82};
 assert.equal(viewedRecord(fixture.specimens,record.id,[]).record,record);assert.equal(viewedRecord(fixture.specimens,record.id,[]).matches,false);
 assert.equal(viewedRecord(fixture.specimens,record.id,[record]).matches,true);
 const empty=collectionReturn([],context);assert.equal(empty.context,context);assert.deepEqual(empty.groups,[]);
 const group={place:{id:'suyab'},members:[{family:{id:'f1'}}]};assert.equal(collectionReturn([group],empty.context).groups[0].members.length,1);
 assert.equal(context.scrollTop,82);
});
test('URL copy/refresh/history snapshots preserve every filter and object without conflating membership',()=>{
 const {region,polity,city,...filters}=emptyFilters;
 const link={view:'atlas',family:'lady-nana',record:'sr9',region:['region:semirechye','region:chach'],polity:['polity:turgesh'],city:['place:suyab'],filters:{...filters,query:'a & 中文',dateMode:'unknown',sourceFilter:'Zeno',inscriptionFilter:'铭文',tamghaFilter:'x',featureFilter:'y',statusFilter:'candidate'}};
 const restored=parseLink(serializeLink(link));assert.deepEqual(restored,{...link,region:[...link.region].sort()});
 assert.deepEqual(parseLink('#view=atlas&place=place%3Asuyab').city,['place:suyab']);
 assert.deepEqual(resolveGeography(idx,{region:['Semirechye'],polity:['Türgesh'],place:['suyab']}),{region:['region:semirechye'],polity:['polity:turgesh'],place:['place:suyab']});
 for(const hash of ['#region=x&region=x','#city=x&place=y','#filters=%7B%7D'])assert.throws(()=>parseLink(hash));
 assert.throws(()=>resolveGeography(idx,{...noGeography,region:['invented']}));
 const states=[{view:'atlas'},{...link,record:undefined},{...link}].map(serializeLink);assert.equal(parseLink(states[1]).record,undefined);assert.equal(parseLink(states[2]).record,'sr9');
});
test('real baseline and all source/unknown records remain immutable; no filters return every record',()=>{
 const before=JSON.stringify(data);buildGeographyIndex(data);
 assert.equal(JSON.stringify(data),before);assert.equal(geographyRecordIds(idx,noGeography).size,1010);
 assert.equal(data.families.length,56);assert.equal(data.variants.length,120);assert.equal(data.specimens.flatMap(r=>r.images).length,1013);assert.equal(idx.related.size,701);
 const nana=data.specimens.filter(r=>r.familyId==='lady-nana');assert.equal(nana.length,20);assert.equal(nana.flatMap(r=>r.images).length,22);assert.equal(data.coverage.importedZenoRecords,14);assert.equal(data.coverage.zenoRecordCount,14);
});
test('continuous search/year edits replace history; discrete filters and object navigation push',async()=>{
 const {linkHistoryMode}=await import('../lib/deep-links.ts');const {region,polity,city,...filters}=emptyFilters;
 const link={view:'atlas',filters};const before=serializeLink(link);
 assert.equal(linkHistoryMode(before,serializeLink({...link,filters:{...filters,query:'Nana'}})),'replaceState');
 assert.equal(linkHistoryMode(before,serializeLink({...link,filters:{...filters,year:700}})),'replaceState');
 assert.equal(linkHistoryMode(before,serializeLink({...link,region:['region:semirechye']})),'pushState');
 assert.equal(linkHistoryMode(before,serializeLink({...link,family:'lady-nana'})),'pushState');
});
