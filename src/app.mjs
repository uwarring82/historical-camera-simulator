import { CAMERA_ORDER, getCamera } from './cameras.mjs';
import { FILMS, FILM_OPTIONS, filmSpeedLabel } from './film.mjs';
import { newCameraState, updateCamera, canExpose, cameraStatus } from './state.mjs';
import { renderReference, depthBlur } from './render.mjs';
import { CaptureAdapter, imageFromFile, sourceToFrame, frameSize, viewGeometry } from './capture.mjs';
import { cameraRenderParams, meterStops, settingsSummary, dofParams } from './exposure.mjs';
import { photographMetadata, downloadBlob } from './metadata.mjs';
import { cameraArtwork } from './illustrations.mjs';
import './site.mjs';

const $ = id => document.getElementById(id);
const bodies = Object.fromEntries(CAMERA_ORDER.map(id => [id, newCameraState(id)]));
const requested = new URLSearchParams(location.search).get('camera');
let id = CAMERA_ORDER.includes(requested) ? requested : 'apollo';
let source = 'demo', imported = null, sourceRequest = 0, sourceLabel = '';
let proofTimer = 0, captured = null, busy = false, serial = 0, printUrl = '';
let loupeRaised = false, liveLimit = 360;
const capture = new CaptureAdapter($('live-video'));
const proofBuffer = document.createElement('canvas');
const meterBuffer = document.createElement('canvas');
const finders = {apollo:'Chest-level aiming', leica:'Bright-line finder', rolleiflex:'Waist-level finder', sx70:'Reflex finder'};
const format = {apollo:'70 mm magazine', leica:'35 mm roll', rolleiflex:'120 roll', sx70:'Integral pack'};
const state = () => bodies[id];
const film = () => FILMS[state().filmId];
const inputSource = () => source === 'live' ? $('live-video') : source === 'import' ? imported : $('demo-image');
const el = (tag, text = '') => Object.assign(document.createElement(tag), {textContent:text});

