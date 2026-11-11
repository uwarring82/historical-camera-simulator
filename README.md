# Camera Archive — Historical Camera Simulator

**Repository startup package v0.1.0 | 11 November 2026**

An iPhone-first, local-only starter web application for four historical cameras: **Apollo 17 Hasselblad**, **Polaroid SX-70**, **Leica M1**, and **Rolleiflex 2.8F**. Includes an interactive control workbench, a deliberately simplified Level-C image transform, NASA-inspired film-plane réseau crosses, PNG + JSON exports, and CI/testing infrastructure.

> **Status: research starter, NOT a validated historic optics/film simulator.** Apollo and SX-70 are the first architecture test cases. All four are selectable; their mechanical states are simplified. The present renderer is intentionally phenomenological, not calibrated. There is no DNG decoder, optical MTF convolution, measured film characteristic curve, live grain preview, genuine instant-film kinetics or calibrated focus/exposure control yet.

## Start on your Mac

Prerequisite: Node.js **22 or newer**. No npm dependencies are required by the core starter.

```sh
unzip historical-camera-simulator-startup-v0.1.0.zip
cd historical-camera-simulator
npm ci
npm run check
npm run dev
```

Open **http://localhost:5173** on the Mac. Choose a camera, leave the source as the included synthetic demonstration landscape, prepare any required controls, press the shutter, and export the PNG + JSON files. You can also import a photograph without enabling the camera.

To initialize your own Git repository after unpacking:

```sh
git init -b main
git add .
git commit -m "Initial historical camera simulator starter"
```

### Use on an iPhone

Safari camera access needs a **secure context (HTTPS)** except for localhost on the device itself. `http://<your-Mac-IP>:5173` is **not sufficient** for iPhone camera access. To use the web camera, deploy the built static site (`dist/`) behind HTTPS. A manual GitHub Pages workflow is included; configure the repository's Pages source to **GitHub Actions** and explicitly run `Publish reviewed public preview` only after checking rights and privacy. Then open the HTTPS site in Safari and optionally **Add to Home Screen**.

The webpage requests camera permission only when **Start camera** is pressed. Captures and imports are processed in the browser; no upload endpoint, user tracking, or analytics are implemented. Images are **not automatically saved**; use **Export PNG + JSON** immediately. Two downloads can require separate confirmation on iOS.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Serve source at localhost:5173 |
| `npm test` | Unit and deterministic regression tests |
| `npm run lint` | Syntax and banned-eval checks (basic, not ESLint) |
| `npm run build` | Copy standalone static site to `dist/` |
| `npm run check` | Lint, test, build |
| `SITE_ROOT=dist npm run dev` | Serve built static site |
| `npm run test:browser` | Optional Playwright tests **after installing @playwright/test** |

The optional `Browser smoke` GitHub Actions workflow installs a pinned Playwright version in the CI runner. These tests have not been run in the packaging container; they require registry access and browser installation. The core workflow does not need npm downloads.

## Project contents

```
index.html, styles.css   Browser interface and responsive styling
src/                     Camera definitions, state machines, capture, renderer, export
public/                  Offline shell, manifest, icons, original synthetic fixture
scripts/                 Node-only server, static build, syntax checks
tests/                   Unit invariants, seed regression, optional Playwright smoke
.github/workflows/       CI, weekly browser smoke, manual reviewed Pages deploy
docs/                    White paper, CI handbook, Phase-0 protocols, fidelity/rights
```

## Scientific scope and caveats

1. **Historical mechanics:** reference-supported design targets; simplified control ranges until every variant is verified.
2. **Apollo geometry:** 53 × 53 mm negative, 54 × 54 mm réseau plate, nominal 10 mm cross spacing, 1 mm arms and 0.02 mm width, doubled center. Marks are applied after optical processing (no modeled lens distortion yet) and before film stylization.
3. **Output model:** integer RGBA color mixing and independent pixel grain; deterministic in the specified reference path but **not** a physical film model or spatially correlated photographic grain.
4. **Capture:** prefers `ImageCapture.takePhoto()`, falls back to `grabFrame()`, then video canvas. Device-specific dimensions, support and color management must be measured on actual iPhones. Import may be higher-quality. DNG is **not** decoded by this starter.
5. **Image size:** final square output limited to 1600 px and input dimensions, regardless of hardware resolution; chosen to constrain mobile CPU cost pending characterization.
6. **Operational modes:** historical/assisted operation and evidence-led/creative rendering are independent controls, but historical viewing behavior is only partially represented; the evidence-led label **does not** imply a calibrated image.
7. **Scientific calibration:** not yet implemented. See [Phase 0](docs/phase-0-protocol.md) and [fidelity register](docs/fidelity-register.json).

## First issues to open

- P0: measure real-iPhone `takePhoto()` vs `grabFrame()` output, metadata and color response.
- P0: prespecified grayscale context test and slanted-edge effective SFR test.
- Implement optical response after source-resolution characterization, not before.
- Implement physically scaled, correlated grain and calibrated tone pipeline.
- Complete Apollo camera semantics and SX-70 exposure/development before stabilizing schema.
- Integrate rights-checked reference imagery and archival source tracing.
- Decide a maintainable TypeScript/Vite migration after validating the capture/render pipeline.
- Install and lock Playwright once the environment has registry access; run tests in real mobile Safari.

## Further reading

- [White paper v0.3](docs/whitepaper-v0.3.md)
- [CI & validation handbook v0.1](docs/ci-validation-handbook-v0.1.md)
- [Phase 0 measurement protocol](docs/phase-0-protocol.md)
- [Architecture](docs/architecture.md)
- [Privacy, rights & deployment](docs/privacy-rights.md)
- [Known limitations](docs/known-limitations.md)

## License

Original code and interface artwork in this starter: **MIT** (see `LICENSE`). Historical names and third-party trademarks remain those of their owners. The source links provided in documents are citations, **not** relicensed material. No historical manufacturer photographs or NASA image files are bundled.
