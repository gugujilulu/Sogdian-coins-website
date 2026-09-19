import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseRelatedImageIndex,relatedPage,resetRelatedPaging,relatedImage} from '../lib/related-gallery.ts';
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

test('returning to an old search resets pagination before loading more again',()=>{
 let paging={query:'',batches:2};
 const count=()=>relatedPage(atlas.relatedRecords,paging.query,paging.batches).visible.length;
 assert.equal(count(),80);
 paging=resetRelatedPaging(paging,'105744');
 assert.equal(count(),1);
 assert.equal(paging.batches,1);
 paging=resetRelatedPaging(paging,'');
 assert.equal(count(),40);
 assert.equal(relatedPage(atlas.relatedRecords,paging.query).matches.length,701);
 paging={...paging,batches:paging.batches+1};
 assert.equal(count(),80);
 assert.equal(resetRelatedPaging(paging,''),paging);
 paging=resetRelatedPaging(paging,'Chach');
 paging={...paging,batches:2};
 paging=resetRelatedPaging(paging,'105744');
 paging=resetRelatedPaging(paging,'Chach');
 assert.equal(paging.batches,1);
});

test('details keep each image provenance and select by record ID plus image ID',()=>{
 const first={...saved.records[0].images[0]};
 const second={...first,id:'second-photo',credit:'Second uploader',sourceRecordUrl:'https://example.org/record/2',sourceUrl:'https://example.org/photo/2.jpg',rightsStatus:null,width:null,height:null};
 const input={records:[{relatedRecordId:'fixture',images:[second,first]}]};
 const index=parseRelatedImageIndex(input);
 assert.equal(relatedImage(index,'fixture',first.id).credit,first.credit);
 const selected=relatedImage(index,'fixture','second-photo');
 assert.equal(selected.credit,'Second uploader');
 assert.equal(selected.sourceRecordUrl,second.sourceRecordUrl);
 assert.equal(selected.rightsStatus,null);assert.equal(selected.width,null);
 assert.equal(relatedImage(index,'other','second-photo'),undefined);
 assert.equal(relatedImage(index,'fixture','absent'),undefined);
 assert.equal(relatedImage(null,'fixture',first.id),undefined);
 assert.equal('localPath' in selected,false);assert.equal('sha256' in selected,false);
 assert.throws(()=>parseRelatedImageIndex({records:[{relatedRecordId:'fixture',images:[first,first]}]}));
 const unknown=parseRelatedImageIndex({records:[{relatedRecordId:'missing',images:[{id:'x',path:'/coins/x.jpg',sourceUrl:'javascript:alert(1)'}]}]});
 assert.equal(relatedImage(unknown,'missing','x').credit,null);
 assert.equal(relatedImage(unknown,'missing','x').sourceUrl,null);
});
