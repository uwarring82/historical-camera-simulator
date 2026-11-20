import { filmFor } from './film.mjs';

// The browser supplies a developed picture with unknown scene radiance. Treat its
// middle gray as correctly exposed at ISO 100, f/5.6, 1/125 s for relative comparisons.
const REF_F = 5.6, REF_T = 1 / 125;
export function parseAperture(s) {
  const n = Number(String(s ?? '').replace(/^f\//, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}
export function parseShutter(s) {
  const m = /^(?:(1)\/)?([\d.]+) s$/.exec(String(s));
  if (!m || !(Number(m[2]) > 0)) return null;
  return m[1] ? 1 / Number(m[2]) : Number(m[2]);
}
export function cameraRenderParams(cameraId, state) {
  const film = filmFor(cameraId, state.filmId);
  const speedStops = Math.log2(film.iso / 100);
  const f = parseAperture(state.aperture), t = parseShutter(state.shutter);
  const cameraStops = cameraId === 'sx70' ? Number(state.compensation || 0) * 0.5 :
    f && t ? Math.log2(t / REF_T) + 2 * Math.log2(REF_F / f) : 0;
  const vignette = f ? Math.min(40, 20 * (REF_F / f) ** 1.6) : 15;
  return { filmId: state.filmId, exposureStops: cameraStops + speedStops, vignette };
}

// Approximate a broad reflected-light meter on the already developed input.
// Weight the centre gently, with a small floor to keep black borders finite.
const linear = Array.from({length:256}, (_,i) => i <= 10 ? i/3294.6 : ((i/255+0.055)/1.055)**2.4);
export function meterStops({data,width,height}) {
  let sum = 0, weights = 0;
  for (let y=0; y<height; y++) for (let x=0; x<width; x++) {
    const i = (y*width+x)*4;
    const weight = 2 - ((x+0.5)/width-0.5)**2*2 - ((y+0.5)/height-0.5)**2*2;
    const lum = 0.2126*linear[data[i]] + 0.7152*linear[data[i+1]] + 0.0722*linear[data[i+2]];
    sum += weight*Math.log2(Math.max(0.001,lum)); weights += weight;
  }
  return Math.max(-4,Math.min(4,Math.log2(0.18)-sum/weights));
}

export function settingsSummary(cameraId, state) {
  if (cameraId === 'sx70') return `${state.focus} · L/D ${state.compensation}`;
  return `${state.aperture} · ${state.shutter} · ${state.focus}`;
}

// --- Focus / depth of field (heuristic) -------------------------------------------------
// A photo has no depth map. We assume a flat ground plane seen from 1.2 m height with the
// horizon at 45% of frame height; everything above the horizon is at infinity. This is a
// crude stand-in so that focus + aperture visibly matter. NOT a calibrated optical model.
export const HORIZON = 0.45, EYE_HEIGHT_M = 1.2, MAX_BLUR_PX = 14;
export function parseFocusMm(s) { const m = /^([\d.]+)\s*m/.exec(String(s ?? '')); return m ? Number(m[1]) * 1000 : null; } // null = infinity
export function dofParams(camera, state) {
  const N = parseAperture(state.aperture) ?? 8; // SX-70 has no aperture control: nominal f/8 assumed
  return { focalMm: camera.nominalFocalMm, fNumber: N, focusMm: parseFocusMm(state.focus), frameMm: camera.frameMm };
}
/** Blur radius in px at relative frame height v (0 top .. 1 bottom) for an image `widthPx` wide. */
export function rowBlurRadius(dof, v, widthPx) {
  const d = dof.distantScene || v <= HORIZON + 0.01 ? Infinity : (EYE_HEIGHT_M * 1000) / (v - HORIZON) * 0.65; // mm
  const invS = dof.focusMm ? 1 / dof.focusMm : 0, invD = Number.isFinite(d) ? 1 / d : 0;
  const S = dof.focusMm ?? Infinity;
  const coc = (dof.focalMm * dof.focalMm) / (dof.fNumber * (1 - dof.focalMm / S)) * Math.abs(invS - invD); // mm on the film
  return Math.min(MAX_BLUR_PX, Math.round(coc / dof.frameMm * widthPx * 0.5));
}
