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
  if (cameraId === 'apollo') stampReseau(out, width, height);
  const seed = (settings.seed ?? 123456789) >>> 0;
  const random = xorshift32(seed);
  const intensity = Math.max(0, Math.min(100, Math.round(settings.grain ?? 30)));
  const creativeWarmth = Math.max(-50, Math.min(50, Math.round(settings.warmth ?? 0)));
  const renderMode = settings.renderMode === 'creative' ? 'creative' : 'evidence';
  const warm = renderMode === 'creative' ? creativeWarmth : 0;
  const grainAmplitude = Math.floor((camera.grainBase * intensity + 50) / 100);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i], g = out[i + 1], b = out[i + 2];
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
