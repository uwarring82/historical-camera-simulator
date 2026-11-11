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
