import { CAMERA_ORDER, getCamera } from './cameras.mjs';
import { newCameraState, updateCamera, canExpose, cameraStatus } from './state.mjs';
import { renderReference } from './render.mjs';
import { CaptureAdapter, imageFromFile, imageFromUrl, sourceToFrame } from './capture.mjs';
import { cameraRenderParams, settingsSummary, dofParams, rowBlurRadius, HORIZON } from './exposure.mjs';
import { photographMetadata, downloadBlob } from './metadata.mjs';
import { cameraArtwork } from './illustrations.mjs';
import './site.mjs';

const $ = id => document.getElementById(id);
const requestedCamera = new URLSearchParams(location.search).get('camera');
let cameraId = CAMERA_ORDER.includes(requestedCamera) ? requestedCamera : 'apollo';
let state = newCameraState(cameraId);
let photo = null;
let provenance = { method: 'demo', sourceWidth: null, sourceHeight: null };
let activeSource = null;
let usingLive = false;
let sourceSelection = 'demo';
let exposureCount = 0;
const capture = new CaptureAdapter($('live-video'));
const seed = 0x172017;

function message(text, error = false) { $('feedback').textContent = text; $('feedback').classList.toggle('error', error); }
function closeSource() { if (activeSource?.close) activeSource.close(); activeSource = null; }
function element(tag, options = {}) { const el = document.createElement(tag); for (const [k,v] of Object.entries(options)) { if (k === 'text') el.textContent = v; else el.setAttribute(k, v); } return el; }
function optionButton(camera) {
  const button = element('button', {type:'button', class:'camera-option', 'data-camera':camera.id, 'aria-pressed': String(camera.id === cameraId)});
  button.innerHTML = `<span class="camera-thumb">${cameraArtwork(camera.id, 'selector-' + camera.id)}</span><span><span class="year">${camera.year}</span><strong>${camera.short}</strong><small>${camera.subtitle}</small></span><span class="active-indicator" aria-hidden="true">${camera.id === cameraId ? '●' : '○'}</span>`;
  button.addEventListener('click', () => setCamera(camera.id));
  return button;
}
function populateCameras() {
  const host = $('camera-options'); host.replaceChildren();
  CAMERA_ORDER.forEach(id => host.append(optionButton(getCamera(id))));
}
function setCamera(id) {
  cameraId = id; state = newCameraState(id); photo = null;
  const url = new URL(location.href); url.searchParams.set('camera', id); history.replaceState(null, '', url);
  $('photo-canvas').style.display = 'none'; $('export').disabled = true;
  for (const button of $('camera-options').children) {
    const active = button.dataset.camera === id;
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('.active-indicator').textContent = active ? '●' : '○';
  }
  redrawControls(); redrawPreview();
  message(`${getCamera(id).name} selected. Film and lens characteristics are currently phenomenological.`);
}
function setState(action) {
  const focused = document.activeElement?.dataset.focusKey;
  try {
    state = updateCamera(state, action); redrawControls(); redrawPreview();
    if (focused) $('mechanical-controls').querySelector(`[data-focus-key="${focused}"]`)?.focus({preventScroll:true});
  }
  catch (e) { message(e.message, true); }
}
function controlSelect(host, label, key, values) {
  const group = element('fieldset', {class:'mechanical-group', 'data-control':key});
  group.append(element('legend', {text:label}));
  if (key === 'magazine') {
    const loaded = state.magazine === 'loaded';
    const toggle = element('button', {type:'button',class:'magazine-switch','aria-label':'Film magazine loaded','aria-pressed':String(loaded),'data-focus-key':'magazine'});
    toggle.append(element('span', {'aria-hidden':'true'}));
    toggle.addEventListener('click', () => setState({type:'set',key,value:loaded ? 'removed' : 'loaded'}));
    group.append(toggle, element('span', {class:'magazine-description',text:loaded ? 'Magazine engaged' : 'Magazine removed'}));
    host.append(group); return;
  }
  const units = {aperture:'F / STOP',shutter:'SECONDS',focus:'DISTANCE',compensation:'LIGHT / DARK'};
  const hardware = element('div', {class:'dial-hardware','aria-hidden':'true'});
  const knob = element('div', {class:'dial-knob'});
  const pointer = element('span', {class:'dial-pointer'});
  const readout = element('span', {class:'dial-value'});
  knob.append(pointer, readout); hardware.append(knob);
  const scale = element('div', {class:'dial-scale','aria-hidden':'true'});
  values.forEach(value => scale.append(element('span', {text:value.replace('f/','').replace('1/','').replace(' s','').replace(' m','')})));
  const adjust = element('div', {class:'dial-adjust'});
  const input = element('input', {type:'range',id:'control-'+key,min:'0',max:String(values.length-1),step:'1',value:String(Math.max(0,values.indexOf(state[key]))),'aria-label':label,'data-focus-key':key});
  const less = element('button', {type:'button',text:'−','aria-label':`Decrease ${label.toLowerCase()}`});
  const more = element('button', {type:'button',text:'+','aria-label':`Increase ${label.toLowerCase()}`});
  function draw() {
    const index = Number(input.value), value = values[index];
    input.setAttribute('aria-valuetext', value);
    pointer.style.setProperty('--dial-angle', `${-125 + index / (values.length-1) * 250}deg`);
    readout.replaceChildren(document.createTextNode(value.replace('f/','').replace(' s','')),
      element('small', {text:units[key] || ''}));
    [...scale.children].forEach((mark,i) => mark.dataset.active = String(i===index));
    less.disabled = index===0; more.disabled = index===values.length-1;
  }
  function change(index) {
    input.value = String(Math.min(values.length-1, Math.max(0,index)));
    state = updateCamera(state, {type:'set',key,value:values[Number(input.value)]});
    draw(); redrawPreview();
  }
  input.addEventListener('input', () => change(Number(input.value)));
  less.addEventListener('click', () => change(Number(input.value)-1));
  more.addEventListener('click', () => change(Number(input.value)+1));
  adjust.append(less,input,more); group.append(hardware,scale,adjust); host.append(group); draw();
}
function controlButton(host, label, title, action, disabled = false) {
  const group = element('fieldset', {class:'mechanical-group mechanical-action'});
  group.append(element('legend',{text:label}));
  const button = element('button', {type:'button',class:'hardware-action','aria-label':title,'data-focus-key':action.type});
  const hardware = element('span', {class:'transport-hardware','aria-hidden':'true'});
  hardware.innerHTML = action.type==='advance' ? '<span class="transport-wheel"></span><span class="transport-arm"></span>' : `<span class="fold-symbol" aria-hidden="true">${action.type==='toggle-fold' ? '⌑' : action.type==='developed' ? '▣' : '▤'}</span>`;
  button.append(hardware,element('span', {class:'action-caption',text:title}));
  button.disabled=disabled; button.addEventListener('click',()=>setState(action));
  group.append(button); host.append(group);
}
function redrawControls() {
  previewExposure();
  const c = getCamera(cameraId); const host = $('mechanical-controls'); host.replaceChildren();
  $('active-camera-name').textContent = c.name;
  $('workbench').dataset.camera = cameraId;
  $('camera-story-link').href = `./learn.html?chapter=${cameraId}`;
  const engravings = {apollo:'HASSELBLAD / DATA CAMERA',sx70:'POLAROID / SX-70 LAND CAMERA',leica:'LEITZ WETZLAR / M1',rolleiflex:'ROLLEIFLEX / 2.8 F'};
  $('instrument-engraving').textContent = engravings[cameraId];
  $('camera-description').textContent = c.description;
  $('fidelity-indicator').textContent = `MECHANICS ${c.mechanicalEvidence} TARGET · RENDER ${c.renderingEvidence}`;
  $('mechanical-status').textContent = cameraStatus(state);
  $('frame-label').textContent = `FRAME ${String(state.framesTaken + 1).padStart(4,'0')}`;
  if (cameraId === 'sx70') {
    controlButton(host,'Folding body',state.open ? 'Fold camera' : 'Unfold camera',{type:'toggle-fold'});
    controlButton(host,'Instant film',state.loaded && state.remaining > 0 ? `${state.remaining} exposures` : 'Insert 10-frame pack',{type:'load'}, !state.open);
    controlSelect(host,'Focus distance','focus',['0.3 m','0.6 m','1 m','2 m','∞']);
    controlSelect(host,'Lighten / darken','compensation',['-2','-1','0','+1','+2']);
    if (state.developing) controlButton(host,'Development','Complete development',{type:'developed'});
  } else if (cameraId === 'apollo') {
    controlSelect(host,'Lens aperture','aperture',c.apertureOptions);
    controlSelect(host,'Shutter time','shutter',c.shutterOptions);
    controlSelect(host,'Distance scale','focus',['1.5 m','3 m','5 m','10 m','∞']);
    controlSelect(host,'Magazine','magazine',['loaded','removed']);
  } else {
    controlSelect(host,'Aperture','aperture',c.apertureOptions);
    controlSelect(host,'Shutter time','shutter',c.shutterOptions);
    controlSelect(host,'Distance scale','focus',['1 m','2 m','3 m','5 m','∞']);
    controlButton(host,'Film transport',state.ready ? 'Shutter cocked' : 'Advance film',{type:'advance'},state.ready || state.remaining===0);
    if (state.remaining===0) controlButton(host,'Film','Load new virtual roll',{type:'load'});
  }
  $('shutter').disabled = !canExpose(state);
  $('shutter-hint').textContent = canExpose(state) ? (usingLive ? 'Live capture' : 'Uses the imported or demo source') : 'Prepare the camera to expose';
}
function previewFocus() {
  const el = $('dof-blur'); if (!el) return;
  const dof = dofParams(getCamera(cameraId), state); const W = 1000;
  let maxR = 0; for (let v = 0.46; v <= 1; v += 0.04) maxR = Math.max(maxR, rowBlurRadius(dof, v, W));
  const stops = []; // mask opacity per row: blur amount relative to max
  for (let i = 0; i <= 20; i++) { const v = i / 20; stops.push(`rgba(0,0,0,${maxR ? Math.min(1, rowBlurRadius(dof, v, W) / maxR) : 0}) ${i * 5}%`); }
  el.style.backdropFilter = el.style.webkitBackdropFilter = `blur(${Math.round(maxR * 0.6)}px)`;
  el.style.maskImage = el.style.webkitMaskImage = `linear-gradient(to bottom, ${stops.join(',')})`;
  el.style.display = maxR ? 'block' : 'none';
}
function previewExposure() {
  previewFocus();
  const p = cameraRenderParams(cameraId, state, $('operation-mode').value);
  const f = `brightness(${Math.pow(2, p.exposureStops).toFixed(3)})`;
  const dim = cameraId === 'rolleiflex' ? ' contrast(.92) saturate(.9) brightness(.85)' : ' contrast(.92) saturate(.9)'; // ground glass is dim
  $('live-video').style.filter = f + dim; $('demo-image').style.filter = f + dim;
  $('shutter-hint').dataset.ev = p.exposureStops;
}
function redrawPreview() {
  previewExposure();
  const stage = $('media-stage');
  stage.className = 'media-stage' + (cameraId !== 'apollo' && !photo ? ` finder-on finder-${cameraId}` : '');
  const isHistoricalApollo = cameraId === 'apollo' && $('operation-mode').value === 'historical' && !photo;
  const overlay = $('aiming-overlay'); overlay.style.display = isHistoricalApollo ? 'flex' : 'none';
  $('viewport-label').textContent = isHistoricalApollo ? 'HISTORICAL AIMING · NO REFLEX VIEW' : photo ? 'PROCESSED PHOTOGRAPH' : cameraId !== 'apollo' ? (usingLive ? 'LIVE · VIEWFINDER' : sourceSelection==='import' ? 'IMPORTED · VIEWFINDER' : 'DEMO · VIEWFINDER') : usingLive ? 'LIVE DIGITAL VIEW' : sourceSelection==='import' ? 'IMPORTED PHOTOGRAPH' : 'DEMONSTRATION SCENE';
  $('preview-info').textContent = photo ? `${photo.settings.summary} · ${provenance.method.toUpperCase()}` : usingLive ? `LIVE · ${settingsSummary(cameraId, state)}` : sourceSelection==='import' ? `IMPORTED · ${settingsSummary(cameraId, state)}` : 'SYNTHETIC DEMO · NOT A PHOTOGRAPH';
  $('mode-explanation').textContent = $('operation-mode').value==='historical' ? 'Historical · instrument-style aiming' : 'Assisted · digital aiming available';
  $('demo-image').style.display = (usingLive || photo) ? 'none' : 'block';
  $('live-video').style.display = usingLive && !photo ? 'block' : 'none';
  $('photo-canvas').style.display = photo ? 'block' : 'none';
}

