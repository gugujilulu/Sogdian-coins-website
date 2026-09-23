import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSourceTree,coverageFor} from '../lib/source-tree.ts';
import {projectSourceIndex} from '../lib/source-index.ts';
import {filterAtlasRecords} from '../lib/record-filters.ts';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const atlas=read('../public/data/atlas.json'),index=read('../public/data/source-index.json'),coverage=read('../public/data/source-coverage.json');
const entries=records=>projectSourceIndex(index,records).groups.flatMap(g=>g.entries);
test('real tree preserves actual counts, pending sources, sr9 and separate comparison',()=>{
 const tree=buildSourceTree(entries(atlas.specimens));
 assert.deepEqual([tree.sourceCount,tree.associationCount,tree.recordCount],[1006,1013,1010]);
 const found=buildSourceTree(entries(atlas.specimens),'20696');
 assert.equal(found.recordCount,1);
 const leaf=[...found.nodes.values()].find(n=>n.kind==='source');assert.equal(leaf.entries[0].specimen.id,'sr9');
 assert.ok([...found.nodes.values()].some(n=>n.kind==='missing'));
 const nana=buildSourceTree(entries(atlas.specimens),'zeno-264408');assert.equal(nana.sourceCount,2);assert.equal(nana.recordCount,1);
 assert.equal(new Set([...tree.nodes.values()].filter(n=>n.kind==='source'&&n.entries[0].source.identityStatus==='pending_resolution').map(n=>n.entityId)).size,6);
 const cng=atlas.specimens.filter(s=>s.id==='cng611-576');assert.equal(buildSourceTree(entries(cng),'81165').sourceCount,0);
});
test('multiple path occurrences use shared entities and set counts; titles do not define identity',()=>{
 const entry=entries(atlas.specimens)[0];
 const paths=[[{categoryId:'1',title:'A'},{categoryId:'3',title:'Same'}],[{categoryId:'2',title:'B'},{categoryId:'3',title:'Same'}]];
 const fixture={...entry,source:{...entry.source,paths}};
 const tree=buildSourceTree([fixture,fixture]);
 assert.deepEqual([tree.sourceCount,tree.associationCount,tree.recordCount],[1,1,1]);
 const occurrences=[...tree.nodes.values()].filter(n=>n.categoryId==='3');assert.equal(occurrences.length,2);assert.equal(occurrences[0].entityId,occurrences[1].entityId);assert.notEqual(occurrences[0].id,occurrences[1].id);
 assert.equal([...tree.nodes.values()].filter(n=>n.kind==='source').length,2);
 assert.equal(buildSourceTree([fixture],'A').recordCount,1);
 const rename={...fixture,source:{...fixture.source,paths:paths.map(p=>p.map(n=>({...n,title:n.title+' renamed'})))}};
 assert.deepEqual([...buildSourceTree([rename]).nodes.keys()],[...tree.nodes.keys()]);
});
test('filters, empty query and coverage snapshots stay independent',()=>{
 const subset=filterAtlasRecords(atlas,{sources:['Bactrianumis'],familyIds:['lady-nana']}).records;
 const tree=buildSourceTree(entries(subset));assert.equal(tree.recordCount,1);assert.equal(tree.sourceCount,2);
 assert.equal(buildSourceTree(entries(subset),'20696').recordCount,0);
 assert.equal(buildSourceTree(entries(subset),'').recordCount,1);
 const node=[...tree.nodes.values()].find(n=>n.categoryId==='3106');
 assert.equal(coverageFor(node,coverage)[0].count,14);
 const full=[...buildSourceTree(entries(atlas.specimens)).nodes.values()].find(n=>n.categoryId==='3106');
 assert.deepEqual(coverageFor(node,coverage),coverageFor(full,coverage));
 assert.deepEqual(coverageFor({...node,provider:'Other'},coverage),[]);
 assert.ok(coverage.some(c=>c.categoryId==='503'&&c.note.includes('分页')));
});
test('coverage projection preserves original dated evidence and known gaps',()=>{
 const scopes=read('../research/coverage-scopes.json');
 const gaps=read('../research/zeno/coverage-gaps-503.json');
 for(const row of scopes){const hit=coverage.find(c=>c.evidence==='research/coverage-scopes.json'&&c.categoryId===String(row.categoryId));assert.equal(hit.count,row.sourcePhotoCount);assert.equal(hit.date,row.date)}
 for(const row of gaps.recoveryPriorityCategories){const hit=coverage.find(c=>c.evidence==='research/zeno/coverage-gaps-503.json'&&c.categoryId===String(row.categoryId));assert.equal(hit.count,row.observedDirectCount);assert.ok(hit.note.includes('已知缺口 '+row.knownDirectShortfall));assert.equal(hit.date,gaps.generatedOn)}
});
