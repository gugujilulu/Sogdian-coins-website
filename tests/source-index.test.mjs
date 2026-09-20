import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectSourceIndex} from '../lib/source-index.ts';
import {filterAtlasRecords} from '../lib/record-filters.ts';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const atlas=read('../public/data/atlas.json'),index=read('../public/data/source-index.json');

test('actual identities, associations and corpus counts are distinct',()=>{
 const before=JSON.stringify([atlas,index]);
 const p=projectSourceIndex(index,atlas.specimens);
 assert.equal(p.associationCount,1013);assert.equal(p.recordCount,1010);assert.equal(p.references.length,7);
 assert.equal(p.byRecord.get('sr9').find(e=>e.source.provider==='Zeno').source.recordKey,'20696');
 const nana=p.byRecord.get('zeno-264408');
 assert.deepEqual(nana.map(e=>e.source.provider).sort(),['Bactrianumis','Zeno']);
 for(const entry of nana)assert.equal(p.bySource.get(entry.source.id)[0].specimen.id,'zeno-264408');
 assert.deepEqual(nana.find(e=>e.source.provider==='Bactrianumis').source.paths,[]);
 assert.ok(nana.find(e=>e.source.provider==='Zeno').source.paths.length);
 assert.ok(p.references.some(e=>e.specimen.id==='cng611-576'&&e.source.recordKey==='81165'));
 assert.equal(p.byRecord.get('cng611-576').length,1);
 assert.equal(JSON.stringify([atlas,index]),before);
 console.log(JSON.stringify({sourceCount:p.sourceCount,associationCount:p.associationCount,recordCount:p.recordCount,referenceSources:new Set(p.references.map(e=>e.source.id)).size,groups:p.groups.map(g=>[g.source,g.sourceCount,g.entries.length,g.recordCount]),pending:[...p.bySource.values()].filter(es=>es[0].source.identityStatus!=='resolved').length}));
});
test('filtered result, catalogue query and duplicate links do not reintroduce records',()=>{
 const records=filterAtlasRecords(atlas,{sources:['Bactrianumis'],familyIds:['lady-nana']}).records;
 const p=projectSourceIndex(index,records);
 assert.equal(p.recordCount,1);assert.equal(p.associationCount,2);
 assert.equal(p.groups.length,2);
 assert.ok(p.groups.every(g=>g.entries.every(e=>e.specimen===records[0])));
 const hit=projectSourceIndex(index,atlas.specimens,'20696');
 assert.equal(hit.recordCount,1);assert.equal(hit.byRecord.get('sr9')[0].source.recordKey,'20696');
 assert.equal(projectSourceIndex(index,[]).groups.length,0);
 assert.equal(projectSourceIndex(index,atlas.specimens,'no-such-id-xxx').recordCount,0);
 const doubled={...index,links:[...index.links,...index.links]};
 assert.equal(projectSourceIndex(doubled,atlas.specimens).associationCount,1013);
});
