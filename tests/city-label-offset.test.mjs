import test from 'node:test';
import assert from 'node:assert/strict';
import {cityLabelOffset} from '../lib/range-labels.ts';
const viewport={left:0,top:0,right:600,bottom:400};
const label={left:200,right:330,top:180,bottom:200};
test('an unobstructed city name stays at its anchor',()=>assert.deepEqual(cityLabelOffset(label,viewport,[]),[0,0]));
test('neighbouring city names get the shortest clear displacement',()=>{
 const neighbour={left:240,right:360,top:180,bottom:200};
 const [x,y]=cityLabelOffset(label,viewport,[neighbour]);
 assert.ok(Math.hypot(x,y)<=40);
 assert.ok(label.bottom+y<=neighbour.top-5||label.top+y>=neighbour.bottom+5||label.right+x<=neighbour.left-5||label.left+x>=neighbour.right+5);
});
