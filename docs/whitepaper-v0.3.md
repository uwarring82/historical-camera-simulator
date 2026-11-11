# Historical Camera Simulator — White Paper v0.3

**11 November 2026 · Scientific design for pre-prototype development**

## Abstract

The proposed iPhone-compatible web application is an interactive museum of four historical instruments. Its principal contribution is *historical operation* of photographic cameras, accompanied by explicitly classified approximations of their optical and photochemical rendering. Operation and image quality are independent subsystems. The project must not conflate an accurate lens model with accurately reproduced output from an already processed smartphone photograph.

## Initial collection

| Camera | Historical defining interaction | Imaging baseline | Initial priority |
| --- | --- | --- | --- |
| Leica M1 (1959) | Manual advance; 35/50 mm bright-line frames with automatic parallax shift; distance-scale focus, no coupled rangefinder | 24 × 36 mm; period 50 mm lens variant to be selected; negative film Level C | Phase 4 |
| Apollo 17 Hasselblad 500 EL HDC (1972) | Chest-mounted approximate aiming with reflex system removed; electric advance; aperture, shutter and distance | 53 × 53 mm negative; 54 × 54 mm réseau plate; nominal 60 mm Zeiss Biogon | Phase 2 |
| Rolleiflex 2.8F (1960) | Waist-level mirrored view; twin optical axes, focus-linked parallax compensation; crank | 120 film, nominal 6 × 6 cm; 80 mm f/2.8 | Phase 4 |
| Polaroid SX-70 (1972) | Folding original body; focus; automatic exposure; film ejection and development | Integral film; 116 mm lens, f/8 maximum; 10-frame historical packs | Phase 3 |

These four are in scope, but the first full end-to-end implementations are Apollo and SX-70, which exercise contrasting hardware workflows. Stabilize the common camera schema only after both are working.

## Three separate fidelity questions

1. **Historical correctness:** Is behavior supported by manuals and contemporary sources?
2. **Model fidelity:** Is the implemented physical/mathematical model validated quantitatively against independent measurements?
3. **Output fidelity:** Can the smartphone source and renderer faithfully express those model properties at their available spatial, tonal and color bandwidth?

Evidence labels are assigned **per property**, not per camera: **A** = directly documented; **B** = measured and calibrated within an explicit domain; **C** = phenomenological. Software implementation status is separate again.

### Launch fidelity budget

| Property | Leica | Apollo | Rolleiflex | SX-70 |
| --- | --- | --- | --- | --- |
| Camera controls and format | A target | A target | A target | A target |
| Camera-specific viewing | A target | A target | A target | A target |
| Nominal lens optical response | C | B candidate | C | C |
| Réseau geometry | — | A target | — | — |
| Film color/tone/grain | C | C | C | C |
| SX-70 exact exposure programme | — | — | — | C |
| Development response | C | C | C | C |

'A target' means documentation can ground implementation; it does not certify the starter's simplified controls. 'B candidate' identifies the prospective Biogon model, **not** the photo output.

## Image-formation model

An idealized historical imaging chain is `Ihistorical = P(F(O(Lscene)))`, with scene radiance `Lscene`, optics `O`, recording medium `F` and development/presentation `P`. Smartphone imagery is `Iphone = Tphone(Lscene)`, where `Tphone` may include nonlinear local tone mapping and computational photography. The application actually implements `Isim = Rθ(Iphone)`.

A historical film characteristic `D = f(log10 H)` cannot be applied directly to a display-referred RGB value as though that pixel were optical exposure `H`. Whether a useful exposure-related representation can be recovered is a **measurement question**, not an assumption.

### P0 acceptance criterion (commit before collection)

For an identical grayscale patch with changed surroundings, measure the inferred exposure-equivalent shift `ΔS` (in EV), and the preregistered 95th-percentile absolute repeatability bound `R95` from ≥20 repeat frames. Reject the global, scene-invariant transfer model in a predeclared critical luminance range if both `|ΔS| > R95` **and** `|ΔS| > 1/3 EV`. Record whether autoexposure has been locked and separately test any residual local tone mapping. If a defensible inference is not available, classify live capture as phenomenological and evaluate DNG import.

## Spatial-frequency / crop budget

