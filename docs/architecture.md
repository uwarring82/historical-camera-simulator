# Architecture — current starter

## Subsystems

- `src/cameras.mjs`: declarative camera registry with four models and provisional controls.
- `src/state.mjs`: pure mechanical state machine, separate from browser camera.
- `src/capture.mjs`: permissioned browser acquisition (`takePhoto` → `grabFrame` → video canvas); photo import and synthetic demo input.
- `src/reseau.mjs`: subpixel rectangle shadow coverage in film coordinates, nominal 53 mm recording width.
- `src/render.mjs`: deterministic integer RGBA **phenomenological** transform; film-plane shadows first, then color and simplified independent grain.
- `src/metadata.mjs`: export provenance and reproducibility configuration. No raw source storage.
- `src/app.mjs`: simple accessible-ish DOM workbench; no front-end framework.
- `public/sw.js`: same-origin app-shell cache; not an image archive.

## Critical separations

1. Historical camera state does not change physical iPhone settings.
2. Browser camera selection/capture is not film emulsion simulation.
3. Lens model and final output fidelity are separate: output Nyquist and processing matter.
4. Réseau shadow geometry is in film coordinates and downstream of any future lens distortion.
5. UI interaction, deterministic reference rendering and eventual GPU preview are distinct.

## Why no TypeScript/Vite in v0.1?

The packaging environment cannot access the npm registry. To avoid presenting an untestable or broken scaffold, the first runnable starter uses native browser ES modules and Node 22's built-in test runner, with **zero runtime and development npm dependencies** for core CI. A controlled migration to TypeScript/Vite and strict static typing remains recommended after the initial browser capability investigation. See [ADR 0001](adr/0001-zero-dependency-bootstrap.md). The current syntax checker is not a substitute for type checking.

## Known schema gaps

The state engine currently uses camera-specific action branches. It deliberately does not force SX-70's autoexposure/development into the Apollo schema. Stabilization is deferred until both end-to-end models are complete.
