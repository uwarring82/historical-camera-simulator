# Film response in the studio

The studio starts from a developed sRGB photograph or video frame. Absolute scene radiance and the phone’s exposure, white balance, sharpening and noise reduction are unknown. The model supports relative comparisons within a scene.

## Exposure

For manual bodies the multiplier on decoded linear light is

```
(ISO / 100) × (time / (1/125 s)) × (5.6 / f-number)²
```

At fixed aperture, ISO 100 at 1/125 s and ISO 400 at 1/500 s produce the same nominal midtone. The density fluctuations and depth of field are computed separately. A smooth display shoulder compresses highlights above linear 0.70. Monochrome conversion uses linear sRGB luminance. The color matrices and shoulder are illustrative. Actual film characteristic curves, reciprocity failure, shot noise, motion integration and spectral sensitivities require independent measurements.

The folding SX-70 has automatic exposure. A central-weighted log mean of the image estimates an exposure for 18% gray, limited to ±4 stops. The model uses a nominal ASA 100 meter and a modern ASA 160 pack, so neutral compensation adds about 0.68 stop relative to that reference. Each simulated dial division applies half a stop. Polaroid documents the speed mismatch and recommends adjusting the wheel. Its precise response and shutter programme vary by camera. A print ejects independently of the next exposure. The simulator shows an immediate proof.

## Film profiles

| Profile | Speed used | Film gate, mm | Diffuse RMS × 1000 at 48 µm | Assumed correlation length, µm |
| --- | --- | --- | --- | --- |
| Kodak T-MAX 100 | ISO 100 | 36 × 24 or 56 × 56 | 8, published | 6 |
| Kodak T-MAX 400 | ISO 400 | 36 × 24 or 56 × 56 | 10, published | 9 |
| Kodak TRI-X 400 | ISO 400 | 36 × 24 or 56 × 56 | 17, published | 14 |
| Apollo Ektachrome MS SO-368 | ASA 64 | 53 × 53 | 12, estimate | 8 |
| Apollo Plus-X 3401 | EI 100 | 53 × 53 | 12, estimate | 9 |
| Modern Polaroid SX-70 Color | ASA 160 | 79 × 77 | 16, estimate | 15 |

NASA gives ASA 80–125 for 3401 in its Apollo 17 photographic index. EI 100 is the studio’s representative choice. The Polaroid profile uses an eight-sheet contemporary pack in the original folding body. The B&W comparison rolls use current data sheets and do not claim that these emulsions were available at the introduction of each camera.

## How grain is sampled

Kodak’s diffuse RMS numbers describe density fluctuations measured through a 48 µm aperture at net diffuse density 1.0. They constrain one point on a spatial noise curve. They do not determine particle size, a full noise spectrum or grain appearance at every density.

The model assigns a Gaussian correlation length l in film coordinates. A square output pixel has pitch p = 1000 × frame width in mm / output width in pixels, expressed in µm. Approximating the measuring disk and pixel by Gaussian apertures with matching second moments gives

```
σD(p) = σD(48 µm disc) × sqrt[(l² + 2 × 12²) / (l² + p²/6)]
```

A deterministic separable moving-average filter approximates the first horizontal and vertical correlation lags. A signed density perturbation changes print luminance multiplicatively. One field is shared by the color channels. The model omits dye-cloud color correlations and density-specific calibration. The grain-strength slider in Creative mode multiplies the modeled RMS. The seed and exposure-time settings travel with the exported frame metadata. Output is capped at 1600 pixels wide. Texture that would be visible in a high-resolution scan can average away in a small finder.

## Viewing and validation

For a common input, a rectilinear film gate spans a source width proportional to gate width divided by focal length. The equivalent horizontal angle is 2 atan(gate width / (2 focal length)). The same scale in both axes fits all four gates and the Leica’s wider viewing window inside the input. Camera selection changes the crop at a fixed viewpoint. The PNG metadata records the source rectangle. Phone lens coverage, in-camera corrections and geometric parallax are unmeasured.

| Body | Horizontal angle at infinity | Historical view and exposed frame |
| --- | --- | --- |
| Hasselblad, 53 mm gate / 60 mm Biogon | 47.7° | Chest-level aiming. Réseau marks register at the film plane. |
| Leica M1, 36 / 50 | 39.6° | Both 35 and 50 mm bright lines remain visible. The inner frame maps to the exposure. An 8% window margin is illustrative. The clear independent window supports scale focusing. |
| Rolleiflex 2.8F, 56 / 80 | 38.6° | Laterally reversed, wide-open viewing image. Tapping the screen raises the 2.5× loupe. The phone samples the central portion under magnification. The proof and export retain taking-lens framing and orientation. |
| Original SX-70, 79 / 116 | 37.6° | Plain reflex screen of the early folding model. The meter samples the taking gate. Last frame presents the image in an 88.47 × 107.52 mm integral-print mount. The PNG contains the exposed area. |

Zeiss published relative illuminance versus image height for the Biogon at f/5.6 and f/8. The renderer interpolates graph readings at 5 mm intervals. At 30 mm the curves give approximately 0.60 and 0.76 of central illumination, respectively. For smaller apertures the renderer retains the f/8 curve. Other lenses use ideal cos⁴ field-angle falloff. Actual pupil geometry, mechanical shading and phone lens corrections can change this response. The source is already a developed image.

The distant demo landscape supports an infinity depth assumption. Other images use a heuristic ground plane. Live finder resolution adapts to measured rendering time. The final exposure always uses the source crop, with a maximum width of 1600 pixels.

The unit tests check equal exposures, different granularity at equal speed, the measured-aperture reference, output sampling and seeded spatial statistics. A physical validation would require matched film exposures of uniform patches, common development conditions, scanner response measurements, and spectra of the resulting density fluctuations.

## Sources

- [NASA Apollo 17 photographic index, table 3](https://esrs.jsc.nasa.gov/SearchPhotos/Metadata/Apollo17.htm)
- [Polaroid SX-70 Color specifications](https://www.polaroid.com/en_us/products/color-sx70-instant-film) and [exposure compensation](https://support.polaroid.com/hc/en-us/articles/115012563968-Exposure-compensation-on-Polaroid-SX-70)
- [Kodak T-MAX 100, F-4016](https://www.kodakprofessional.com/sites/default/files/wysiwyg/pro/resources/f4016_TMax_100.pdf)
- [Kodak T-MAX 400, F-4043](https://kodakprofessional.com/sites/default/files/wysiwyg/pro/resources/f4043_TMax_400.pdf)
- [Kodak TRI-X, F-4017](https://business.kodakmoments.com/sites/default/files/files/resources/triXf4017.pdf)
- [Zeiss Biogon 5.6/60 data sheet, p. 2](https://apollojournals.org/alsj/Biogon5.6_60mm_ZEISS.pdf)
- [Leica Historica M1 specifications](https://leicahistorica.com/M1.html)
- [Rollei catalogue, 1961–62, Rolleiflex 2.8F focusing hood](https://www.cameramanuals.org/rolleiflex/rollei_camera_acc_1961-62.pdf)
- [Polaroid integral-film dimensions](https://support.polaroid.com/hc/en-us/articles/115012363647-What-are-Polaroid-photo-dimensions) and [early SX-70 focusing screens](https://www.polaroidmemories.nl/split-circle/)
