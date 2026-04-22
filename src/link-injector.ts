import type { DeviceInfo, SplashKitOptions } from "./types";

const STORAGE_PREFIX = "splashkit:";

function buildCacheKey(device: DeviceInfo, options: SplashKitOptions): string {
  const configHash = btoa(
    encodeURIComponent(JSON.stringify({ bg: options.background, imgs: options.images }))
  );
  return `${STORAGE_PREFIX}${device.screenW}x${device.screenH}x${device.dpr}:${configHash}`;
}

function buildMediaQuery(device: DeviceInfo): string {
  return [
    `(device-width: ${device.screenW}px)`,
    `(device-height: ${device.screenH}px)`,
    `(-webkit-device-pixel-ratio: ${device.dpr})`,
  ].join(" and ");
}

function injectLinkTag(dataUrl: string, mediaQuery: string): void {
  const existing = document.querySelector('link[rel="apple-touch-startup-image"][data-splash-kit]');
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.rel = "apple-touch-startup-image";
  link.setAttribute("data-splash-kit", "true");
  link.media = mediaQuery;
  link.href = dataUrl;
  document.head.appendChild(link);
}

export function injectStartupImage(
  canvas: HTMLCanvasElement,
  device: DeviceInfo,
  options: SplashKitOptions
): void {
  const cacheKey = buildCacheKey(device, options);
  const mediaQuery = buildMediaQuery(device);

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      injectLinkTag(cached, mediaQuery);
      return;
    }
  } catch {
    // localStorage unavailable — continue to generate
  }

  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL("image/png");
  } catch {
    // Canvas tainted by cross-origin image — skip persistent link tag
    return;
  }

  const MAX_CACHE_BYTES = 4 * 1024 * 1024;
  try {
    // Clear stale entries for this device before storing new one
    const devicePrefix = `${STORAGE_PREFIX}${device.screenW}x${device.screenH}x${device.dpr}:`;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(devicePrefix)) localStorage.removeItem(key);
    }
    if (dataUrl.length < MAX_CACHE_BYTES) {
      localStorage.setItem(cacheKey, dataUrl);
    }
  } catch {
    // Storage quota exceeded — inject without caching
  }

  injectLinkTag(dataUrl, mediaQuery);
}
