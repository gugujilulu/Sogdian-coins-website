import test from 'node:test';
import assert from 'node:assert/strict';
import {sheetKey,imageKey,escapeTarget,stableFocusIndex} from '../lib/keyboard.ts';
import {durationFor,watchMotion} from '../lib/motion.ts';
test('sheet keyboard reaches all states, clamps endpoints, and ignores other keys',()=>{
 assert.equal(sheetKey('half','Home'),'summary');assert.equal(sheetKey('summary','ArrowUp'),'half');assert.equal(sheetKey('half','ArrowUp'),'reading');assert.equal(sheetKey('summary','End'),'reading');assert.equal(sheetKey('reading','ArrowDown'),'half');assert.equal(sheetKey('summary','ArrowDown'),'summary');assert.equal(sheetKey('reading','ArrowUp'),'reading');assert.equal(sheetKey('half','a'),null);
});
test('image shortcuts share actions and leave editing/modifiers alone',()=>{
 for(const [key,action]of Object.entries({ArrowLeft:'previous',ArrowRight:'next','+':'in','=':'in','-':'out','0':'fit'})){assert.equal(imageKey(key),action);assert.equal(imageKey(key,true),null);assert.equal(imageKey(key,false,true),null)}assert.equal(imageKey('Escape'),null);
});
test('motion preference changes live and listener is removed on cleanup',()=>{
 let listener;const values=[];const media={matches:false,addEventListener:(event,fn)=>{assert.equal(event,'change');listener=fn},removeEventListener:(event,fn)=>{assert.equal(fn,listener);listener=null}};
 const stop=watchMotion(media,value=>values.push(durationFor(450,value)));media.matches=true;listener();media.matches=false;listener();assert.deepEqual(values,[450,0,450]);stop();assert.equal(listener,null);assert.equal(durationFor(0,false),0);
});

test('Escape selects exactly one top layer and does not intercept native editing/modal handling',()=>{
 const layers={modal:false,tools:'layers',collection:true,family:true};assert.equal(escapeTarget(layers),'layers');assert.equal(escapeTarget({...layers,tools:'filters'}),'filters');assert.equal(escapeTarget({...layers,tools:null}),'collection');assert.equal(escapeTarget({...layers,tools:null,collection:false}),'family');assert.equal(escapeTarget({...layers,modal:true}),null);assert.equal(escapeTarget(layers,true),null);assert.equal(escapeTarget({modal:false,tools:null,collection:false,family:false}),null);
});
test('stable focus follows surviving family through marker regrouping, or explicitly requests fallback',()=>{
 assert.equal(stableFocusIndex(['panch'],[['chach'],['panch','samarkand']]),1);assert.equal(stableFocusIndex(['panch'],[['chach']]),-1);assert.equal(stableFocusIndex(['panch','samarkand'],[['samarkand'],['other']]),0);
});
