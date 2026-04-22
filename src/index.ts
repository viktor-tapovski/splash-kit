import { detectDevice } from "./detector";
import { renderToCanvas } from "./renderer";
import { createOverlay, dismissOverlay } from "./overlay";
import { injectStartupImage } from "./link-injector";
import type { SplashKitOptions } from "./types";

export type { SplashKitOptions, ImageConfig, ImagePosition, DeviceInfo } from "./types";

export async function SplashKit(options: SplashKitOptions): Promise<void> {
  const { background, images = [], duration = 2000, fade = 400, force = false, onDismiss } = options;
  const safeDuration = Math.max(0, Number.isFinite(duration) ? duration : 2000);
  const safeFade = Math.max(0, Number.isFinite(fade) ? fade : 400);

  const device = detectDevice();

  // Desktop: skip unless forced
  if (!device.isMobile && !force) return;

  // Android: manifest.json handles splash — skip unless forced
  if (!device.isIOS && !force) return;

  // Non-PWA: skip unless forced
  if (!device.isPWA && !force) return;

  const { overlay, canvas } = createOverlay();

  await renderToCanvas(canvas, background, images, device);

  if (device.isIOS) {
    injectStartupImage(canvas, device, options);
  }

  setTimeout(() => {
    dismissOverlay(overlay, safeFade, onDismiss);
  }, safeDuration);
}
