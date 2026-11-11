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
