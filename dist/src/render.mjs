import { getCamera } from './cameras.mjs';
import { stampReseau } from './reseau.mjs';

// Deterministic integer-only reference transform; not a calibrated film response.
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
  // Optical processing will occur here before film-plane marks; v0.1 has no calibrated lens convolution.
  const vignette = Math.max(0, Math.min(100, Math.round(settings.vignette ?? 0)));
  if (vignette > 0) {
    // Integer radial falloff (cos^4-like): darkens corners, scaled by aperture-derived strength.
    const cx2 = width - 1, cy2 = height - 1, maxR2 = cx2 * cx2 + cy2 * cy2 || 1;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const dx = 2 * x - cx2, dy = 2 * y - cy2;
      const r2 = Math.floor(((dx * dx + dy * dy) * 1024) / maxR2);
      const mult = 256 - Math.floor((vignette * r2 * 256) / (100 * 1024));
      const i = (y * width + x) * 4;
      out[i] = (out[i] * mult) >> 8; out[i + 1] = (out[i + 1] * mult) >> 8; out[i + 2] = (out[i + 2] * mult) >> 8;
    }
  }
  if (cameraId === 'apollo') stampReseau(out, width, height);
  const seed = (settings.seed ?? 123456789) >>> 0;
  const random = xorshift32(seed);
  const intensity = Math.max(0, Math.min(100, Math.round(settings.grain ?? 30)));
  const creativeWarmth = Math.max(-50, Math.min(50, Math.round(settings.warmth ?? 0)));
  const renderMode = settings.renderMode === 'creative' ? 'creative' : 'evidence';
  const warm = renderMode === 'creative' ? creativeWarmth : 0;
  const gain = Math.round(256 * Math.pow(2, Math.max(-4, Math.min(4, settings.exposureStops ?? 0))));
  const grainAmplitude = Math.floor((camera.grainBase * intensity + 50) / 100);
  for (let i = 0; i < out.length; i += 4) {
    const r = clamp8((out[i] * gain + 128) >> 8), g = clamp8((out[i + 1] * gain + 128) >> 8), b = clamp8((out[i + 2] * gain + 128) >> 8);
    let rr, gg, bb;
    if (camera.color === 'bw') {
      const gray = (77 * r + 150 * g + 29 * b + 128) >> 8;
      rr = gray; gg = gray; bb = gray;
    } else if (camera.color === 'apollo') {
      rr = (216 * r + 20 * g + 12 * b + 124) >> 8;
      gg = (12 * r + 233 * g + 11 * b + 128) >> 8;
      bb = (9 * r + 27 * g + 205 * b + 128) >> 8;
    } else {
      rr = (231 * r + 23 * g + 2 * b + 128) >> 8;
      gg = (19 * r + 220 * g + 13 * b + 128) >> 8;
      bb = (12 * r + 39 * g + 197 * b + 128) >> 8;
    }
    // Fixed-grid, independent integer grain in this *starter*. Correlated grain is a Phase 5 goal.
    const noise = grainAmplitude === 0 ? 0 : (random() % (2 * grainAmplitude + 1)) - grainAmplitude;
    out[i] = clamp8(rr + noise + warm);
    out[i + 1] = clamp8(gg + noise + (warm >> 2));
    out[i + 2] = clamp8(bb + noise - warm);
    out[i + 3] = data[i + 3];
  }
  return { data: out, width, height };
}
