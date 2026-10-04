import test from 'node:test';
import assert from 'node:assert/strict';
import {familyTitle,familyDescription,familyCount,referenceTitle} from '../lib/browse-copy.ts';

test('generic import labels cannot replace a family name; recorded scholarly names remain',()=>{
 const family={title:'Türgesh kagan: tamgha reverse',zh:'目录候选类型'};
 assert.equal(familyTitle(family,'zh'),family.title);
 assert.equal(familyTitle({title:'Lady Nana of Panch',zh:'潘治的娜娜夫人'},'zh'),'潘治的娜娜夫人');
 assert.equal(familyTitle({title:'Fallback',zh:'Distinct attribution under discussion'},'zh'),'Distinct attribution under discussion');
 assert.equal(familyTitle(family,'ru'),family.title);
});
test('only the known gallery sentence is removed; differing scholarly claims are preserved',()=>{
 const claims='Sources differ in date, face order and the interpretation of Nana.';
 assert.equal(familyDescription(claims+' The gallery preserves catalogue groupings and individual specimens.','en'),claims);
 assert.equal(familyDescription('A source discusses individual specimens and catalogue groupings.','en'),'A source discusses individual specimens and catalogue groupings.');
 const raw='Square-holed cast bronze with a Sogdian legend and the Panch tamgha. '+claims+' The gallery preserves catalogue groupings and individual specimens.';
 assert.match(familyDescription(raw,'zh'),/各来源对年代、正反面顺序及娜娜的解释有所不同/);
 assert.match(familyDescription(raw,'ru'),/Источники расходятся/);
});
test('subset, empty and complete counts identify records and images in each language',()=>{
 assert.equal(familyCount(164,165,164,'en'),'Showing 164 of 165 records · 164 images');
 assert.equal(familyCount(5,8,6,'zh'),'显示 5／8 条记录 · 6 张图片');
 assert.equal(familyCount(0,1,0,'ru'),'Показано: 0 · В семействе: 1 запись · 0 изображений');
 assert.equal(familyCount(1,1,1,'en'),'1 record · 1 image');
});
test('citation display changes figure/page labels and preserves original titles and numbers',()=>{
 const citation='Yuri Bregel, An Historical Atlas of Central Asia, 2003, 第15图，p.31';
 assert.equal(referenceTitle(citation,'en'),'Yuri Bregel, An Historical Atlas of Central Asia, 2003, Fig. 15，p. 31');
 assert.equal(referenceTitle(citation,'ru'),'Yuri Bregel, An Historical Atlas of Central Asia, 2003, Рис. 15，с. 31');
 assert.equal(referenceTitle('Title, 图1–3, pp.35–39, 更新2013','zh'),'Title, 第1–3图, 第35–39页, 更新2013');
 assert.equal(referenceTitle('Original title and author, 1981','ru'),'Original title and author, 1981');
});
