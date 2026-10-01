import test from 'node:test';
import assert from 'node:assert/strict';
import {checkRangeIntake} from '../scripts/check-range-intake.mjs';
const refs={objectIds:new Set(['polity:known']),familyIds:new Set(['family'])};
const pending={id:'version',objectId:'polity:known',familyIds:['family'],source:'来源待解析；离线测试',start:null,end:null,precision:'undrawn'};
const ring=[[0,0],[1,0],[1,1],[0,0]];
const range={...pending,precision:'approximate',periodText:'年代完全未知',geometry:{type:'Polygon',coordinates:[ring]}};
const check=(ranges,extra={})=>checkRangeIntake({ranges,...extra},refs);
test('unknown and undrawn objects remain, multiple versions share object identity',()=>{
 assert.deepEqual(check([pending,{...pending,id:'second'}]),[]);
 assert.deepEqual(check([range]),[]);
});
test('duplicate versions and invalid references fail without merging entities',()=>{
 assert.ok(check([pending,pending]).some(e=>e.includes('重复')));
 assert.ok(check([{...pending,objectId:'missing',familyIds:['missing']}]).length===2);
});
test('source, time and legal closed coordinate checks',()=>{
 assert.ok(check([{...range,source:'',start:1200,end:1100}]).length===2);
 for(const badRing of [ring.slice(0,3),[[0,0],[181,0],[1,1],[0,0]],[[0,0],[1,NaN],[1,1],[0,0]]]) assert.ok(check([{...range,geometry:{type:'Polygon',coordinates:[badRing]}}]).length);
});
test('cropped fill requires independent border and explanation, reversed seam also fails',()=>{
 const seam=[[1,0],[1,1]], cropped={...range,coverageEdge:{type:'LineString',coordinates:seam},coverage:{extent:'partial',note:'东侧原图外'},boundary:{type:'MultiLineString',coordinates:[[[0,0],[1,0]]]}};
 assert.deepEqual(check([cropped]),[]);
 assert.ok(check([{...cropped,boundary:undefined}]).some(e=>e.includes('独立')));
 assert.ok(check([{...cropped,coverage:undefined}]).some(e=>e.includes('说明')));
 assert.ok(check([{...cropped,boundary:{type:'MultiLineString',coordinates:[[...seam].reverse()]}}]).some(e=>e.includes('闭合边')));
});
test('development fixtures cannot be passed as formal collection',()=>{
 assert.ok(check([pending],{demo:true}).length);
 assert.ok(check([{...pending,id:'demo:version'}]).some(e=>e.includes('演示')));
});
