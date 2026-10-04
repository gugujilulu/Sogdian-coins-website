import test from 'node:test';
import assert from 'node:assert/strict';
import {detailCloseTarget,sourceIdentity,distinctSourceLinks,recordDescription} from '../lib/detail-presentation.ts';
test('closing expanded image returns to the same record before closing the record',()=>{
 assert.equal(detailCloseTarget(true),'image');
 assert.equal(detailCloseTarget(false),'record');
});
test('source display does not duplicate a provider or expose a fallback internal record ID',()=>{
 assert.equal(sourceIdentity('Zeno','Zeno 264408'),'Zeno 264408');
 assert.equal(sourceIdentity('Zeno','264408'),'Zeno 264408');
 assert.equal(sourceIdentity('CNG',null),'CNG');
 assert.equal(sourceIdentity(null,null),'');
});

test('detail source links remove identical URLs without merging distinct records',()=>{
 const links=[{url:'https://zeno.ru/?photo=1',label:'Zeno 1'},{url:'https://zeno.ru/?photo=1',label:'Original record'},{url:'https://catalogue.test/33',label:'Catalogue 33'}];
 assert.deepEqual(distinctSourceLinks(links),[links[0],links[2]]);
 assert.equal(links.length,3);
});
test('only the current leading record number is removed from the display description',()=>{
 assert.equal(recordDescription('#388312 - Lady Nana, AE unit.','388312'),'Lady Nana, AE unit.');
 assert.equal(recordDescription(' #388312 — Lady Nana.','Zeno 388312'),'Lady Nana.');
 assert.equal(recordDescription('#123 - comparison with 388312','388312'),'#123 - comparison with 388312');
 assert.equal(recordDescription('Dates 709–722; catalogue 245.','388312'),'Dates 709–722; catalogue 245.');
 assert.equal(recordDescription('#1 - raw description'), '#1 - raw description');
});
