import test from 'node:test';
import assert from 'node:assert/strict';
import { renderReference } from '../src/render.mjs';
const frame={width:8,height:8,data:Uint8ClampedArray.from(Array(64).fill([110,150,190,255]).flat())};
test('fixed seed and parameters yield exact deterministic bytes',()=>{
 const a=renderReference(frame,'sx70',{seed:42,grain:60});
 const b=renderReference(frame,'sx70',{seed:42,grain:60});
 assert.deepEqual(a.data,b.data);
 assert.notDeepEqual(a.data,renderReference(frame,'sx70',{seed:43,grain:60}).data);
});
test('processing does not mutate input',()=>{
 const original=new Uint8ClampedArray(frame.data);
 renderReference(frame,'apollo',{seed:42});
 assert.deepEqual(frame.data,original);
});
test('black and white lens keeps neutral output channels',()=>{
 const output=renderReference(frame,'leica',{seed:2,grain:0});
 for(let i=0;i<output.data.length;i+=4){
   assert.equal(output.data[i],output.data[i+1]);
   assert.equal(output.data[i+1],output.data[i+2]);
 }
});
test('invalid image size rejected',()=>assert.throws(()=>renderReference({width:0,height:0,data:[]},'sx70')));
test('evidence mode ignores artistic warmth',()=>{
 const a=renderReference(frame,'sx70',{seed:5,grain:0,renderMode:'evidence',warmth:-50});
 const b=renderReference(frame,'sx70',{seed:5,grain:0,renderMode:'evidence',warmth:50});
 assert.deepEqual(a.data,b.data);
});

import { cameraRenderParams } from '../src/exposure.mjs';
test('historical settings change exposure; assisted holds it',()=>{
 const s={aperture:'f/2.8',shutter:'1/500 s'};
 assert.equal(cameraRenderParams('leica',s,'assisted').exposureStops,0);
 assert.ok(cameraRenderParams('leica',{...s,shutter:'1/30 s'},'historical').exposureStops>cameraRenderParams('leica',s,'historical').exposureStops);
 const frame={width:8,height:8,data:new Uint8ClampedArray(8*8*4).fill(100)};
 const dark=renderReference(frame,'leica',{grain:0,exposureStops:-1});
 const light=renderReference(frame,'leica',{grain:0,exposureStops:1});
 assert.ok(light.data[0]>dark.data[0]);
 const v=renderReference(frame,'leica',{grain:0,vignette:40});
 assert.ok(v.data[0]<v.data[(4*8+4)*4]);
});
