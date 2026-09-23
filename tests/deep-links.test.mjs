import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseLink,serializeLink,validateLink,ancestorNodes} from '../lib/deep-links.ts';
import {buildCatalogueTree} from '../lib/catalogue-tree.ts';
import {buildSourceTree} from '../lib/source-tree.ts';
import {projectSourceIndex} from '../lib/source-index.ts';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const data=read('../public/data/atlas.json'),index=read('../public/data/source-index.json');
const tree=buildCatalogueTree(data,data.specimens,new Map()),sources=buildSourceTree(projectSourceIndex(index,data.specimens).groups.flatMap(g=>g.entries));
const validate=(link,nodes=sources.nodes,failed=false)=>validateLink(link,data,tree,nodes,failed);
test('all object namespaces roundtrip with stable IDs and escaped provider/path',()=>{
 const group=tree.families.find(f=>f.family.id==='lady-nana').groups[0].id;
 const source=[...sources.nodes.values()].find(n=>n.kind==='source'&&n.entries.some(e=>e.specimen.id==='zeno-264408'));
 const cases=[{view:'atlas',family:'lady-nana'},{view:'catalogue',family:'lady-nana',group},{view:'catalogue',group:'unassigned:lady-nana'},{view:'catalogue',panel:'sources',node:source.id},{view:'catalogue',panel:'sources',node:JSON.stringify(['Zeno'])},{view:'atlas',record:'sr9'},{view:'catalogue',panel:'related',related:data.relatedRecords[0].id}];
 for(const link of cases){assert.deepEqual(parseLink(serializeLink(link)),link);assert.equal(validate(link),'ready')}
 const encoded={view:'catalogue',panel:'sources',node:JSON.stringify(['A & B/中文','category:x+y#?','source:external:A%20'])};assert.deepEqual(parseLink(serializeLink(encoded)),encoded);
 assert.equal(ancestorNodes(source.id).at(-1),source.id);
});
test('legacy legal view/family/source/record links and unsupported old values',()=>{
 for(const hash of ['#view=atlas&family=lady-nana','#record=sr9','#view=catalogue&source=Zeno','#source=__related__','#source=__references__','#view=catalogue&family=lady-nana&source=Zeno&record=sr9'])assert.equal(validate(parseLink(hash)),'ready');
 for(const hash of ['#view=bogus','#source=__tree__','#record=sr9&record=sr9','#record=%ZZ','#unknown=x','#related=x&record=sr9','#panel=wrong','#node=[]','#node=not-json','#record='])assert.throws(()=>parseLink(hash));
});
test('missing targets, context mismatches, and failed vs pending indexes are distinct',()=>{
 for(const link of [{view:'atlas',family:'missing'},{view:'atlas',record:'missing'},{view:'catalogue',group:'missing'},{view:'catalogue',related:'missing'},{view:'atlas',family:'lady-nana',record:'sr9'}])assert.throws(()=>validate(link));
 const link={view:'catalogue',panel:'sources',node:JSON.stringify(['Zeno','category:nonexistent'])};assert.equal(validate(link,null),'waiting');assert.throws(()=>validate(link,null,true),/索引加载失败/);assert.throws(()=>validate(link),/路径不存在/);
 const nana=[...sources.nodes.values()].find(n=>n.kind==='source'&&n.entries.some(e=>e.specimen.id==='zeno-264408'));assert.throws(()=>validate({...link,node:nana.id,record:'sr9'}),/不匹配/);
});
test('same category in two parent paths restores exact occurrence and original external entity',()=>{
 const entry=sources.roots[0].entries[0],paths=[[{categoryId:'a',title:'first'},{categoryId:'c',title:'shared'}],[{categoryId:'b',title:'second'},{categoryId:'c',title:'shared'}]];
 const fixture=buildSourceTree([{...entry,source:{...entry.source,paths}}]);
 const leaves=[...fixture.nodes.values()].filter(n=>n.kind==='source');assert.equal(leaves.length,2);assert.equal(leaves[0].entityId,entry.source.id);
 for(const leaf of leaves){const route=parseLink(serializeLink({view:'catalogue',panel:'sources',node:leaf.id,record:entry.specimen.id}));assert.equal(validate(route,fixture.nodes),'ready');assert.equal(route.node,leaf.id)}
});
