# ADR 0002 — Integer reference image transformation

**Status: historical decision for v0.1.** The [v0.3 film-density renderer](../film-model.md) supersedes the integer-only path.

## Decision

Use explicitly bounded 8-bit integer RGBA transforms and a seeded xorshift32 generator for the versioned reference path. Avoid `Math.exp` and `Math.pow`. Film effects remain Level C phenomenological approximations. Do not interpret the transform as physical optical exposure.

## Consequences

Byte-for-byte comparison is possible for the current reference renderer. Quantitative film curves, correlated grain and a fast GPU path will require new model versions and separately declared cross-platform numerical tolerances. The final camera image depends on the browser's noncanonical pixel decoder and color pipeline, which this seed alone cannot standardize.
