# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build       # Build library (ESM, CJS, UMD) via Vite
npm test            # Run test suite once
npm run test:watch  # Run tests in watch mode
npm run coverage    # Run tests with v8 coverage report
npm run demo        # Start demo dev server and open in browser
```

To run a single test file: `npx vitest run tests/renderer.test.ts`

## Architecture

splash-kit is a zero-dependency TypeScript library that generates iOS PWA splash screens at runtime by drawing to a canvas and injecting an `apple-touch-startup-image` link tag.

**Pipeline** (orchestrated in `src/index.ts`):
1. `detector.ts` — Checks iOS user agent, PWA standalone mode, viewport dimensions, and DPR
2. `renderer.ts` — Draws background + images onto a canvas at physical resolution (logical × DPR), returning a PNG data URL
3. `overlay.ts` — Mounts the canvas as a fixed full-screen overlay with fade-out animation
4. `link-injector.ts` — Caches the PNG in localStorage keyed by a config+device hash, then injects `<link rel="apple-touch-startup-image">` for native iOS persistence

**Key behaviors:**
- Rendering is skipped on non-iOS or non-PWA unless `force: true` is passed
- Image sizing is a fraction of the viewport's shorter dimension (0–1), aspect ratio preserved automatically
- localStorage cache invalidates when config or device dimensions change (hash-based key)
- Build outputs: `dist/splash-kit.js` (ESM), `dist/splash-kit.cjs` (CJS), plus type declarations

**Test environment:** happy-dom (configured in `vite.config.ts`). Tests mock canvas, localStorage, and image loading.
