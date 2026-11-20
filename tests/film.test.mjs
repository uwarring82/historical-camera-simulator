import test from 'node:test';
import assert from 'node:assert/strict';
import { FILMS, grainFootprint, densityNoise } from '../src/film.mjs';
import { xorshift32, renderReference } from '../src/render.mjs';
import { cameraRenderParams, meterStops } from '../src/exposure.mjs';
import { getCamera } from '../src/cameras.mjs';
import { frameSize } from '../src/capture.mjs';
import { newCameraState, updateCamera } from '../src/state.mjs';

test('speed and time compensate exactly, including in rendered midtones', () => {
  const base = {...newCameraState('leica'),shutter:'1/125 s'};
  const slow = cameraRenderParams('leica',base);
  const fast = cameraRenderParams('leica',{...base,filmId:'tmax400'});
  const balanced = cameraRenderParams('leica',{...base,filmId:'tmax400',shutter:'1/500 s'});
  assert.equal(fast.exposureStops-slow.exposureStops,2);
  assert.equal(balanced.exposureStops,slow.exposureStops);
  const frame = {width:1,height:1,data:new Uint8ClampedArray([118,118,118,255])};
  const render = p => renderReference(frame,'leica',{...p,grain:0}).data[0];
  assert.equal(render(slow),render(balanced));
  assert.ok(render(fast)>200 && render(fast)<240);
});

test('two ISO 400 stocks retain their measured granularity ordering at the same exposure', () => {
  const trix = FILMS.trix400, tmax = FILMS.tmax400;
  assert.equal(trix.iso,tmax.iso);
  assert.ok(grainFootprint(trix,36,1600).sigmaDensity > grainFootprint(tmax,36,1600).sigmaDensity);
  const refWidth = 36000 / (12*Math.sqrt(12)); // pixel and 48 µm disc have equal second moments
  assert.ok(Math.abs(grainFootprint(trix,36,refWidth).sigmaDensity-0.017)<1e-10);
  assert.ok(grainFootprint(trix,56,1000).sigmaDensity < grainFootprint(trix,36,1000).sigmaDensity);
  assert.ok(grainFootprint(trix,36,320).sigmaDensity < grainFootprint(trix,36,1600).sigmaDensity);
});

test('sampled film field has the predicted variance and neighboring-pixel correlation', () => {
  const width = 1600, next = densityNoise(FILMS.trix400,36,width,xorshift32(45));
  let sum2=0, horizontal=0, vertical=0, left=0;
  const prior = new Float32Array(width);
  for(let y=0;y<80;y++) for(let x=0;x<width;x++) {
    const n=next(x);sum2+=n*n;
    if(x)horizontal+=left*n;
    if(y)vertical+=prior[x]*n;
    prior[x]=n;left=n;
  }
  const model=grainFootprint(FILMS.trix400,36,width);
  assert.ok(Math.abs(Math.sqrt(sum2/(80*width))/model.sigmaDensity-1)<0.02);
  for(const cov of [horizontal,vertical])assert.ok(Math.abs(cov/sum2-model.neighborCorrelation)<0.025);
});

test('reflected-light metering and the compensation wheel have distinct effects', () => {
  const scene = level => ({width:1,height:1,data:[level,level,level,255]});
  assert.ok(Math.abs(meterStops(scene(118)))<0.02);
  assert.ok(meterStops(scene(80))>1 && meterStops(scene(180))< -1);
  const sx = newCameraState('sx70');
  assert.equal(cameraRenderParams('sx70',{...sx,compensation:'+2'}).exposureStops-cameraRenderParams('sx70',sx).exposureStops,1);
});

test('output fits the source and uses the individual film gates', () => {
  for(const [id,expected] of [['leica',[1200,800]],['apollo',[900,900]],['rolleiflex',[900,900]],['sx70',[923,900]]]) {
    const {width,height} = frameSize(getCamera(id),1200,900);
    assert.deepEqual([width,height],expected);
  }
});

test('changing stock loads a fresh compatible roll and preserves lens settings', () => {
  const shot = updateCamera(newCameraState('leica'),{type:'expose'});
  const next = updateCamera(shot,{type:'change-film',filmId:'trix400'});
  assert.equal(next.remaining,36);assert.equal(next.focus,shot.focus);assert.equal(next.ready,true);
  assert.throws(()=>updateCamera(shot,{type:'change-film',filmId:'so368'}));
});
