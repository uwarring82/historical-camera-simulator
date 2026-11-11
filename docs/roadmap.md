# Work plan and gates

| Gate | Goal | Acceptance requirement | Current status |
| --- | --- | --- | --- |
| P0 | Characterize iPhone | Capture methods, resolution, tone-context test and slanted-edge SFR documented | Not started |
| P1 | Core skeleton | Four registry definitions, mechanical tests, deterministic reference transform, build/CI | **Partly implemented** |
| P2 | Apollo end-to-end | Correct control model, film-plane marks and nominal Biogon optical data fit | Partial, no MTF fit |
| P3 | SX-70 end-to-end | Full exposure/ejection/development differences | Partial, no exposure/chemistry model |
| Architecture | Freeze schemas | Both Apollo and SX-70 complete, independent review | Not started |
| P4 | Leica/Rolleiflex | Accurate viewfinder and parallax, full mechanics | Skeleton only |
| P5 | Calibrate | Quantitative measurement and uncertainty | Not started |

**First priority:** Perform P0 on an actual iPhone, recording image dimensions, output fidelity, processing latency and capture API behavior. Keep the calibration claim separate from the software mechanism tests.
