import { CAMERA_ORDER, getCamera } from './cameras.mjs';
import { newCameraState, updateCamera, canExpose, cameraStatus } from './state.mjs';
import { renderReference } from './render.mjs';
import { CaptureAdapter, imageFromFile, imageFromUrl, sourceToFrame } from './capture.mjs';
import { cameraRenderParams, settingsSummary } from './exposure.mjs';
import { photographMetadata, downloadBlob } from './metadata.mjs';

const $ = id => document.getElementById(id);
let cameraId = 'apollo';
let state = newCameraState(cameraId);
let photo = null;
let provenance = { method: 'demo', sourceWidth: null, sourceHeight: null };
let activeSource = null;
let usingLive = false;
let sourceSelection = 'demo';
let exposureCount = 0;
const capture = new CaptureAdapter($('live-video'));
const buttons = new Map();
const seed = 0x172017;

function message(text, error = false) { $('feedback').textContent = text; $('feedback').classList.toggle('error', error); }
function closeSource() { if (activeSource?.close) activeSource.close(); activeSource = null; }
function element(tag, options = {}) { const el = document.createElement(tag); for (const [k,v] of Object.entries(options)) { if (k === 'text') el.textContent = v; else el.setAttribute(k, v); } return el; }
function optionButton(camera) {
  const button = element('button', {type:'button', class:'camera-option', 'data-camera':camera.id, 'aria-pressed': String(camera.id === cameraId)});
  button.innerHTML = `<span class="year">${camera.year}</span><strong>${camera.short}</strong><small>${camera.subtitle}</small><span class="active-indicator">${camera.id === cameraId ? '●' : '○'}</span>`;
  button.addEventListener('click', () => setCamera(camera.id));
  return button;
}
function populateCameras() {
  const host = $('camera-options'); host.replaceChildren();
  CAMERA_ORDER.forEach(id => host.append(optionButton(getCamera(id))));
}
function setCamera(id) {
  cameraId = id; state = newCameraState(id); photo = null;
  $('photo-canvas').style.display = 'none'; $('export').disabled = true;
  populateCameras(); redrawControls(); redrawPreview();
  message(`${getCamera(id).name} selected. Film and lens characteristics are currently phenomenological.`);
}
function setState(action) {
  try { state = updateCamera(state, action); redrawControls(); }
  catch (e) { message(e.message, true); }
}
function controlSelect(host, label, key, values) {
  const group = element('div', {class:'mechanical-group'});
  const lbl = element('label', {text:label});
  const select = element('select', {'aria-label':label});
  values.forEach(value => { const opt = element('option', {value,text:value}); if (state[key] === value) opt.selected = true; select.append(opt); });
  select.addEventListener('change', () => setState({type:'set', key, value: select.value}));
  group.append(lbl,select); host.append(group);
}
function controlButton(host, label, title, action, disabled = false) {
  const group = element('div', {class:'mechanical-group'});
  group.append(element('label',{text:label}));
  const btn = element('button', {type:'button',text:title}); btn.disabled = disabled;
  btn.addEventListener('click', () => setState(action));
  group.append(btn); host.append(group);
}
function redrawControls() {
  const c = getCamera(cameraId); const host = $('mechanical-controls'); host.replaceChildren();
  $('active-camera-name').textContent = c.name;
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
function redrawPreview() {
  const isHistoricalApollo = cameraId === 'apollo' && $('operation-mode').value === 'historical' && !photo;
  const overlay = $('aiming-overlay'); overlay.style.display = isHistoricalApollo ? 'flex' : 'none';
  $('viewport-label').textContent = isHistoricalApollo ? 'HISTORICAL AIMING · NO REFLEX VIEW' : photo ? 'PROCESSED PHOTOGRAPH' : usingLive ? 'LIVE DIGITAL VIEW' : 'DEMONSTRATION SCENE';
  $('preview-info').textContent = photo ? `${photo.settings.summary} · ${provenance.method.toUpperCase()}` : usingLive ? 'LIVE CAMERA · PREVIEW ONLY' : 'SYNTHETIC DEMO · NOT A PHOTOGRAPH';
  $('demo-image').style.display = (usingLive || photo) ? 'none' : 'block';
  $('live-video').style.display = usingLive && !photo ? 'block' : 'none';
  $('photo-canvas').style.display = photo ? 'block' : 'none';
  if (cameraId === 'rolleiflex' && !photo) $('demo-image').style.transform = 'scaleX(-1)';
  else $('demo-image').style.transform = '';
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
    const renderSettings = { ...settings(), ...cameraRenderParams(cameraId, state, $('operation-mode').value), cameraSettings: { ...state } };
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
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
populateCameras();redrawControls();redrawPreview();
