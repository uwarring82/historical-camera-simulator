/** Maps mechanical camera settings to render parameters. Phenomenological, NOT calibrated. */
const REF_F = 5.6, REF_T = 1 / 125;
const VIGNETTE_BY_F = { 2.8: 40, 4: 30, 5.6: 20, 8: 12, 11: 6, 16: 2 };

export function parseAperture(s) { const n = Number(String(s ?? '').replace(/^f\//, '')); return Number.isFinite(n) && n > 0 ? n : null; }
export function parseShutter(s) { const m = /^1\/(\d+)/.exec(String(s ?? '')); return m ? 1 / Number(m[1]) : null; }

export function cameraRenderParams(cameraId, state, operationMode = 'assisted') {
  const f = parseAperture(state.aperture), t = parseShutter(state.shutter);
  let exposureStops = 0, vignette = 0;
  if (cameraId === 'sx70') {
    exposureStops = (Number(state.compensation) || 0) * 0.5; // Lighten/darken dial; scale is a guess.
    vignette = 15;
  } else if (f && t) {
    // Settings always change density relative to the f/5.6 · 1/125 s reference (iPhone Safari cannot set real exposure).
    exposureStops = Math.max(-4, Math.min(4, Math.log2(t / REF_T) + 2 * Math.log2(REF_F / f)));
    vignette = VIGNETTE_BY_F[f] ?? 15;
  }
  return { exposureStops: Math.round(exposureStops * 100) / 100, vignette };
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
  const d = v <= HORIZON + 0.01 ? Infinity : (EYE_HEIGHT_M * 1000) / (v - HORIZON) * 0.65; // mm
  const invS = dof.focusMm ? 1 / dof.focusMm : 0, invD = Number.isFinite(d) ? 1 / d : 0;
  const S = dof.focusMm ?? Infinity;
  const coc = (dof.focalMm * dof.focalMm) / (dof.fNumber * (1 - dof.focalMm / S)) * Math.abs(invS - invD); // mm on the film
  return Math.min(MAX_BLUR_PX, Math.round(coc / dof.frameMm * widthPx * 0.5));
}
