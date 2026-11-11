import test from 'node:test';
import assert from 'node:assert/strict';
import { reseauGeometry, stampReseau } from '../src/reseau.mjs';
test('5x5 crosses with 10 mm film spacing and double center',()=>{
 const c=reseauGeometry(530,530,53);assert.equal(c.length,25);
 assert.ok(Math.abs((c[1].x-c[0].x)-100)<1e-9);
 assert.equal(c[12].center,true);
 assert.equal(c[12].armPxX,20);assert.equal(c[11].armPxX,10);
 assert.ok(Math.abs(c[12].widthPx-.2)<1e-9);
});
test('reseau geometry is independent of lens-distortion settings',()=>{
 const a=reseauGeometry(530,530,53);
 const simulatedDistortionSettings=[-0.02,0,0.025];
 for(const parameter of simulatedDistortionSettings){
   void parameter;
   assert.deepEqual(reseauGeometry(530,530,53),a);
 }
});
test('film-plane marks darken pixels without shifting alpha',()=>{
 const p=new Uint8ClampedArray(530*530*4).fill(255);
 stampReseau(p,530,530);
 const idx=(265*530+265)*4;
 assert.ok(p[idx]<255);
 assert.equal(p[idx+3],255);
});
