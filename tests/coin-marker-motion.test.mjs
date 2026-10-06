import test from 'node:test';
import assert from 'node:assert/strict';
import {CoinMarkerMotion} from '../components/atlas/coin-marker-motion.ts';
test('replacement stops old handles and late completion cannot finish the new animation',()=>{
 const callbacks=[],stopped=[],frames=new Map();let id=0,finished=0;
 const previousRAF=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 try{
  const node={style:{removeProperty(){}},parentElement:{style:{transform:'MapLibre position'}}};
  const start=(_node,_values,options)=>{const key=callbacks.length;callbacks.push(options.onComplete);return{stop:()=>stopped.push(key)}};
  const motion=new CoinMarkerMotion(()=>{},start);motion.run(node,{x:10,y:10},false,0,()=>finished++);motion.run(node,{x:20,y:20},false,0,()=>finished++);
  assert.deepEqual(stopped,[0]);assert.equal(finished,1);callbacks[0]();assert.equal(finished,1);assert.equal(frames.size,1);
  motion.cancelAll();assert.deepEqual(stopped,[0,1]);assert.equal(frames.size,0);callbacks[1]();assert.equal(finished,2);assert.equal(node.parentElement.style.transform,'MapLibre position');
 }finally{globalThis.requestAnimationFrame=previousRAF;globalThis.cancelAnimationFrame=previousCancel}
});
test('reduced-motion/background/unmount cancellation clears owned styles and local frames',()=>{
 let stopCount=0;const removed=[],frames=new Map();let id=0;
 const previousRAF=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 try{const node={style:{removeProperty:key=>removed.push(key)}},line={style:{removeProperty:key=>removed.push('line:'+key)}};const motion=new CoinMarkerMotion(()=>{},()=>({stop:()=>stopCount++}));motion.run(node,{x:30,y:40});motion.fade(line);motion.cancelAll();assert.equal(stopCount,2);assert.equal(frames.size,0);assert.deepEqual(removed,['transform','opacity','line:opacity']);motion.cancelAll();assert.equal(stopCount,2)}finally{globalThis.requestAnimationFrame=previousRAF;globalThis.cancelAnimationFrame=previousCancel}
});
