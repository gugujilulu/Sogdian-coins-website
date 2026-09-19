import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseRelatedImageIndex,relatedPage} from '../lib/related-gallery.ts';
const atlas=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const saved=JSON.parse(readFileSync(new URL('../public/data/related-images.json',import.meta.url)));

test('related image join is ID based even when index order changes',()=>{
 const index=parseRelatedImageIndex({...saved,records:[...saved.records].reverse()});
 assert.equal(index.size,701);
 assert.equal(saved.records.reduce((n,r)=>n+r.images.length,0),701);
 for(const row of saved.records) assert.equal(index.get(row.relatedRecordId)[0].path,row.images[0].path);
 assert.equal(atlas.specimens.length,1010);
});
test('40-record batches, filtered count, empty search and reset are independent of main counts',()=>{
 const before=JSON.stringify(atlas.relatedRecords);
 assert.equal(relatedPage(atlas.relatedRecords,'').visible.length,40);
 assert.equal(relatedPage(atlas.relatedRecords,'',2).visible.length,80);
 assert.equal(relatedPage(atlas.relatedRecords,'',100).visible.length,701);
 const hit=relatedPage(atlas.relatedRecords,'Zeno 105744');
 assert.equal(hit.matches.length,1);assert.equal(hit.visible[0].id,'zeno-105744');
 assert.equal(relatedPage(atlas.relatedRecords,'not-a-real-source-xyz').visible.length,0);
 assert.equal(relatedPage(atlas.relatedRecords,'').matches.length,701);
 assert.equal(JSON.stringify(atlas.relatedRecords),before);
});
test('missing image stays empty; malformed and duplicate indexes fail rather than misassociate',()=>{
 assert.deepEqual(parseRelatedImageIndex({records:[{relatedRecordId:'x',images:[]}]}).get('x'),[]);
 for(const value of [null,{}, {records:[saved.records[0],saved.records[0]]}, {records:[{relatedRecordId:'x',images:[{id:'bad',path:'https://example.test/a',width:1,height:1}]}]}]) assert.throws(()=>parseRelatedImageIndex(value));
});