function settings() {
  return { grain: Number($('grain').value), warmth: Number($('warmth').value), renderMode: $('render-mode').value, operationMode: $('operation-mode').value, seed: seed + exposureCount };
}
async function expose() {
  if (!canExpose(state)) { message('The camera is not ready.',true); return; }
  $('shutter').disabled = true; message('Processing image locally…');
  let source;
  try {
    if (usingLive) source = await capture.photo();
    else if (sourceSelection === 'import' && activeSource) source = { bitmap: activeSource, method:'import', bytes: null };
    else source = await imageFromUrl('./demo-scene.png');
    const bitmap = source.bitmap;
    const targetSize = Math.min(1600, bitmap.width, bitmap.height);
    if (targetSize < 1) throw new Error('Image dimensions not supported.');
    const w = targetSize, h = targetSize;
    const frame = sourceToFrame(bitmap, w, h);
    exposureCount += 1;
    const renderSettings = { ...settings(), ...cameraRenderParams(cameraId, state, $('operation-mode').value), dof: dofParams(getCamera(cameraId), state), dofModel: 'flat-ground-heuristic', cameraSettings: { ...state } };
    renderSettings.summary = settingsSummary(cameraId, state);
    const result = renderReference(frame,cameraId,renderSettings);
    const canvas = $('photo-canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable.');
    ctx.putImageData(new ImageData(result.data,w,h),0,0);
    photo = { cameraId, settings: renderSettings };
    provenance = { method:source.method, sourceWidth: bitmap.width, sourceHeight: bitmap.height, outputWidth:w,outputHeight:h, calibration:'none', imageInput:sourceSelection, lens: usingLive ? lensLabel : null };
    state = updateCamera(state,{type:'expose'});
    // SX-70 development is a UI step, not a simulated chemical timing model.
    if (source.method !== 'import' && bitmap.close) bitmap.close();
    redrawControls(); redrawPreview(); $('export').disabled = false;
    message(`Frame captured with ${renderSettings.summary} (exposure ${renderSettings.exposureStops >= 0 ? '+' : ''}${renderSettings.exposureStops} stops, vignette ${renderSettings.vignette}%): ${w} × ${h} px via ${source.method}. Export to preserve it; this alpha does not store images.`);
  } catch (err) { message(err.message || 'Capture failed.',true); }
  finally { $('shutter').disabled = !canExpose(state); }
}
async function exportPhoto() {
  if (!photo) return;
  const canvas = $('photo-canvas'); const filename = `camera-archive-${cameraId}-${String(state.framesTaken).padStart(3,'0')}`;
  const png = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
  if (!png) { message('PNG export failed.',true); return; }
  // iOS: the share sheet offers "Save Image" (adds to the Photos library). Web pages cannot write to Photos directly.
  const file = new File([png], filename+'.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Camera Archive photograph' });
      message('Shared. Choose "Save Image" in the share sheet to add it to Photos.');
      return;
    } catch (err) {
      if (err?.name === 'AbortError') { message('Save cancelled.'); return; }
    }
  }
  downloadBlob(png,filename+'.png');
  const json = photographMetadata(cameraId,state,photo.settings,provenance);
  downloadBlob(new Blob([JSON.stringify(json,null,2)],{type:'application/json'}),filename+'.json');
  message('PNG and JSON export requested. Confirm both files were saved by your browser.');
}