function message(text, error = false) {
  $('feedback').textContent = text;
  $('feedback').classList.toggle('error',error);
}
function apply(action, redraw = true) {
  bodies[id] = updateCamera(state(), action);
  if (redraw) update();
  else refreshFinder();
}
function makeAction(host, label, title, action, disabled = false, pressed) {
  const group = el('fieldset'), button = el('button', title);
  group.className = 'mechanical-group mechanical-action';
  group.append(el('legend',label), button);
  button.className = pressed === undefined ? 'hardware-action' : 'magazine-switch';
  button.type = 'button'; button.disabled = disabled; button.dataset.key = action.type;
  if (pressed !== undefined) {
    button.setAttribute('aria-label','Film magazine loaded');
    button.setAttribute('aria-pressed', String(pressed));
  }
  button.onclick = () => {
    apply(action);
    host.querySelector('[data-key="' + action.type + '"]:not(:disabled)')?.focus({preventScroll:true});
  };
  host.append(group);
}
function makeDial(host, label, key, values) {
  const group = el('fieldset'), hardware = el('div'), knob = el('div'), pointer = el('span'), value = el('span');
  group.className = 'mechanical-group'; group.dataset.control = key;
  hardware.className = 'dial-hardware'; hardware.setAttribute('aria-hidden','true');
  knob.className = 'dial-knob'; pointer.className = 'dial-pointer'; value.className = 'dial-value';
  hardware.append(knob); knob.append(pointer,value);
  const adjust = el('div'), range = el('input'), minus = el('button','−'), plus = el('button','+');
  adjust.className = 'dial-adjust';
  Object.assign(range,{type:'range', min:0, max:values.length-1, step:1, value:values.indexOf(state()[key]), id:'control-'+key});
  range.setAttribute('aria-label',label);
  for (const [button,word,step] of [[minus,'Decrease',-1],[plus,'Increase',1]]) {
    button.type = 'button'; button.setAttribute('aria-label',word+' '+label.toLowerCase());
    button.onclick = () => { range.value = Number(range.value) + step; change(); };
  }
  function draw() {
    const n = Number(range.value);
    value.textContent = values[n].replace(' s','');
    pointer.style.setProperty('--dial-angle', (-130 + 260*n/(values.length-1))+'deg');
    range.setAttribute('aria-valuetext',values[n]);
    minus.disabled = n === 0; plus.disabled = n === values.length-1;
  }
  function change() { draw(); apply({type:'set',key,value:values[Number(range.value)]},false); }
  range.oninput = change;
  adjust.append(minus,range,plus); group.append(el('legend',label),hardware,adjust);host.append(group);draw();
}
function cameraControls() {
  const c = getCamera(id), s = state(), host = $('mechanical-controls');
  host.replaceChildren();
  if (id === 'sx70') {
    makeDial(host,'Focus distance','focus',['0.3 m','0.6 m','1 m','2 m','∞']);
    makeDial(host,'Lighten / darken','compensation',['-2','-1','0','+1','+2']);
    makeAction(host,'Body',s.open ? 'Fold camera':'Unfold camera',{type:'toggle-fold'});
    makeAction(host,'Film pack',s.remaining ? s.remaining+' exposures' : 'Insert 8-frame pack',{type:'load'},!s.open || s.remaining > 0);
  } else {
    makeDial(host,id === 'apollo' ? 'Lens aperture' : 'Aperture','aperture',c.apertureOptions);
    makeDial(host,'Shutter time','shutter',c.shutterOptions);
    makeDial(host,'Distance scale','focus',id==='apollo' ? ['1.5 m','3 m','5 m','10 m','∞'] : ['1 m','2 m','3 m','5 m','∞']);
    if (id === 'apollo') {
      const loaded = s.magazine === 'loaded';
      makeAction(host,'Magazine',loaded ? 'Remove magazine':'Attach magazine',{type:'set',key:'magazine',value:loaded?'removed':'loaded'},false,loaded);
    } else if (s.remaining) {
      makeAction(host,'Film transport',s.ready ? 'Shutter cocked':'Advance film',{type:'advance'},s.ready);
    } else makeAction(host,'Film transport','Load new virtual roll',{type:'load'});
  }
}
function settings(seed, media = inputSource()) {
  const simulated = cameraRenderParams(id,state());
  if (id === 'sx70' && media && (source === 'demo' ? media.naturalWidth : media.videoWidth || media.width)) {
    const crop = viewGeometry(getCamera(id), media.videoWidth || media.naturalWidth || media.width, media.videoHeight || media.naturalHeight || media.height);
    simulated.autoMeterStops = meterStops(sourceToFrame(media,32,32,crop,meterBuffer));
    simulated.exposureStops += simulated.autoMeterStops;
  }
  const creative = $('render-mode').value === 'creative';
  return {...simulated, dof:{...dofParams(getCamera(id),state()), distantScene:source==='demo'}, dofModel:source==='demo'?'distant-landscape':'flat-ground-heuristic',
    grain:creative ? Number($('grain').value) : 100, warmth:creative ? Number($('warmth').value) : 0,
    renderMode:$('render-mode').value, operationMode:$('operation-mode').value, seed,
    summary:settingsSummary(id,state())+' · '+filmSpeedLabel(state().filmId,film())};
}
function blindReason() {
  if (id === 'sx70' && !state().open) return 'Camera folded';
  if (id === 'apollo' && $('operation-mode').value === 'historical') return 'Chest mount · no optical finder';
  return '';
}
function setExposureDisplay(stops) {
  $('preview-ev').textContent = (stops>=0?'+':'')+stops.toFixed(1)+' stops';
  $('shutter-hint').dataset.ev = stops.toFixed(2);
}
function paintFinder() {
  clearTimeout(proofTimer);
  if (document.hidden || blindReason()) return;
  const media = inputSource(), proof = $('proof');
  if (source === 'demo' && !media.naturalWidth || source === 'live' && !media.videoWidth) return;
  const camera = getCamera(id);
  const started = performance.now();
  const historical = $('operation-mode').value === 'historical';
  const magnification = historical && id === 'rolleiflex' && loupeRaised ? 2.5 : 1;
  const view = {historical,magnification};
  const iw = media.videoWidth || media.naturalWidth || media.width;
  const ih = media.videoHeight || media.naturalHeight || media.height;
  const displayPixels = Math.max(80, Math.round($('media-stage').clientWidth * devicePixelRatio));
  const limit = Math.min(source === 'live' ? liveLimit : 540, displayPixels);
  const size = frameSize(camera, iw, ih, limit, view);
  const frame = sourceToFrame(media,size.width,size.height,viewGeometry(camera,iw,ih,view),proofBuffer);
  const rendering = settings(0x172017);
  setExposureDisplay(rendering.exposureStops);
  let pixels = frame;
  if (!historical) {
    pixels = renderReference(frame,id,{...rendering,proof:true});
  } else if (id === 'sx70' || id === 'rolleiflex') {
    // The Rolleiflex viewing lens stays open as the taking aperture changes.
    const dof = dofParams(camera,{...state(),aperture:id==='rolleiflex'?'f/2.8':'f/8'});
    dof.distantScene = source==='demo';
    dof.magnification = magnification;
    depthBlur(pixels.data,size.width,size.height,dof);
  }
  if (proof.width !== size.width) proof.width = size.width;
  if (proof.height !== size.height) proof.height = size.height;
  proof.getContext('2d').putImageData(new ImageData(pixels.data,size.width,size.height),0,0);
  if (source === 'live') {
    // A slow device can lower finder sampling. Capture always uses the full gate.
    const elapsed = performance.now() - started;
    if (elapsed > 35) liveLimit = Math.max(144, Math.round(limit * 0.82));
    else if (elapsed < 17) liveLimit = Math.min(540, liveLimit + 16);
    proofTimer = setTimeout(paintFinder, Math.max(12, 85 - elapsed));
  }
}
function refreshFinder() {
  const stage = $('media-stage'), c = getCamera(id), assisted = $('operation-mode').value === 'assisted';
  stage.style.setProperty('--aspect',c.frameMm+'/'+c.frameHeightMm);
  stage.dataset.finder = id;
  stage.dataset.view = assisted ? 'proof' : 'optical';
  $('loupe').hidden = assisted || id !== 'rolleiflex';
  $('loupe').setAttribute('aria-pressed',String(loupeRaised));
  $('loupe').title = loupeRaised ? 'Lower focusing magnifier' : 'Raise focusing magnifier';
  $('loupe').firstElementChild.textContent = loupeRaised ? '2.5×' : 'Loupe';
  stage.dataset.loupe = String(!$('loupe').hidden && loupeRaised);
  $('proof').setAttribute('aria-label',assisted?'Simulated film preview':finders[id]);
  const reason = blindReason();
  $('blind-label').textContent = reason; $('blind-label').hidden = !reason;
  $('finder-lines').hidden = Boolean(reason); $('proof').hidden = Boolean(reason);
  $('viewport-label').textContent = (source === 'live' ? 'Live' : source === 'import' ? 'Import':'Demo')+' · '+(assisted?'Film preview':finders[id]);
  setExposureDisplay(cameraRenderParams(id,state()).exposureStops);
  $('shutter-hint').textContent = settingsSummary(id,state())+' · '+filmSpeedLabel(state().filmId,film());
  paintFinder();
}
function update() {
  const c = getCamera(id), s = state(), stock = film();
  $('active-camera-name').textContent = c.name;
  $('camera-description').textContent = c.year+' · '+c.subtitle;
  $('workbench').dataset.camera = id; $('camera-story-link').href = './learn.html?chapter='+id;
  $('instrument-engraving').textContent = format[id].toUpperCase()+' / '+c.nominalFocalMm+' MM';
  $('frame-label').textContent = 'FRAME '+String(s.framesTaken + 1).padStart(3,'0');
  $('mechanical-status').textContent = cameraStatus(s);
  for (const button of $('camera-options').children) button.setAttribute('aria-pressed',String(button.dataset.camera===id));
  cameraControls();
  $('film-stock').replaceChildren(...FILM_OPTIONS[id].map(key => new Option(FILMS[key].name,key)));
  $('film-stock').value = s.filmId; $('film-stock').disabled = FILM_OPTIONS[id].length===1;
  $('iso-value').textContent = filmSpeedLabel(s.filmId,stock);
  $('grain-info').textContent = stock.measured ? 'RMS '+Math.round(1000*stock.rms48)+' · 48 µm' : 'Estimated grain';
  $('shutter').disabled = busy || !canExpose(s);
  $('use-demo').setAttribute('aria-pressed',String(source==='demo'));
  $('start-camera').setAttribute('aria-pressed',String(source==='live'));
  $('live-video').hidden = source !== 'live';
  $('demo-credit').hidden = source !== 'demo';
  $('lens-select').hidden = source!=='live' || $('lens-select').length<2;
  $('adjustments').hidden = $('render-mode').value !== 'creative';
  refreshFinder();
}
for (const key of CAMERA_ORDER) {
  const c = getCamera(key), button = el('button');
  button.innerHTML = cameraArtwork(key,'choice-'+key); button.append(el('span',c.short));
  button.type='button';button.className='camera-option';button.dataset.camera=key;button.setAttribute('aria-label',c.name);
  button.onclick = () => {
    id=key;const url=new URL(location.href);url.searchParams.set('camera',key);history.replaceState(null,'',url);
    message('');update();
  };
  $('camera-options').append(button);
}

