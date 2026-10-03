import test from 'node:test';
import assert from 'node:assert/strict';
import {detailCloseTarget,sourceIdentity} from '../lib/detail-presentation.ts';
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
