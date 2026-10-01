import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRangeYear,rangeTimeState,rangeTimeDescription,rangeSpaceDescription,rangeViews,updateRangeSelection} from '../lib/range-time.ts';
import {visibleRanges,defaultLayers} from '../lib/map-layers.ts';
import {qaraKhitaiSample} from '../lib/qara-khitai-sample.ts';
const sample=qaraKhitaiSample(['a']),year=n=>({mode:'year',year:n}),all={mode:'all',year:0};
const fixture=(id,start,end)=>({...sample,id,objectId:'fixture',start,end,timeEvidence:undefined,periodText:undefined,title:`Fixture ${id}`});
test('closed range boundaries are inclusive; invalid intervals are explicit anomalies',()=>{
 const r=fixture('bounded',650,750);
 assert.equal(rangeTimeState(r),'bounded');
 for(const n of [650,700,750])assert.equal(assessRangeYear(r,n),'match');
 for(const n of [649,751])assert.equal(assessRangeYear(r,n),'no-match');
 for(const bad of [fixture('bad',750,650),fixture('bad',NaN,650)]){assert.equal(rangeTimeState(bad),'invalid');assert.equal(assessRangeYear(bad,700),'uncertain');assert.match(rangeTimeDescription(bad),/数据异常/)}
});
test('one-sided bounds can disprove a year but cannot confirm endless validity',()=>{
 const lower=fixture('lower',650,null),upper=fixture('upper',null,750),unknown=fixture('unknown',null,null);
 assert.equal(rangeTimeState(lower),'lower');assert.equal(rangeTimeState(upper),'upper');assert.equal(rangeTimeState(unknown),'unknown');
 assert.equal(assessRangeYear(lower,649),'no-match');assert.equal(assessRangeYear(lower,650),'uncertain');assert.equal(assessRangeYear(lower,3000),'uncertain');
 assert.equal(assessRangeYear(upper,751),'no-match');assert.equal(assessRangeYear(upper,750),'uncertain');assert.equal(assessRangeYear(upper,-3000),'uncertain');
 assert.equal(assessRangeYear(unknown,700),'uncertain');assert.match(rangeTimeDescription(lower),/上界未知/);assert.match(rangeTimeDescription(upper),/下界未知/);assert.match(rangeTimeDescription(unknown),/完全未知/);
 assert.equal(assessRangeYear({...upper,timeEvidence:{endInclusive:false}},750),'no-match');
});
test('literal after-1141 excludes 1141 and is uncertain in every later year',()=>{
 assert.equal(sample.start,1141);assert.equal(sample.end,null);assert.equal(sample.periodText,'1141年后（原图未指定终年）');
 for(const n of [1000,1140,1141])assert.equal(assessRangeYear(sample,n),'no-match');
 for(const n of [1142,1150,1218,3000])assert.equal(assessRangeYear(sample,n),'uncertain');
 const b={places:[],ranges:[sample]},settings={...defaultLayers,polities:true};
 for(const n of [1140,1141,1150,3000])assert.equal(visibleRanges(b,settings,year(n)).length,0);
 assert.equal(visibleRanges(b,settings,all).length,1);
});
test('unknown mode uses the range itself, distinguishes partial evidence and never borrows coin dates',()=>{
 const ranges=[fixture('bounded',650,750),fixture('lower',650,null),fixture('upper',null,750),fixture('unknown',null,null)];
 for(const r of ranges){const v=rangeViews([r],{mode:'unknown',year:700})[0];assert.equal(v.visible,r.id!=='bounded')}
 assert.equal(rangeViews([sample],{mode:'unknown',year:1141})[0].visible,true);
});
test('version default is reproducible; explicit versions stay selected when the year changes',()=>{
 const old=fixture('old',650,700),newer=fixture('new',701,750),choices=[newer,old];
 assert.equal(rangeViews(choices,all)[0].selected.id,'old');assert.equal(rangeViews([...choices].reverse(),all)[0].selected.id,'old');
 const view=rangeViews(choices,year(720),{fixture:'old'})[0];assert.equal(view.selected.id,'old');assert.equal(view.visible,false);assert.match(view.message,/其他版本有明确匹配/);
 assert.equal(rangeViews(choices,year(720),{fixture:'new'})[0].visible,true);
 const absent=rangeViews(choices,all,{fixture:'gone'})[0];assert.equal(absent.selected,undefined);assert.match(absent.message,/不存在/);assert.equal(absent.visible,false);
});
test('background viewing retains the original mismatch and source, never creates a definite year match',()=>{
 for(const n of [1140,1150]){
  const v=rangeViews([sample],year(n),{},[sample.objectId])[0];assert.equal(v.visible,true);assert.equal(v.background,true);assert.notEqual(v.assessment,'match');assert.match(v.message,/仅作为历史背景/);assert.equal(v.selected.source,sample.source);
  const rendered=visibleRanges({places:[],ranges:[sample]},{...defaultLayers,polities:true},year(n),'a',{},[sample.objectId]);assert.equal(rendered[0].presentation.background,true);assert.deepEqual(rendered[0].geometry,sample.geometry);
 }
 assert.equal(visibleRanges({places:[],ranges:[sample]},defaultLayers,year(1150),'a',{},[sample.objectId]).length,0);
 assert.equal(visibleRanges({places:[],ranges:[sample]},{...defaultLayers,polities:true},year(1150),'other',{},[sample.objectId]).length,0);
});
test('year, mode, family or object context change resets only voluntary background; version change also resets it',()=>{
 let s={context:'family-a/object-a/year/1150',versions:{fixture:'old'},backgrounds:[]};
 s=updateRangeSelection(s,s.context,{type:'background',objectId:sample.objectId,enabled:true});assert.equal(s.backgrounds.length,1);
 for(const context of ['family-a/object-a/year/1140','family-a/object-a/unknown','family-b/object-a/year/1150','family-a/object-b/year/1150']){
  const changed=updateRangeSelection(s,context,{type:'context'});assert.deepEqual(changed.backgrounds,[]);assert.deepEqual(changed.versions,s.versions);
  assert.deepEqual(updateRangeSelection(changed,s.context,{type:'context'}).backgrounds,[]);
 }
 assert.deepEqual(updateRangeSelection(s,s.context,{type:'version',objectId:'fixture',id:'new'}).backgrounds,[]);
 assert.deepEqual(updateRangeSelection(s,s.context,{type:'background',objectId:sample.objectId,enabled:false}).backgrounds,[]);
});
test('partial coverage and spatial meaning survive background viewing and missing metadata has a clear fallback',()=>{
 assert.match(rangeSpaceDescription(sample),/本部范围.*局部.*东侧.*不绘国界/);
 const rendered=rangeViews([sample],year(1150),{},[sample.objectId])[0].selected;assert.equal(rendered.boundary,sample.boundary);assert.equal(rendered.coverageEdge,sample.coverageEdge);
 assert.match(rangeSpaceDescription({...sample,coverage:undefined,spatialMeaning:undefined}),/含义未记录.*局部/);
 assert.match(rangeSpaceDescription({...sample,coverage:undefined,coverageEdge:undefined,spatialMeaning:'unknown'}),/空间含义未记录.*完整性未记录/);
});
