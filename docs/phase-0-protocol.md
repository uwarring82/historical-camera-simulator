# Phase 0 — iPhone capture characterization protocol

**Status: prespecified draft; no empirical results. Do not adjust thresholds after viewing data.**

## Equipment and logging

- Record iPhone model, iOS/Safari version, physical camera route, selected capture API, resolution, metadata, output color profile and date.
- Use a documented neutral step wedge, color target and slanted-edge target under stable lighting.
- Measure luminance where possible, or clearly mark calibrated versus relative measurements.
- Document exposure lock availability and state. Use repeated scenes and record all exclusions.

## P0.1 / P0.2 — Global transfer assumption

For each grayscale patch and scene context, obtain at least **20** repeated captures. Contexts: neutral, dark surround, bright surround, high-contrast surround. Inferred EV requires an independently defined transfer mapping; where not identifiable, mark the result inconclusive and do not claim calibrated output.

Set `R95` to the 95th percentile of absolute single-frame deviations relative to that patch's within-context median in log2 exposure-equivalent units. Set `ΔS` to the context median shift versus the neutral baseline, after any declared global exposure adjustment. Reject the single scene-invariant transfer model in a **predeclared critical patch range** if *both* `|ΔS| > R95` and `|ΔS| > 1/3 EV` for any such patch. Record full results, not only pass/fail. The one-third EV is a project significance threshold, not a universal camera control step.

Predeclare critical patches before capture (suggestion: midtone patch group, plus separately evaluated shadows/highlights). Report sample sizes and any response clipping.

## P0.3 — Capture API and output resolution

Compare `ImageCapture.takePhoto()`, `grabFrame()`, canvas video capture and native photo import. Test DNG import as an acquisition alternative, but note the starter does **not** implement DNG decoding. Log image dimensions, bytes, color profile, capture time, error cases, and camera identity.

## P0.4 — Repeatability

Repeat images for each capture configuration and measure temporal intensity instability and noise. Ensure automated exposure shifts are not confused with spatial local tone mapping.

## P0.5 — Spatial frequency response

Use slanted-edge chart and ISO 12233 methodology. Measure relevant field positions, illumination levels and capture routes. Record image sharpening/overshoot. Do not equate effective SFR to pure optical MTF without a suitable system model.

## Output gate

Produce `phase0-results.json`, source file hashes, capture examples with provenance, analysis scripts, plots and a signed decision about whether live browser capture can support any quantitative tone or MTF claim. If not, maintain C output classification and assess linear/DNG acquisition.
