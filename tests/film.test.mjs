import test from 'node:test';
import assert from 'node:assert/strict';
import { FILMS, grainFootprint, densityNoise } from '../src/film.mjs';
import { xorshift32, renderReference } from '../src/render.mjs';
import { cameraRenderParams, meterStops } from '../src/exposure.mjs';
import { getCamera } from '../src/cameras.mjs';
import { frameSize, viewGeometry } from '../src/capture.mjs';
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
  for (const [iw,ih] of [[1200,900],[960,1500],[3200,900]]) {
    const images = {};
    for (const id of ['apollo','leica','rolleiflex','sx70']) {
      const c = getCamera(id), crop = viewGeometry(c,iw,ih);
      images[id] = crop.width;
      assert.ok(crop.x >= -1e-8 && crop.y >= -1e-8);
      assert.ok(Math.abs(2*crop.x + crop.width - iw) < 1e-8);
      const output = frameSize(c,iw,ih,420);
      assert.ok(output.width <= 420 && output.width <= Math.ceil(crop.width));
      assert.ok(Math.abs(output.height - output.width*c.frameHeightMm/c.frameMm) < 1);
    }
    assert.ok(Math.abs(images.apollo / images.rolleiflex - (53/60)/(56/80)) < 1e-9);
    const leica = getCamera('leica'), window = viewGeometry(leica,iw,ih,{historical:true});
    assert.ok(Math.abs(images.leica/window.width - (35/50)/1.08) < 1e-9);
    const loupe = viewGeometry(getCamera('rolleiflex'),iw,ih,{historical:true,magnification:2.5});
    assert.ok(Math.abs(loupe.width*2.5 - images.rolleiflex) < 1e-9);
  }
});

test('changing stock loads a fresh compatible roll and preserves lens settings', () => {
  const shot = updateCamera(newCameraState('leica'),{type:'expose'});
  const next = updateCamera(shot,{type:'change-film',filmId:'trix400'});
  assert.equal(next.remaining,36);assert.equal(next.focus,shot.focus);assert.equal(next.ready,true);
  assert.throws(()=>updateCamera(shot,{type:'change-film',filmId:'so368'}));
});
