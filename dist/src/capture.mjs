import { CAMERAS } from './cameras.mjs?v=fde86c21ec6991c7';

/** Browser capture adapter. Photo resolution/metadata must be measured on actual iPhones. */
export class CaptureAdapter {
  constructor(video) { this.video = video; this.stream = null; this.method = 'demo'; }
  async start(deviceId = null) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera unavailable. Use HTTPS on an iPhone or import an image.');
    this.stop();
    const generation = this.generation;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } }), width: { ideal: 3840 }, height: { ideal: 2160 } } });
    if (this.generation !== generation) {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('Camera request superseded.');
    }
    this.stream = stream;
    this.video.srcObject = stream;
    await this.video.play();
    if (this.generation !== generation) throw new Error('Camera request superseded.');
    this.method = 'live';
    const track = this.stream.getVideoTracks()[0];
    return { width: this.video.videoWidth, height: this.video.videoHeight, label: track?.label ?? '', deviceId: track?.getSettings?.().deviceId ?? deviceId };
  }
  /** Rear lenses; labels (e.g. "Back Ultra Wide Camera") are only exposed after permission is granted. */
  async lenses() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'videoinput' && !/front|user|facetime/i.test(d.label));
  }
  stop() {
    this.generation = (this.generation || 0) + 1;
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.video.srcObject = null;
  }
  async photo() {
    if (!this.stream) throw new Error('Start camera first.');
    const track = this.stream.getVideoTracks()[0];
    if (typeof globalThis.ImageCapture === 'function') {
      const capture = new globalThis.ImageCapture(track);
      if (typeof capture.takePhoto === 'function') {
        try { const blob = await capture.takePhoto(); return { bitmap: await createImageBitmap(blob), method: 'takePhoto', bytes: blob.size }; }
        catch (err) { console.warn('takePhoto failed; using a fallback.', err); }
      }
      if (typeof capture.grabFrame === 'function') {
        try { return { bitmap: await capture.grabFrame(), method: 'grabFrame', bytes: null }; }
        catch (err) { console.warn('grabFrame failed; using canvas.', err); }
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = this.video.videoWidth; canvas.height = this.video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2D canvas unavailable');
    ctx.drawImage(this.video, 0, 0);
    return { bitmap: await createImageBitmap(canvas), method: 'videoCanvas', bytes: null };
  }
}

export async function imageFromFile(file) {
  if (!file || (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.dng'))) throw new Error('Select an image file.');
  try { return { bitmap: await createImageBitmap(file), method: 'import', bytes: file.size }; }
  catch { throw new Error('Cannot decode this image in Safari. If it is a DNG, first export a compatible photo; DNG processing is planned.'); }
}
export async function imageFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Demo image not available offline.');
  return { bitmap: await createImageBitmap(await response.blob()), method: 'demo', bytes: null };
}

// Angular spans on a rectilinear source plane (twice tan of half the field).
// Reserve scene around both Leica frames so there is real image outside the taking gate.
const leicaWindowMm = 35 / 1.08;
const maxSpanX = Math.max(36 / leicaWindowMm, ...Object.values(CAMERAS).map(c => c.frameMm / c.nominalFocalMm));
const maxSpanY = Math.max(24 / leicaWindowMm, ...Object.values(CAMERAS).map(c => c.frameHeightMm / c.nominalFocalMm));

export function viewGeometry(camera, iw, ih, {historical = false, magnification = 1} = {}) {
  const focal = historical && camera.id === 'leica' ? leicaWindowMm : camera.nominalFocalMm;
  const scale = Math.min(iw / maxSpanX, ih / maxSpanY) / (focal * magnification);
  const width = camera.frameMm * scale, height = camera.frameHeightMm * scale;
  return {x:(iw-width)/2, y:(ih-height)/2, width, height};
}

export function frameSize(camera, iw, ih, limit = 1600, view) {
  const crop = viewGeometry(camera, iw, ih, view);
  const scale = Math.min(1, limit / crop.width);
  return {width:Math.max(1, Math.round(crop.width * scale)), height:Math.max(1, Math.round(crop.height * scale))};
}

export function sourceToFrame(source, width, height, crop, canvas = document.createElement('canvas')) {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
  if (!ctx) throw new Error('2D canvas unavailable');
  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}
