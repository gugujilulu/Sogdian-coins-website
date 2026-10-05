import test from 'node:test';
import assert from 'node:assert/strict';
import {orderDescriptions,sourceReading,familyIntroduction,recordContent} from '../lib/detail-content.ts';
test('current image chooses its own real source; sorting does not mutate the original list',()=>{
 const entries=[{text:'Zeno text',provider:'Zeno',url:'z'},{text:'Other photograph',provider:'Catalogue',url:'c'}];
 assert.equal(orderDescriptions(entries,'c')[0].url,'z');
 const zen=[...entries,{text:'Current Zeno photograph',provider:'Zeno',url:'z2'}];assert.equal(orderDescriptions(zen,'z2')[0].url,'z2');
 assert.equal(orderDescriptions(entries)[0].url,'z');assert.equal(entries[0].url,'z');
});
test('source reading preserves distinct scripts and gives no invented feature for a sparse record',()=>{
 assert.match(sourceReading('Sogdian legend; runic sign and tamgha.','zh'),/粟特文铭文、如尼符号、徽记/);
 assert.match(sourceReading('plain reverse','ru'),/гладкая оборотная сторона/);
 assert.equal(sourceReading('Kyrgyzstan','en'),'');
});
test('Nana primary description uses preserved Zeno find report rather than the display disclaimer',()=>{
 const text=recordContent('zeno-264184').map(x=>x.text).join(' ');
 assert.match(text,/Afghanistan/);assert.doesNotMatch(text,/No findspot marker|unverified regional/);
 for(const locale of ['en','zh','ru'])assert.ok(familyIntroduction('lady-nana',locale).length>50);
});