let lensLabel = '';
async function startLive(deviceId = null) {
  try {
    const info = await capture.start(deviceId);
    lensLabel = info.label;
    const sel = $('lens-select'); const lenses = await capture.lenses();
    sel.replaceChildren(...lenses.map(l => { const o = element('option', { value: l.deviceId, text: l.label || 'Camera' }); if (l.deviceId === info.deviceId) o.selected = true; return o; }));
    sel.hidden = lenses.length < 2;
    usingLive = true; sourceSelection='live'; photo=null; $('export').disabled=true;
    redrawPreview(); redrawControls();
    message(`Camera started: ${info.label || 'rear camera'} (${info.width} × ${info.height} preview). Actual still resolution will be reported after capture.`);
  } catch (err) { message(`Camera could not start: ${err.message}`,true); }
}
$('start-camera').addEventListener('click', () => startLive());
$('lens-select').addEventListener('change', () => startLive($('lens-select').value));
$('import-file').addEventListener('change', async evt => {
  const file = evt.target.files?.[0]; if (!file) return;
  try {
    const result = await imageFromFile(file);
    capture.stop(); usingLive=false; sourceSelection='import'; closeSource(); activeSource=result.bitmap;
    const preview = $('demo-image'); preview.src = URL.createObjectURL(file);
    preview.onload = () => URL.revokeObjectURL(preview.src);
    photo=null; $('export').disabled=true; redrawPreview();redrawControls();
    message(`Imported image ${result.bitmap.width} × ${result.bitmap.height}. Choose your controls and expose.`);
  } catch (err) { message(err.message,true); }
});
$('use-demo').addEventListener('click', () => {
  capture.stop(); usingLive=false; sourceSelection='demo'; closeSource();
  $('demo-image').src = './demo-scene.png';photo=null;$('export').disabled=true;
  redrawPreview();redrawControls();message('Using synthetic demonstration scene.');
});
$('shutter').addEventListener('click', expose);
$('export').addEventListener('click',exportPhoto);
$('operation-mode').addEventListener('change',redrawPreview);
$('render-mode').addEventListener('change', () => message('Rendering mode selected. Changes take effect at the next exposure.'));
for (const id of ['grain','warmth']) $(id).addEventListener('input',()=>{ $(id+'-value').value = $(id).value; });
window.addEventListener('pagehide',()=>capture.stop());
populateCameras();redrawControls();redrawPreview();
