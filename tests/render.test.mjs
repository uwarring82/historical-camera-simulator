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
test('camera settings change exposure in both modes',()=>{
 const s={aperture:'f/5.6',shutter:'1/500 s'};
 assert.ok(cameraRenderParams('leica',s,'assisted').exposureStops<0);
 assert.ok(cameraRenderParams('leica',{...s,shutter:'1/30 s'},'historical').exposureStops>cameraRenderParams('leica',s,'historical').exposureStops);
 const frame={width:8,height:8,data:new Uint8ClampedArray(8*8*4).fill(100)};
 const dark=renderReference(frame,'leica',{grain:0,exposureStops:-1});
 const light=renderReference(frame,'leica',{grain:0,exposureStops:1});
 assert.ok(light.data[0]>dark.data[0]);
 const v=renderReference(frame,'leica',{grain:0,vignette:40});
 assert.ok(v.data[0]<v.data[(4*8+4)*4]);
});

import { rowBlurRadius, dofParams } from '../src/exposure.mjs';
import { getCamera } from '../src/cameras.mjs';
test('focus distance and aperture change depth blur',()=>{
 const cam=getCamera('leica');
 const near=dofParams(cam,{aperture:'f/2.8',focus:'1 m'}), far=dofParams(cam,{aperture:'f/2.8',focus:'∞'}), stopped=dofParams(cam,{aperture:'f/16',focus:'1 m'});
 assert.ok(rowBlurRadius(near,0.2,1000)>0, 'sky blurs when focused near');
 assert.equal(rowBlurRadius(far,0.2,1000),0);
 assert.ok(rowBlurRadius(far,1,1000)>0, 'near ground blurs when focused at infinity');
 assert.ok(rowBlurRadius(stopped,0.2,1000)<rowBlurRadius(near,0.2,1000));
 const frame={width:300,height:300,data:new Uint8ClampedArray(300*300*4).map((_,i)=>i%4===3?255:(i>>2)%2?255:0)};
 const blurred=renderReference(frame,'leica',{grain:0,dof:near});
 assert.notDeepEqual(blurred.data,renderReference(frame,'leica',{grain:0}).data);
});
