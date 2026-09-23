import test from 'node:test';
import assert from 'node:assert/strict';
import {fitImage,boundTransform,zoomImage,gestureImage,selectedImage,validSize} from '../lib/image-viewer.ts';
const image={width:2400,height:1200},view={width:600,height:400};
test('fit preserves whole photo; 100% uses natural CSS pixels and bounded zoom',()=>{
 assert.deepEqual(fitImage(image,view),{scale:.25,x:0,y:0});
 const center={x:300,y:200},original=zoomImage(fitImage(image,view),1,center,center,image,view);
 assert.equal(original.scale*image.width,2400);assert.deepEqual(original,{scale:1,x:0,y:0});
 assert.equal(boundTransform({...original,scale:100},image,view).scale,8);
 assert.equal(boundTransform({...original,scale:0},image,view).scale,.125);
 assert.deepEqual(fitImage({width:200,height:100},view),{scale:1,x:0,y:0});
});
test('pointer anchor and pinch midpoint preserve the same image point',()=>{
 const t={scale:1,x:0,y:0},p={x:400,y:250},zoom=zoomImage(t,2,p,p,image,view);
 assert.equal((p.x-view.width/2-zoom.x)/zoom.scale,(p.x-view.width/2-t.x)/t.scale);
 assert.equal((p.y-view.height/2-zoom.y)/zoom.scale,(p.y-view.height/2-t.y)/t.scale);
 assert.deepEqual(gestureImage(t,[{x:200,y:200},{x:400,y:200}],[{x:120,y:220},{x:520,y:220}],image,view),{scale:2,x:20,y:20});
});
test('drag limits and resizing never lose image; reset clears pan',()=>{
 assert.deepEqual(boundTransform({scale:1,x:9999,y:-9999},image,view),{scale:1,x:900,y:-400});
 assert.deepEqual(gestureImage(fitImage(image,view),[{x:0,y:0}],[{x:100,y:100}],image,view),fitImage(image,view));
 assert.deepEqual(boundTransform({scale:1,x:900,y:400},image,{width:3000,height:2000}),{scale:1,x:0,y:0});
 assert.deepEqual(fitImage(image,view),{scale:.25,x:0,y:0});assert.equal(validSize({width:NaN,height:10}),false);
});
test('image selection uses stable ID with each image own provenance; missing IDs cannot select another',()=>{
 const images=[{id:'a',credit:'first',width:0},{id:'b',credit:'second',width:2400}];
 assert.equal(selectedImage(images,'b'),images[1]);assert.equal(selectedImage([...images].reverse(),'b'),images[1]);assert.equal(selectedImage(images,'missing'),undefined);assert.equal(selectedImage([],null),undefined);assert.equal(selectedImage(images,null),images[0]);
 assert.deepEqual(fitImage({width:selectedImage(images,'b').width,height:1200},view),{scale:.25,x:0,y:0});
});
