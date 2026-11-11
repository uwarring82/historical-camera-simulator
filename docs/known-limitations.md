# Known limitations — v0.1.0

- Not calibrated photographic emulation. Film tone/color and pixel noise are approximations.
- No lens MTF, measured vignetting, distortion simulation or correlated/physically scaled grain yet.
- No calibrated phone response, slanted-edge SFR measurements, DNG decode, or film-sensitometric reference data.
- Output is cropped to square and limited to 1600 px width/height or less; not guaranteed full iPhone still resolution.
- Apollo historical mode approximates near-blind aiming with an overlay; it does not reproduce detailed chest-mounted ergonomics.
- SX-70 exposure programme and chemical development are not modeled; development completes on a manual UI action.
- The film state of Apollo magazines and the physical controls of all four cameras are schematic; exact settings require archival verification.
- Rolleiflex mirrored preview is illustrative; geometric parallax correction has not yet been implemented.
- Leica's 35/50 framing and parallax are described but not yet rendered as physical optical finder geometry.
- PNG+JSON export uses two browser downloads and is not guaranteed to save silently on iOS.
- `ImageCapture` support and behavior require actual Safari/iPhone experiments.
- No actual browser smoke result in this ZIP: automated localhost navigation was blocked in the packaging environment.
- Core CI performs syntax, unit and build checks; it does not yet typecheck, run browser tests on every PR, or meet full calibration-based Level B release gates.
- CDN-free / no dependencies, but further static asset hardening and third-party security audit are planned.