async function expose() {
  if (busy || !canExpose(state())) return;
  busy = true; $('shutter').disabled = true; $('workbench').inert = true; $('camera-options').inert = true;
  const body = id, before = state(), input = source;

  let acquired;
  try {
    if (input === 'live') acquired = await capture.photo();
    if (input === 'demo') await $('demo-image').decode();
    const media = acquired?.bitmap || inputSource();
    const renderSettings = settings(0x172017 + serial + 1, media);
    const iw = media.naturalWidth || media.width, ih = media.naturalHeight || media.height;
    const c = getCamera(body), {width,height} = frameSize(c,iw,ih);
    const crop = viewGeometry(c,iw,ih);
    const result = renderReference(sourceToFrame(media,width,height,crop),body,renderSettings);
    const canvas = document.createElement('canvas');canvas.width=width;canvas.height=height;
    canvas.getContext('2d').putImageData(new ImageData(result.data,width,height),0,0);
    const after = updateCamera(before,{type:'expose'});
    const provenance = {method:acquired?.method || input, sourceWidth:iw,sourceHeight:ih,outputWidth:width,outputHeight:height,
      crop, projection:'relative-rectilinear', calibration:'relative',imageInput:input,lens:input==='live'?sourceLabel:null};
    if (input === 'demo') provenance.attribution = {
      title:'Fronalpstock big', creator:'Hannes Röst', source:'https://commons.wikimedia.org/wiki/File:Fronalpstock_big.jpg',
      license:'CC BY-SA 3.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/', changes:'Resized, cropped and rendered through the selected film model.'
    };
    const thumbnail = $('photo-canvas');thumbnail.width=84;thumbnail.height=Math.round(84*height/width);
    thumbnail.getContext('2d').drawImage(canvas,0,0,thumbnail.width,thumbnail.height);thumbnail.hidden=false;
    bodies[body] = after; serial++;
    captured = {canvas,metadata:photographMetadata(body,before,renderSettings,provenance),title:c.name+' · Frame '+after.framesTaken,
      filename:'camera-archive-'+body+'-'+String(serial).padStart(3,'0')};
    $('review').disabled=false;$('export').disabled=false;
    message('Frame '+after.framesTaken+' saved in session · '+width+' × '+height+' px.');
  } catch(err) {message(err.message || 'Capture failed.',true);}
  finally {
    acquired?.bitmap.close?.(); busy=false;$('workbench').inert=false;$('camera-options').inert=false;update();
  }
}
function metadataBlob(frame) {return new Blob([JSON.stringify(frame.metadata,null,2)],{type:'application/json'});}
function pngOf(frame) { return new Promise((resolve,reject)=>frame.canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG export failed.')),'image/png')); }
async function exportPhoto() {
  const frame = captured;if (!frame) return;
  try {
    const png = await pngOf(frame), file = new File([png],frame.filename+'.png',{type:'image/png'});
    if (navigator.canShare?.({files:[file]})) {
      await navigator.share({files:[file],title:frame.title});message('Photo shared. Frame metadata is available in Last frame.');return;
    }
    downloadBlob(png,file.name);downloadBlob(metadataBlob(frame),frame.filename+'.json');message('PNG and frame metadata exported.');
  } catch(err) {if (err.name!=='AbortError') message(err.message,true);}
}
function releaseImport() {imported?.close();imported=null;}
function demo() {
  sourceRequest++;capture.stop();releaseImport();source='demo';message('Demo scene ready.');update();
}
async function startLive(deviceId=null) {
  const request=++sourceRequest;
  try {
    const info=await capture.start(deviceId);
    if(request!==sourceRequest)return;
    releaseImport();source='live';sourceLabel=info.label;message(info.label || 'Live camera ready.');update();
    const lenses=await capture.lenses().catch(()=>[]);
    if(request!==sourceRequest)return;
    $('lens-select').replaceChildren(...lenses.map(l=>new Option(l.label||'Camera',l.deviceId,false,l.deviceId===info.deviceId)));
    update();
  } catch(err) {
    if(request!==sourceRequest)return;
    capture.stop();if(source==='live') source='demo';update();message('Camera unavailable. '+err.message,true);
  }
}
$('demo-image').hidden=true;$('live-video').hidden=true;
$('demo-image').onload=refreshFinder;$('live-video').onloadeddata=refreshFinder;
$('start-camera').onclick=()=>startLive();$('lens-select').onchange=e=>startLive(e.target.value);$('use-demo').onclick=demo;
$('import-file').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  const request=++sourceRequest;e.target.value='';
  try{
    const {bitmap}=await imageFromFile(file);
    if(request!==sourceRequest){bitmap.close();return;}
    capture.stop();releaseImport();imported=bitmap;source='import';message('Imported '+bitmap.width+' × '+bitmap.height+' px.');update();
  }catch(err){if(request===sourceRequest)message(err.message,true);}
};
$('loupe').onclick=()=>{loupeRaised=!loupeRaised;refreshFinder();};
$('shutter').onclick=expose;$('export').onclick=exportPhoto;
$('film-stock').onchange=e=>{apply({type:'change-film',filmId:e.target.value});message('Fresh '+format[id].toLowerCase()+' loaded.');};
$('render-mode').onchange=update;$('operation-mode').onchange=refreshFinder;
for(const key of ['grain','warmth']) $(key).oninput=()=>{$(key+'-value').value=$(key).value+(key==='grain'?'%':'');refreshFinder();};
$('review').onclick=async()=>{
  const frame=captured;
  try {
    const png=await pngOf(frame);if(printUrl)URL.revokeObjectURL(printUrl);printUrl=URL.createObjectURL(png);
    $('print-title').textContent=frame.title;$('print-settings').textContent=frame.metadata.film.name+' · '+frame.metadata.simulation.settings.summary;
    $('print-mat').dataset.camera=frame.metadata.camera.id;
    $('print-image').src=printUrl;$('print-mat').classList.remove('zoom');$('zoom-print').setAttribute('aria-pressed','false');
    $('print-dialog').showModal();
  }catch(err){message(err.message,true);}
};
$('zoom-print').onclick=()=>{const zoom=$('print-mat').classList.toggle('zoom');$('zoom-print').setAttribute('aria-pressed',String(zoom));};
$('close-print').onclick=()=>$('print-dialog').close();
$('save-metadata').onclick=()=>{if(captured)downloadBlob(metadataBlob(captured),captured.filename+'.json');};
$('print-dialog').onclose=()=>{if(printUrl)URL.revokeObjectURL(printUrl);printUrl='';};
const fs=$('fullscreen');
const standalone = matchMedia('(display-mode: standalone)');
function screenState() {
  const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  fs.hidden = standalone.matches || navigator.standalone === true;
  fs.setAttribute('aria-pressed',String(active));
  fs.textContent = active ? 'Exit full screen' : 'Full screen';
}
fs.onclick = async () => {
  const root = document.documentElement;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
    else if (document.fullscreenEnabled) await root.requestFullscreen();
    else if (document.webkitFullscreenEnabled) root.webkitRequestFullscreen();
    else $('screen-help').showModal();
  } catch { $('screen-help').showModal(); }
  screenState();
};
$('close-screen-help').onclick = () => $('screen-help').close();
document.addEventListener('fullscreenchange',screenState);document.addEventListener('webkitfullscreenchange',screenState);
standalone.addEventListener('change',screenState);screenState();
new ResizeObserver(()=>refreshFinder()).observe($('media-stage'));
document.addEventListener('visibilitychange',refreshFinder);
window.addEventListener('pagehide',()=>{sourceRequest++;capture.stop();if(source==='live')source='demo';clearTimeout(proofTimer);});
window.addEventListener('pageshow',update);
update();
