# ADR 0001 — Dependency-free ES-module bootstrap

**Status: accepted for starter, revisit after Phase 0.**

## Context

The white paper proposes TypeScript and modern tooling. The local packaging environment cannot access the npm registry, making full dependency installation and verification impossible.

## Decision

Deliver a functional native ES-module application and use Node 22 built-in tests and scripts. No npm dependencies are needed for the core project. Keep the architecture modular to permit a later TypeScript and Vite migration.

## Consequences

The runnable starter and core CI can be tested offline. Missing static types and modern bundling are acknowledged technical debt, not disguised as completed features. Browser smoke tests remain optional until installed and locked in a connected environment.
