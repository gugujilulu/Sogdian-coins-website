import test from 'node:test';
import assert from 'node:assert/strict';
import {coinCityLinks,cityLinkSegment,cityLinkHitsBox} from '../lib/coin-city-links.ts';
const m=(id,placeId)=>({family:{id,anchor:{placeId}}});
const base={members:[m('a','p'),m('b','p'),m('c','q')],anchors:[{placeId:'p',coordinates:[0,100]},{placeId:'p',coordinates:[0,100]},{placeId:'q',coordinates:[200,100]}]};
const box={x:100,y:100,w:80,h:80},project=([x,y])=>({x,y});
test('all stages connect real member cities once and end outside coin and city centres',()=>{
 for(const stage of ['far','middle','near']){const links=coinCityLinks({...base,stage},box,project,'a');assert.equal(links.length,2);assert.deepEqual(links.map(l=>l.placeId),['p','q']);assert.ok(Math.abs(links[0].from.x-58)<.001);assert.equal(links[0].to.x,18);assert.equal(links[0].selected,true);assert.equal(links[1].selected,false);}
});
test('single family and remaining entries only connect represented members; occlusion removes lines',()=>{
 assert.deepEqual(coinCityLinks({...base,members:[m('c','q')]},box,project).map(l=>l.placeId),['q']);
 assert.deepEqual(coinCityLinks({...base,overflow:true,members:[m('a','p')]},box,project).map(l=>l.placeId),['p']);
 assert.deepEqual(coinCityLinks({...base,occluded:true},box,project),[]);
 assert.deepEqual(coinCityLinks({...base,members:[]},box,project),[]);
});
test('display offsets change image endpoint without changing real anchor or selection identity',()=>{
 const a=coinCityLinks(base,box,project,'c'),b=coinCityLinks(base,{...box,y:150},project,'c');assert.notDeepEqual(a[1].from,b[1].from);assert.equal(b[1].placeId,'q');assert.equal(b[1].selected,true);assert.deepEqual(base.anchors[2].coordinates,[200,100]);
});

test('finite attribution segment detects a blocking coin but excludes nearby clear coins',()=>{const line=cityLinkSegment({x:0,y:0,w:40,h:40},{x:120,y:60});assert.equal(cityLinkHitsBox(line,{x:60,y:30,w:20,h:20}),true);assert.equal(cityLinkHitsBox(line,{x:60,y:80,w:20,h:20}),false);});
