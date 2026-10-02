import test from 'node:test';
import assert from 'node:assert/strict';
import {sheetHeight,snapSheet,mapPadding,mobileViewport} from '../lib/mobile-sheet.ts';
test('drag snaps to all three browsing heights, never to a closed state',()=>{for(const h of [796,480,312])for(const s of ['summary','half','reading'])assert.equal(snapSheet(sheetHeight(s,h),h),s);assert.equal(snapSheet(-500,796),'summary');assert.equal(snapSheet(2000,796),'reading')});
test('actual panel obstruction leaves a usable short-screen viewport',()=>{for(const h of [240,312,480,796])for(const s of ['summary','half','reading']){const p=mapPadding(360,h,sheetHeight(s,h),true);assert.ok(h-p.top-p.bottom>=79);assert.ok(360-p.left-p.right>0)}assert.ok(mapPadding(390,796,128,true).bottom<mapPadding(390,796,398,true).bottom)});
test('desktop padding does not inherit mobile sheet obstruction',()=>{assert.deepEqual(mapPadding(1280,800,0,false),{top:100,bottom:30,left:60,right:60})});

test('phone landscape retains sheet while desktop stays a sidebar',()=>{assert.equal(mobileViewport(844,390),true);assert.equal(mobileViewport(1280,800),false)});
