import test from 'node:test';
import assert from 'node:assert/strict';
import {CollectionPopupLifecycle} from '../lib/collection-popup-lifecycle.ts';
function setup(){
 let restores=0,cancels=0;
 const life=new CollectionPopupLifecycle(()=>cancels++,()=>restores++);
 function popup(){const node={};let element={querySelector:()=>node};const p={getElement:()=>element,remove(){element=undefined;p.close()},close:()=>{}};p.close=life.opened(p,node);return p}
 return {life,popup,counts:()=>({restores,cancels})};
}
test('member removal followed by selection refresh/removal is safe',()=>{
 const {life,popup,counts}=setup();popup();life.remove();life.remove();assert.equal(life.current,null);assert.equal(counts().restores,0);
});
test('native close clears reference and later refresh is safe; suppression resets',()=>{
 const {life,popup,counts}=setup();popup().remove();life.remove();assert.equal(life.current,null);assert.equal(counts().restores,1);popup();life.remove();popup().remove();assert.equal(counts().restores,2);
});
test('stale close callback cannot clear or focus away from replacement',()=>{
 const {life,popup,counts}=setup();const old=popup();life.remove();const next=popup();old.close();assert.equal(life.current,next);assert.equal(counts().restores,0);next.remove();assert.equal(counts().restores,1);
});
test('already destroyed DOM is not queried during removal',()=>{
 const {life,popup}=setup();const p=popup();p.getElement=()=>undefined;life.remove();assert.equal(life.current,null);
});