A historical focal length typically demands a crop relative to a smartphone's main wide camera. On an illustrative 12 MP frame, a square image around 2400 px wide is plausible but must be measured. For the Apollo 53 mm frame, `fNyquist = 2400/(2×53) = 22.6 lp/mm`, so its nominal 40 lp/mm lens data cannot be represented directly. 20 lp/mm is close to Nyquist. Measure effective phone spatial frequency response using a slanted-edge target, accounting for computational sharpening and nonlinear processing. The product of MTF curves is only a linear shift-invariant approximation.

## Apollo calibration anchor

The Zeiss Biogon manufacturer datasheet provides sagittal/tangential MTF at 10, 20 and 40 lp/mm, illumination and distortion curves at the specified apertures. These are evidence for a **nominal lens model**, not the particular flight lens.

The 5×5 réseau cross centers are separated by nominal 10 mm on a 54 × 54 mm glass plate positioned close to the 53 × 53 mm film image. Each ordinary cross has approximately 1 mm-long arms and 0.02 mm width; the center cross is double-sized. Zeiss quotes 0.005 mm spacing tolerance and ALSJ quotes 0.002 mm; preserve the source context. Cross shadows are created **after** lens distortion, **before** the emulsion response. Their film-frame coordinates must not shift with lens-distortion changes.

## Grain and reproducibility

Film grain is a density-dependent, spatially correlated process expressed relative to physical film and output enlargement scales. A future phenomenological model might use `D'(x,y) = D(x,y) + σ(D)ηℓ(x,y)` where `ηℓ` is a correlated random field. The initial starter **does not implement this correlated model**: it has independent pixel noise, explicitly marked as provisional.

Byte-for-byte reproducibility must not depend on cross-engine agreement of implementation-approximated transcendental JS functions. A constrained integer, lookup-table, or controlled WASM reference kernel should be compared to a faster interactive backend under specified tolerances.

## Two independent user modes

- **Operation:** Historical (mechanical constraints) / Assisted (modern aiming and guidance).
- **Rendering:** Evidence-led (documented and identified model components, which may still be Level C) / Creative (artistic extra adjustments).

Do not present evidence-led as universally calibrated. Users may select any combination of the two independent axes.

## Privacy and legal constraints

Local processing by default; no camera-image upload or location collection without explicit permission. Offer immediate export, especially in Safari tabs; Home Screen installed apps have special storage-policy treatment but not guaranteed permanent archival storage. Public publication requires a rights register for images, manufacturer marks, historical manuals and third-party material. NASA imagery has special media-use rules and does not license all included elements or endorsements.

## Roadmap

**P0:** Capture API, photometric transfer, slanted-edge SFR, resolution and export measurements on actual iPhones.

**P1:** Deterministic processing, state machines, camera registry, tests and CI.

**P2:** Apollo HDC end-to-end with correct réseau ordering and nominal optical reference data.

**P3:** SX-70 end-to-end including genuine state differences; only then stabilize schemas.

**P4:** Leica M1 and Rolleiflex 2.8F operation and optics.

**P5:** Resource-backed historical calibration and uncertainty assessment; evidence-based promotion of individual properties to Level B.

## Open questions

How identifiable are original exposures from smartphone imagery? Which optical frequencies survive cropping? Can relevant historical film sensitometry be obtained? How should near-blind Apollo aiming be represented without frustrating users? Should the project publish optical calibration datasets independently?

## References

- [Leica Historica — M1](https://leicahistorica.com/M1.html)
- [Zeiss Biogon 5.6/60 datasheet — NASA-hosted](https://www.nasa.gov/wp-content/uploads/static/history/alsj/Biogon5.6_60mm_ZEISS.pdf)
- [Zeiss Biogon 5.6/60 — zeiss.it copy](https://www.zeiss.it/content/dam/consumer-products/downloads/historical-products/photography/hasselblad-c/en/datasheet-zeiss-biogon-5660-en.pdf)
- [Apollo Lunar Surface Journal — réseau plate](https://www.apollojournals.org/alsj/alsj-reseau.html)
- [NASA Apollo 17 photo index](https://eol.jsc.nasa.gov/searchphotos/Metadata/Apollo17.htm)
- [Polaroid SX-70 support](https://support.polaroid.com/hc/en-us/articles/115012463268-Polaroid-SX-70-series-cameras)
- [ISO 12233 (SFR measurement)](https://www.iso.org/standard/71696.html)
- [WebKit Safari 18.4 features](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/)
- [WebKit Safari 26 features](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)
- [WebKit tracking prevention](https://webkit.org/tracking-prevention/)
- [NASA media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
