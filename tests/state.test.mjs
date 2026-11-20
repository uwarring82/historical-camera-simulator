import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMERA_ORDER, getCamera } from '../src/cameras.mjs';
import { newCameraState, updateCamera, canExpose } from '../src/state.mjs';
test('four camera models have distinct identities',()=>{
  assert.equal(CAMERA_ORDER.length,4);
  for(const id of CAMERA_ORDER) assert.equal(getCamera(id).id,id);
});
test('Apollo electrically advances after exposure; magazine required',()=>{
  let s=newCameraState('apollo');
  assert.equal(canExpose(s),true);
  s=updateCamera(s,{type:'expose'});
  assert.equal(s.framesTaken,1);assert.equal(canExpose(s),true);
  s=updateCamera(s,{type:'set',key:'magazine',value:'removed'});
  assert.equal(canExpose(s),false);
  assert.throws(()=>updateCamera(s,{type:'expose'}));
});
test('SX-70 ejects each print and permits the next shot until the eight-frame pack is empty',()=>{
  let s=newCameraState('sx70');
  assert.equal(canExpose(s),false);
  assert.throws(()=>updateCamera(s,{type:'load'}));
  s=updateCamera(s,{type:'toggle-fold'});
  s=updateCamera(s,{type:'load'});assert.equal(s.remaining,8);
  s=updateCamera(s,{type:'expose'});assert.equal(s.remaining,7);
  assert.equal(canExpose(s),true);
  while(s.remaining) s=updateCamera(s,{type:'expose'});
  assert.equal(canExpose(s),false);
});
test('Leica and Rolleiflex require manual advance',()=>{
  for (const id of ['leica','rolleiflex']) {
    let s=newCameraState(id);s=updateCamera(s,{type:'expose'});
    assert.equal(canExpose(s),false);
    s=updateCamera(s,{type:'advance'});assert.equal(canExpose(s),true);
  }
});
