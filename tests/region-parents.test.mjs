import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGeographyIndex,regionParents,noGeography,geographyRecordIds,geographyCounts,filterRelatedGeography} from '../lib/geography-index.ts';
import {filterAtlasRecords} from '../lib/record-filters.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const index=buildGeographyIndex(data);
const select=(ids,extra={},geo={})=>filterAtlasRecords(data,{...extra,geographyRecordIds:geographyRecordIds(index,{...noGeography,...geo,region:ids})});
test('real Northern Tokharistan and Sogdiana labels are reachable through explicit ancestors',()=>{
 const north=select(['region:north-tokharistan']).records;
 for(const label of ['Northern Tokharistan / Termez','Northern Tokharistan / Vakhsh','Northern Tokharistan / Vakhsh valley']){
  const families=data.families.filter(f=>f.region===label).map(f=>f.id);
  const records=data.specimens.filter(r=>families.includes(r.familyId));assert.ok(records.length);
  for(const r of records)assert.ok(north.includes(r),r.id);
 }
 assert.equal(north.length,14);assert.deepEqual(select(['region:tokharistan']).records,north);
 const sogd=select(['region:sogdiana']).records;
 for(const label of ['Eastern Sogdiana / Barkat','Eastern Sogdiana / Kabudan','Eastern Sogdiana / Samarkand','Western Sogd / Bukhara','Western Sogd / Paykand','Southern Sogd / Kesh','Panch / Samarkand Sogd']){
  const families=data.families.filter(f=>f.region===label).map(f=>f.id),records=data.specimens.filter(r=>families.includes(r.familyId));assert.ok(records.length,label);assert.ok(records.every(r=>sogd.includes(r)),label);
 }
 assert.equal(sogd.length,349);assert.equal(select(['region:semirechye']).records.length,513);
});
test('parent plus child and multiple paths count one stable record, while AND remains record-level',()=>{
 const parent=select(['region:sogdiana']);assert.deepEqual(select(['region:sogdiana','region:east-sogdiana','region:samarkand','region:barkat']).records,parent.records);
 assert.equal(new Set(parent.records.map(r=>r.id)).size,parent.records.length);
 const counts=geographyCounts(index,data.specimens,{...noGeography,region:['region:samarkand']});assert.equal(counts.get('region:sogdiana'),349);
 const target=select(['region:north-tokharistan'],{sources:['Zeno']},{polity:['polity:termez']}).records;
 assert.ok(target.length);assert.ok(target.every(r=>data.families.find(f=>f.id===r.familyId).region==='Northern Tokharistan / Termez'));
 const nana=select(['region:sogdiana'],{sources:['Bactrianumis']},{polity:['polity:panch'],place:['place:panjakent']}).records;
 assert.equal(nana.length,1);assert.equal(nana[0].id,'zeno-264408');
 assert.equal(select(['region:sogdiana'],{sources:['Bactrianumis']},{polity:['polity:turgesh'],place:['place:panjakent']}).records.length,0);
});
test('related records use the same ancestry without inheriting main-family relations',()=>{
 const record={...data.relatedRecords[0],id:'only-child-category',sourceName:'Zeno',sourcePath:[{categoryId:'866',title:'Original category label'}]};
 const other={...record,id:'other-provider',sourceName:'Other'};
 const fixture={...data,relatedRecords:[record,other]},idx=buildGeographyIndex(fixture);
 assert.deepEqual(filterRelatedGeography(fixture.relatedRecords,idx,{...noGeography,region:['region:sogdiana']}).map(r=>r.id),[record.id]);
 assert.equal(filterRelatedGeography(fixture.relatedRecords,idx,{...noGeography,region:['region:sogdiana','region:bukhara','region:west-sogdiana']}).length,1);
 assert.deepEqual(idx.related.get(record.id).polity,['polity:state:unknown','polity:state:unresolved','polity:state:research']);
 assert.equal(filterRelatedGeography(data.relatedRecords,index,{...noGeography,region:['region:sogdiana']}).length,136);
});
test('disputed labels and direct-label states survive; ancestry cannot imply polity or place',()=>{
 const labels=['Eastern Sogdiana or northern Tokharistan?','Ferghana / Chach attribution disputed','Northern Tokharistan?','Samarkand Sogd / uncertain'];
 const families=labels.map((region,i)=>({...data.families[0],id:'f'+i,region,polity:null,anchor:null,status:'candidate'}));
 const records=families.map((f,i)=>({...data.specimens[0],id:'r'+i,familyId:f.id,sourceName:'Fixture',sourcePath:[]}));
 const fixture={...data,families,specimens:records,relatedRecords:[],evidence:[]},before=JSON.stringify(fixture),idx=buildGeographyIndex(fixture);
 for(const r of records){const m=idx.main.get(r.id);assert.ok(m.region.includes('region:state:unresolved'));assert.ok(m.region.includes('region:state:candidate'));assert.ok(m.region.includes('region:state:research'));assert.ok(m.polity.includes('polity:state:unknown'));assert.ok(m.place.includes('place:state:unknown'))}
 assert.equal(geographyRecordIds(idx,{...noGeography,region:['region:north-tokharistan','region:sogdiana']}).size,0);
 assert.equal(geographyRecordIds(idx,noGeography).size,4);assert.equal(JSON.stringify(fixture),before);
 const clear={...fixture,families:[{...families[0],id:'clear',region:'Northern Tokharistan / Termez'}],specimens:[{...records[0],familyId:'clear'}]};
 const m=buildGeographyIndex(clear).main.get('r0');assert.ok(m.region.includes('region:tokharistan'));assert.ok(!m.region.includes('region:state:multiple'));assert.ok(m.polity.includes('polity:state:unknown'));assert.ok(m.place.includes('place:state:unknown'));
 for(const [child,parents] of Object.entries(regionParents)){assert.ok(child.startsWith('region:'));assert.ok(parents.every(p=>p.startsWith('region:')&&index.nodes.some(n=>n.id===p)))}
});
