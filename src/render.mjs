import { getCamera } from './cameras.mjs';
import { filmFor, densityNoise } from './film.mjs';
import { stampReseau } from './reseau.mjs';
import { rowBlurRadius } from './exposure.mjs';

// An sRGB input is our proxy for scene light. Compress highlights after exposure
// using a smooth shoulder; the transfer is an interpretation of a developed print.
const linear = Float64Array.from({length: 256}, (_, i) => {
  const v = i / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
});
const srgb = Float32Array.from({length: 8193}, (_, i) => {
  const l = i / 8192;
  return 255 * (l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1/2.4) - 0.055);
});
function printValue(light) {
  const shoulder = 0.70;
  const y = light <= shoulder ? light : 1 - (1 - shoulder) * Math.exp(-(light - shoulder) / (1 - shoulder));
  return srgb[Math.round(y * 8192)];
}
const clamp8 = n => n < 0 ? 0 : n > 255 ? 255 : n;
export function xorshift32(seed) {
  let s = (seed >>> 0) || 0x6d2b79f5;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return s >>> 0;
  };
}

/** rgba must be Uint8ClampedArray (or equivalent 8-bit typed array). Pure; never mutates input. */
export function renderReference({ data, width, height }, cameraId, settings = {}) {
  const camera = getCamera(cameraId);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || data.length !== width * height * 4) throw new RangeError('Invalid RGBA frame');
  const out = new Uint8ClampedArray(data);
  if (settings.dof) depthBlur(out, width, height, settings.dof);
  if (cameraId === 'apollo' && !settings.proof) stampReseau(out, width, height);
  const film = filmFor(cameraId, settings.filmId);
  const noise = densityNoise(film, camera.frameMm, width, xorshift32(settings.seed ?? 123456789));
  const grainScale = Math.max(0, Math.min(2, (settings.grain ?? 100) / 100));
  const warmth = settings.renderMode === 'creative' ? Math.max(-50, Math.min(50, settings.warmth || 0)) : 0;
  const gain = 2 ** (settings.exposureStops ?? 0);
  const falloff = Math.min(1, Math.max(0, (settings.vignette ?? 0) / 100));
  const cx = (width - 1) / 2, cy = (height - 1) / 2;
  const radius2 = cx * cx + cy * cy || 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = 4 * (y * width + x);
      const light = gain * (1 - falloff * ((x - cx) ** 2 + (y - cy) ** 2) / radius2);
      let r = linear[out[i]], g = linear[out[i+1]], b = linear[out[i+2]];
      if (film.color === 'bw') {
        r = g = b = 0.2126*r + 0.7152*g + 0.0722*b;
      } else if (film.color === 'instant') {
        [r,g,b] = [0.90*r+0.10*g, 0.07*r+0.88*g+0.05*b, 0.06*r+0.16*g+0.78*b];
      } else {
        [r,g,b] = [0.92*r+0.08*g, 0.05*r+0.92*g+0.03*b, 0.04*r+0.10*g+0.86*b];
      }
      // A density fluctuation becomes multiplicative in print light. The same
      // fluctuation affects all channels; dye-layer cross-correlations are unknown.
      const factor = light * (grainScale ? 10 ** (grainScale * noise(x)) : 1);
      out[i] = clamp8(printValue(r*factor) + warmth);
      out[i+1] = clamp8(printValue(g*factor) + warmth/4);
      out[i+2] = clamp8(printValue(b*factor) - warmth);
    }
  }
  return { data: out, width, height };
}

/** Row-dependent box blur (separable, prefix sums). Radius per row from the ground-plane focus model. */
export function depthBlur(px, w, h, dof) {
  const radii = new Uint8Array(h); let any = false;
  for (let y = 0; y < h; y++) { radii[y] = rowBlurRadius(dof, (y + 0.5) / h, w); if (radii[y]) any = true; }
  if (!any) return;
  const tmp = new Uint8ClampedArray(px.length);
  const row = new Uint32Array((w + 1) * 3);
  for (let y = 0; y < h; y++) { // horizontal
    const r = radii[y], base = y * w * 4;
    for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) row[(x + 1) * 3 + c] = row[x * 3 + c] + px[base + x * 4 + c];
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w - 1, x + r), n = x1 - x0 + 1;
      for (let c = 0; c < 3; c++) tmp[base + x * 4 + c] = ((row[(x1 + 1) * 3 + c] - row[x0 * 3 + c]) + (n >> 1)) / n | 0;
      tmp[base + x * 4 + 3] = px[base + x * 4 + 3];
    }
  }
  const col = new Uint32Array((h + 1) * 3);
  for (let x = 0; x < w; x++) { // vertical
    for (let y = 0; y < h; y++) for (let c = 0; c < 3; c++) col[(y + 1) * 3 + c] = col[y * 3 + c] + tmp[(y * w + x) * 4 + c];
    for (let y = 0; y < h; y++) {
      const r = radii[y], y0 = Math.max(0, y - r), y1 = Math.min(h - 1, y + r), n = y1 - y0 + 1;
      for (let c = 0; c < 3; c++) px[(y * w + x) * 4 + c] = ((col[(y1 + 1) * 3 + c] - col[y0 * 3 + c]) + (n >> 1)) / n | 0;
    }
  }
}
