# splash-kit

A lightweight, zero-dependency library for dynamically generating PWA splash screens on iOS. Renders a canvas overlay at runtime, matched to the exact device viewport and pixel density, and injects an `apple-touch-startup-image` link tag for native iOS splash behavior on subsequent visits.

Android PWA splash screens are handled by `manifest.json` — splash-kit is a no-op on Android by default.

---

## Installation

```bash
npm install splash-kit
```

---

## Quick start

Call `SplashKit` once at application bootstrap, before mounting your framework.

```ts
import { SplashKit } from "splash-kit";

SplashKit({
  background: "#0f0f1a",
  images: [
    { src: "/logo.svg", position: "center", size: 0.35 },
    { src: "/wordmark.svg", position: "bottom", size: 0.5 },
  ],
  duration: 2500,
  fade: 500,
});
```

---

## Framework integration

### Vanilla JS

```ts
import { SplashKit } from "splash-kit";

SplashKit({ background: "#0f0f1a" });
```

### React

Call before `ReactDOM.createRoot` so the splash appears before any React rendering.

```ts
// index.tsx
import { SplashKit } from "splash-kit";
import { createRoot } from "react-dom/client";
import App from "./App";

SplashKit({
  background: "#0f0f1a",
  images: [{ src: "/logo.svg", position: "center", size: 0.35 }],
  duration: 2000,
  onDismiss: () => {
    createRoot(document.getElementById("root")!).render(<App />);
  },
});
```

### Vue

```ts
// main.ts
import { SplashKit } from "splash-kit";
import { createApp } from "vue";
import App from "./App.vue";

SplashKit({
  background: "#0f0f1a",
  images: [{ src: "/logo.svg", position: "center", size: 0.35 }],
  duration: 2000,
  onDismiss: () => createApp(App).mount("#app"),
});
```

### Angular

```ts
// main.ts
import { SplashKit } from "splash-kit";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

SplashKit({
  background: "#0f0f1a",
  images: [{ src: "/logo.svg", position: "center", size: 0.35 }],
  duration: 2000,
  onDismiss: () => bootstrapApplication(AppComponent),
});
```

---

## API

### `SplashKit(options): Promise<void>`

| Option       | Type            | Default | Description                                                     |
| ------------ | --------------- | ------- | --------------------------------------------------------------- |
| `background` | `string`        | —       | **Required.** CSS color value for the canvas background         |
| `images`     | `ImageConfig[]` | `[]`    | Images to draw on the splash canvas                             |
| `duration`   | `number`        | `2000`  | Milliseconds before the overlay begins to fade out              |
| `fade`       | `number`        | `400`   | Fade-out animation duration in milliseconds                     |
| `force`      | `boolean`       | `false` | Show the splash outside of PWA context (useful for development) |
| `onDismiss`  | `() => void`    | —       | Callback fired after the overlay is fully removed from the DOM  |

### `ImageConfig`

| Property   | Type                            | Description                                                                                 |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------- |
| `src`      | `string`                        | Image URL. Must be CORS-accessible if hosted on a different origin                          |
| `position` | `"top" \| "center" \| "bottom"` | Vertical placement on the canvas                                                            |
| `size`     | `number`                        | Fraction of the viewport's shorter dimension (0–1). Aspect ratio is preserved automatically |

#### `size` examples

| Value | Result on a 390×844 viewport |
| ----- | ---------------------------- |
| `0.2` | 78 logical px wide           |
| `0.4` | 156 logical px wide          |
| `0.6` | 234 logical px wide          |

Physical draw size is computed as `size × min(viewportW, viewportH) × devicePixelRatio`. You never need to account for pixel density manually.

---

## iOS PWA splash screen

iOS requires an `apple-touch-startup-image` link tag in `<head>` with a media query matching the exact device. splash-kit handles this automatically when running as an installed PWA on iOS:

1. Renders the splash to a canvas
2. Converts it to a PNG data URL
3. Injects a `<link rel="apple-touch-startup-image">` with the correct media query
4. Caches the result in `localStorage` — subsequent loads skip canvas generation

The cache key is derived from the device dimensions, pixel density, and a hash of your config options. Changing any option automatically invalidates the cache.

To manually trigger the iOS link injection during development, pass `force: true`.

### Required HTML meta tags

Add these to your `<head>` for full iOS PWA splash support:

```html
<meta name="mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta name="apple-mobile-web-app-title" content="Your App Name" />
<link rel="manifest" href="/manifest.webmanifest" />
```

---

## Image guidelines

- **Format:** SVG recommended — scales cleanly at any DPR. PNG and JPEG work too.
- **CORS:** Images must be same-origin or served with `Access-Control-Allow-Origin: *`. canvas `toDataURL()` will throw on tainted canvases.
- **Multiple images:** Rendered in array order (first = bottom z-layer). Use position and size to compose a logo + wordmark layout.

```ts
// logo centered, wordmark pinned to bottom
images: [
  { src: "/logo.svg", position: "center", size: 0.35 },
  { src: "/wordmark.svg", position: "bottom", size: 0.55 },
];
```

---

## Platform behavior

| Context                              | Behavior                                                |
| ------------------------------------ | ------------------------------------------------------- |
| iOS PWA (`display-mode: standalone`) | Canvas overlay + `apple-touch-startup-image` injected   |
| iOS browser                          | Skipped (not a PWA). Use `force: true` to override      |
| Android PWA                          | Skipped — Android generates splash from `manifest.json` |
| Desktop browser                      | Skipped. Use `force: true` to override                  |

---

## Development

```bash
# Start interactive demo
npm run demo

# Run tests
npm test

# Build library
npm run build

# Test coverage
npm run coverage
```

The demo (`demo/`) runs with `force: true` so the splash fires in a regular browser tab without needing to install the PWA.

---

## Browser support

Requires Canvas 2D API and `localStorage` — available in all modern browsers and all iOS versions that support PWA (`ios >= 11.3`).
