/** Browser capture adapter. Photo resolution/metadata must be measured on actual iPhones. */
export class CaptureAdapter {
  constructor(video) { this.video = video; this.stream = null; this.method = 'demo'; }
  async start(deviceId = null) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera unavailable. Use HTTPS on an iPhone or import an image.');
    this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } }), width: { ideal: 3840 }, height: { ideal: 2160 } } });
    this.video.srcObject = this.stream;
    await this.video.play();
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

export function sourceToFrame(source, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
  if (!ctx) throw new Error('2D canvas unavailable');
  const iw = source.width, ih = source.height;
  const scale = Math.max(width / iw, height / ih);
  const sw = width / scale, sh = height / scale;
  ctx.drawImage(source, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}
