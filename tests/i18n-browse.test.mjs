import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogueGroupTitle,familyTitle,catalogueExpansion,sourceNodeTitle,relatedProgress} from '../lib/browse-copy.ts';
import {geographyName,countLabel,tr,formatCopy} from '../lib/i18n.ts';
import {buildCatalogueTree} from '../lib/catalogue-tree.ts';
import {buildSourceTree} from '../lib/source-tree.ts';
import {projectSourceIndex} from '../lib/source-index.ts';
import {parseRelatedImageIndex,relatedPage,resetRelatedPaging,relatedImage} from '../lib/related-gallery.ts';
import {selectedImage} from '../lib/image-viewer.ts';
import {buildGeographyIndex} from '../lib/geography-index.ts';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const atlas=read('../public/data/atlas.json'),index=read('../public/data/source-index.json');
const projection=projectSourceIndex(index,atlas.specimens),tree=buildCatalogueTree(atlas,atlas.specimens,projection.byRecord);

test('actual tree display projections retain IDs/order and search expansion across all locales',()=>{
 const family=tree.families.find(f=>f.family.id==='lady-nana');
 const ancestors=[family.id,...family.groups.map(g=>g.id)],search='Nana|'+ancestors.join('|');
 let expanded=new Set(['unrelated-node']);
 expanded=catalogueExpansion(expanded,'',search,'Nana',ancestors);
 for(const locale of ['en','zh','ru']){
  assert.equal(catalogueExpansion(expanded,search,search,'Nana',ancestors),expanded);
  assert.ok(expanded.has(family.id));assert.ok(expanded.has('unrelated-node'));
  const before=family.groups.map(g=>g.id);familyTitle(family.family,locale);family.groups.forEach(g=>catalogueGroupTitle(g,locale));assert.deepEqual(family.groups.map(g=>g.id),before);
 }
 assert.equal(catalogueExpansion(expanded,search,'|','',[]),expanded);
 const unknown=tree.families.flatMap(f=>f.groups).find(g=>!g.group);
 assert.equal(catalogueGroupTitle(unknown,'en'),'Ungrouped');assert.equal(catalogueGroupTitle(unknown,'ru'),'Без группы');
 assert.equal(familyTitle(family.family,'ru'),family.family.title);
 assert.equal(tree.recordCount,1010);assert.equal(tree.groupCount,120);assert.equal(tree.families.length,56);
});
test('source occurrence display keeps raw paths, unresolved identity and independent reference counts',()=>{
 const sourceTree=buildSourceTree(projection.groups.flatMap(g=>g.entries));
 const keys=[...sourceTree.nodes.keys()];
 for(const locale of ['en','zh','ru']){
  for(const node of sourceTree.nodes.values())assert.ok(sourceNodeTitle(node,locale));
  assert.deepEqual([...sourceTree.nodes.keys()],keys);
  assert.deepEqual([sourceTree.sourceCount,sourceTree.associationCount,sourceTree.recordCount],[1006,1013,1010]);
 }
 assert.equal(new Set(projection.references.map(e=>e.source.id)).size,5);assert.equal(projection.references.length,7);
 const missing=[...sourceTree.nodes.values()].find(n=>n.kind==='missing');assert.equal(sourceNodeTitle(missing,'en'),'Category path not recorded');
 const pending=[...sourceTree.nodes.values()].find(n=>n.kind==='source'&&n.entries[0].source.identityStatus!=='resolved');assert.ok(sourceNodeTitle(pending,'en').includes('ID unresolved'));assert.ok(sourceNodeTitle(pending,'en').includes(pending.entries[0].source.labels[0]));
 assert.equal(countLabel(1,'sources','en'),'1 source record');assert.equal(countLabel(2,'associations','ru'),'2 связи');assert.equal(countLabel(5,'associations','ru'),'5 связей');
});
test('actual paging/selected-image calls retain 80 records across copy changes; search reset still works',()=>{
 const images=parseRelatedImageIndex(read('../public/data/related-images.json'));
 let paging={query:'',batches:2};const selected=atlas.relatedRecords[0],im=images.get(selected.id)[0];
 for(const locale of ['en','zh','ru']){
  const same=resetRelatedPaging(paging,'');assert.equal(same,paging);
  const page=relatedPage(atlas.relatedRecords,'',same.batches);assert.equal(page.visible.length,80);
  assert.ok(relatedProgress(page.visible.length,page.matches.length,locale).includes('80'));
  assert.equal(relatedImage(images,selected.id,im.id),im);assert.equal(selectedImage(images.get(selected.id),im.id),im);
 }
 paging=resetRelatedPaging(paging,'105744');assert.equal(relatedPage(atlas.relatedRecords,paging.query,paging.batches).visible.length,1);
 paging=resetRelatedPaging(paging,'');assert.equal(relatedPage(atlas.relatedRecords,'',paging.batches).visible.length,40);
 assert.equal(images.size,701);
 for(const locale of ['en','zh','ru']){assert.ok(tr('图片索引加载失败，文字资料和来源链接仍可访问。',locale));assert.ok(tr('重试图片索引',locale));assert.ok(formatCopy('查看详情：{title}',{title:selected.title},locale).includes(selected.title))}
});
test('geography option and summary share names, states and recorded-name fallback',()=>{
 const geography=buildGeographyIndex(atlas);
 const n=geography.nodes.find(n=>n.id==='region:semirechye');
 assert.equal(geographyName(n,'en'),n.name);assert.equal(geographyName(n,'zh'),n.zh);assert.equal(geographyName(n,'ru'),n.name);
 const unknown=geography.nodes.find(n=>n.id==='region:state:unknown');assert.equal(geographyName(unknown,'en'),'Unassigned / unknown');
 assert.equal(geographyName(undefined,'ru','region:absent'),'region:absent');
 assert.equal(geographyName({id:'region:test',name:'Fallback',zh:'原始标签（中文未记录）'},'zh'),'Fallback');
});
