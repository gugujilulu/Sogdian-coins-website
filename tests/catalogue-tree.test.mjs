import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCatalogueTree,renderCatalogueMarkdown} from '../lib/catalogue-tree.ts';
import {projectSourceIndex} from '../lib/source-index.ts';
import {filterAtlasRecords} from '../lib/record-filters.ts';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const atlas=read('../public/data/atlas.json'),index=read('../public/data/source-index.json');
const sources=projectSourceIndex(index,atlas.specimens).byRecord;
const all=()=>buildCatalogueTree(atlas,atlas.specimens,sources);
const ids=tree=>tree.families.flatMap(f=>f.groups.flatMap(g=>g.records.map(r=>r.id)));

test('full tree preserves all records, T06 families, catalogue groups and unknown access',()=>{
 const before=JSON.stringify(atlas),tree=all();
 assert.equal(tree.families.length,56);assert.equal(tree.groupCount,120);assert.equal(tree.recordCount,1010);assert.equal(tree.unassignedCount,10);
 assert.equal(new Set(ids(tree)).size,1010);
 assert.deepEqual(ids(tree).sort(),atlas.specimens.map(s=>s.id).sort());
 for(const f of tree.families){
  assert.equal(f.id,'taxonomy:family:'+f.family.id);
  for(const g of f.groups)for(const entry of g.records){
   assert.equal(entry.record.familyId,f.family.id);
   assert.equal(entry.record.variantId,g.group?.id??null);
   assert.equal(entry.record,atlas.specimens.find(s=>s.id===entry.id));
  }
 }
 assert.ok(tree.families.some(f=>f.family.start===null));
 assert.ok(tree.families.some(f=>!f.family.anchor));
 const nana=tree.families.find(f=>f.family.id==='lady-nana');
 assert.equal(nana.recordCount,20);assert.equal(nana.groups.flatMap(g=>g.records).reduce((n,r)=>n+r.record.images.length,0),22);
 const multi=nana.groups.flatMap(g=>g.records).find(r=>r.id==='zeno-264408');
 assert.equal(multi.sources.length,2);
 assert.equal(JSON.stringify(atlas),before);
});
test('search matches actual source IDs, group and family names without cross-record matches',()=>{
 assert.deepEqual(ids(buildCatalogueTree(atlas,atlas.specimens,sources,'20696')),['sr9']);
 const nana=buildCatalogueTree(atlas,atlas.specimens,sources,'Lady Nana of Panch');assert.equal(nana.recordCount,20);
 const group=atlas.variants.find(g=>g.familyId==='lady-nana');
 const result=buildCatalogueTree(atlas,atlas.specimens,sources,group.title);
 assert.ok(ids(result).includes(atlas.specimens.find(s=>s.variantId===group.id).id));
 const subset=filterAtlasRecords(atlas,{sources:['Bactrianumis'],familyIds:['lady-nana']}).records;
 assert.deepEqual(ids(buildCatalogueTree(atlas,subset,sources,'')),['zeno-264408']);
 assert.equal(buildCatalogueTree(atlas,subset,sources,'20696').recordCount,0);
 assert.equal(buildCatalogueTree(atlas,subset,sources,'').recordCount,1);
 assert.equal(all().recordCount,1010);
 // A comparison-only ID must not make CNG's record match.
 const cng=atlas.specimens.filter(s=>s.id==='cng611-576');
 assert.equal(buildCatalogueTree(atlas,cng,sources,'81165').recordCount,0);
});
test('stable nodes survive ordering and multiple source associations; document uses same full tree',()=>{
 const tree=all(),again=buildCatalogueTree(atlas,[...atlas.specimens,...atlas.specimens],sources);
 assert.deepEqual(ids(again),ids(tree));
 assert.deepEqual(tree.families.map(f=>f.id),again.families.map(f=>f.id));
 const md=renderCatalogueMarkdown(tree);
 assert.equal(md,renderCatalogueMarkdown(all()));
 assert.equal(md,readFileSync(new URL('../docs/catalogue/ATLAS-CATALOGUE.md',import.meta.url),'utf8'));
 assert.equal(md.split('\n').filter(line=>line.startsWith('- `')).length,1010);
 for(const id of ids(tree))assert.ok(md.includes('- `'+id+'` —'));
});
