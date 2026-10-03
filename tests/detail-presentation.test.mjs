import test from 'node:test';
import assert from 'node:assert/strict';
import {detailCloseTarget,sourceIdentity} from '../lib/detail-presentation.ts';
import {selectedImage} from '../lib/image-viewer.ts';
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
test('presentation changes retain a selected image by its stable ID',()=>{
 const images=[{id:'face-a',path:'/a.jpg'},{id:'face-b',path:'/b.jpg'}];
 const viewed=selectedImage(images,'face-b');
 for(const expanded of [false,true,false]){detailCloseTarget(expanded);assert.equal(selectedImage(images,'face-b'),viewed)}
});
