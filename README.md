# Camera Archive

[Open the studio](https://uwarring82.github.io/historical-camera-simulator/studio.html) · [Explore the collection](https://uwarring82.github.io/historical-camera-simulator/) · [Film model and evidence](docs/film-model.md)

Camera Archive is a browser-based photography studio with four instruments. Each has its own film gate, finder, exposure controls and transport. The studio fits its controls and live finder on one screen. Use the demonstration photograph, import an image or select **Camera** for a live device feed. Captures stay on your device.

On an iPhone 17 Pro, swipe across a dial to adjust it. Rotate to landscape for a side-by-side finder and control panel. For an edge-to-edge session, open the studio in Safari, choose **Share → Add to Home Screen**, enable **Open as Web App**, and launch **Camera Studio**.

Choose **Historical** for the instrument’s optical view or **Film preview** for a digital exposure proof. Select a film to load a fresh roll or magazine. **Last frame** opens a full-size proof with 100% inspection and metadata. **Export** saves the last exposure. Releasing the shutter again replaces the last proof.

| Instrument | Film gate | Controls and loading |
| --- | --- | --- |
| Apollo 17 Hasselblad | 53 × 53 mm | Aperture, timed shutter, distance scale, removable magazine and electric advance |
| Polaroid SX-70 | 79 × 77 mm | Fold, insert a modern eight-exposure pack, focus, lighten/darken and eject |
| Leica M1 | 36 × 24 mm | Aperture, shutter, scale focus and 36-frame manual advance |
| Rolleiflex 2.8F | 56 × 56 mm | Aperture, shutter, focus, reversed waist-level finder and 12-frame manual advance |

## Run locally

Use Node.js 22 or newer. The core application has no npm dependencies.

```sh
git clone https://github.com/uwarring82/historical-camera-simulator.git
cd historical-camera-simulator
npm run check
npm run dev
```

Open http://localhost:5173 on the same computer. Use the HTTPS studio for a phone camera. **Full screen** uses the browser’s fullscreen API where available and a compact layout elsewhere.

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

## Scientific scope

Sensitivity acts on relative linear-light exposure. Stock-specific RMS density variation, the assumed correlation scale, frame width and pixel sampling determine visible grain. Kodak’s B&W granularity values anchor the model at a 48 µm measuring aperture. Historical color, instant-film texture and the spatial correlation lengths are estimates. Camera state, film profile and seed are recorded at exposure time. See the [model, assumptions and numerical tests](docs/film-model.md).

## Further reading

- [White paper v0.3](docs/whitepaper-v0.3.md)
- [CI & validation handbook v0.1](docs/ci-validation-handbook-v0.1.md)
- [Phase 0 measurement protocol](docs/phase-0-protocol.md)
- [Architecture](docs/architecture.md)
- [Privacy, rights & deployment](docs/privacy-rights.md)
- [Known limitations](docs/known-limitations.md)

## License

Original code and interface artwork use the **MIT** license. The bundled Fronalpstock photograph by Hannes Röst and its derivatives use **CC BY-SA 3.0**. See the [asset register](docs/asset-register.md). Historical names and third-party trademarks remain those of their owners. The source links provided in documents are citations, **not** relicensed material. No historical manufacturer photographs or NASA image files are bundled.

## The entrance, field guide, and studio

The refreshed interface keeps the core app buildless and dependency-free:

- `index.html` is the entrance: a camera showcase, an image-making timeline, an interactive aperture illustration, and the four-instrument collection.
- `learn.html?chapter=history` opens the field guide. Chapters cover `light`, `exposure`, `seeing`, and `about`, plus `apollo`, `sx70`, `leica`, and `rolleiflex`. Historical chapters include external source links; camera chapters distinguish original specifications from prototype configuration.
- `studio.html` opens the simulator. `?camera=sx70` (or another camera ID) selects an instrument directly. The hardware-inspired dials work with sliders, arrow keys, and step buttons; mechanical preparation still follows the existing state machines.

The illustrations are original schematic SVG artwork. See the [bundled asset register](docs/asset-register.md) for origins and rights. No third-party product photos, fonts, or scripts are fetched by the interface. The service worker caches the entrance, studio, guide, and their modules, including offline navigation to query-selected chapters. User images are never added to that cache.

The optional browser suite covers entrance-to-studio navigation, keyboard aperture controls, camera preparation, image capture, all guide chapters, and desktop/mobile overflow. Run it with `npm run test:browser` after installing `@playwright/test` and its Chromium and WebKit browsers in your development environment.
