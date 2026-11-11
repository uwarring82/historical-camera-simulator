# CI and Scientific Validation Handbook v0.1

Companion to [White Paper v0.3](whitepaper-v0.3.md). **Software consistency, historical evidence and scientific calibration are independent.** Passing software CI alone never certifies historical fidelity.

## Core CI

`.github/workflows/ci.yml` runs on pushes/PRs to `main` and manually: Node 22 setup; `npm ci --ignore-scripts`; syntax checks; unit/regression tests; static build; upload of deployment artifact. It has read-only permissions. No registry dependencies are needed in the core starter.

## Optional browser CI

`.github/workflows/browser.yml` runs weekly or manually. It installs pinned Playwright 1.65.0, the Chromium/WebKit browser engines, and runs UI smoke tests. It has not been verified in this isolated packaging environment. Playwright's WebKit is **not** actual iOS Safari; verify camera acquisition and export on a physical iPhone.

The browser-test package is optional and currently deliberately absent from the core lockfile. Before making browser tests a required gate, add the package to the lockfile in a registry-connected environment, pin its dependencies and rerun CI.

## Release and deployment

`.github/workflows/deploy.yml` is manual only. Configure GitHub Pages for GitHub Actions, review public assets and mark the Pages environment protected before deploying. For a research preview, avoid exposing photos or server-side image processing. Include source checksums and human-readable release notes in later releases.

## Mechanical invariants

- Apollo: remove magazine -> exposure blocked; electric advance conceptualized as automatic.
- SX-70: fold -> exposure blocked; load ten-frame historical pack; expose decrements count and requires development completion.
- Leica/Rolleiflex: expose -> manual advance needed; finite roll count.
- Camera controls should reject invalid transitions.

## Optical and rendering invariants

- All 25 réseau centers are in film coordinates; cross spacing nominal 10 mm, central arms doubled; their coordinates do not depend on lens distortion settings.
- Alpha preserved during reference rendering.
- Neutral images remain neutral in black-and-white simulation.
- Fixed source, parameters and seed produce identical byte output for the integer reference kernel.
- Any move to spatially correlated film grain requires new statistical calibration and regression fixtures.
- The final image's Nyquist limit must be part of every quantitative lens MTF claim.

## Evidence gates

Promotion from C to B requires an immutable source, method, model, validation report, domain, quantitative acceptance range, and independent review. Changing source data, fits, or numerical procedures invalidates the approval until new validation is complete. Do not accept a B classification automatically on the basis of a manufacturer's nominal datasheet alone.

## Proposed expansion of CI

1. Add frozen reference-image fixtures with hashes, color profiles and licenses.
2. Add intentionally reviewed golden images (never silently update them to pass tests).
3. Add calibrated slanted-edge SFR and manufacturer's MTF curve-fitting datasets.
4. Add constrained deterministic WASM or integer LUT reference pipeline before any floating-point high-fidelity renderer.
5. Add device capability metadata and manual iPhone release sign-off.
6. Pin GitHub Actions to reviewed immutable SHAs before public production operation.
7. Add accessibility, response latency, performance budgets and security checks.

The current checks are a functioning starter gate, not a complete implementation of these future assurance tasks.
