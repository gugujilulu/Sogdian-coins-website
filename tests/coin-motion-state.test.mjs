import test from 'node:test';
import assert from 'node:assert/strict';
import {CoinMotionState} from '../lib/coin-motion-state.ts';
test('only new members in settled layouts enter, not redraws, covers or selected styles',()=>{
 const state=new CoinMotionState();assert.deepEqual(state.settle([]),{enter:[],leave:[]});
 assert.deepEqual(state.settle(['panch:nana','panch:amukian']),{enter:['panch:nana','panch:amukian'],leave:[]});
 for(let i=0;i<3;i++)assert.deepEqual(state.settle(['panch:nana','panch:amukian']),{enter:[],leave:[]});
 assert.deepEqual(state.settle(['panch:nana','panch:amukian','panch:chekin']),{enter:['panch:chekin'],leave:[]});
});
test('collapse removes member state and a later genuine expansion can enter again',()=>{
 const state=new CoinMotionState();state.settle([]);state.settle(['panch:nana']);assert.deepEqual(state.settle([]),{enter:[],leave:['panch:nana']});assert.deepEqual(state.settle(['panch:nana']),{enter:['panch:nana'],leave:[]});
});
test('initial deep-linked near layout and history restoration do not replay scatter',()=>{
 const state=new CoinMotionState();assert.deepEqual(state.settle(['panch:nana']),{enter:[],leave:[]});state.restore();assert.deepEqual(state.settle(['suyab:turgesh']),{enter:[],leave:[]});assert.deepEqual(state.settle(['suyab:turgesh']),{enter:[],leave:[]});
});
