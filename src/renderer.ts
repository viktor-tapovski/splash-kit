import type { DeviceInfo, ImageConfig } from "./types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`SplashKit: failed to load image "${src}"`));
    img.src = src;
  });
}

function computeDrawSize(
  naturalW: number,
  naturalH: number,
  size: number,
  device: DeviceInfo
): { w: number; h: number } {
  const shorterDim = Math.min(device.viewportW, device.viewportH);
  const logicalPx = shorterDim * Math.min(1, Math.max(0, size));
  const physicalPx = logicalPx * device.dpr;
  const aspect = naturalW / naturalH;
  return {
    w: physicalPx,
    h: physicalPx / aspect,
  };
}

function computeDrawY(
  position: ImageConfig["position"],
  drawH: number,
  canvasH: number,
  padding: number
): number {
  switch (position) {
    case "top":
      return padding;
    case "bottom":
      return canvasH - drawH - padding;
    default:
      return (canvasH - drawH) / 2;
  }
}

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  background: string,
  images: ImageConfig[],
  device: DeviceInfo
): Promise<void> {
  const canvasW = device.viewportW * device.dpr;
  const canvasH = device.viewportH * device.dpr;

  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("SplashKit: canvas 2d context unavailable");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvasW, canvasH);

  if (!images.length) return;

  const loaded = await Promise.all(images.map((img) => loadImage(img.src)));
  const padding = Math.min(canvasW, canvasH) * 0.1;

  images.forEach((config, i) => {
    const el = loaded[i];
    const { w, h } = computeDrawSize(el.naturalWidth, el.naturalHeight, config.size, device);
    const x = (canvasW - w) / 2;
    const y = computeDrawY(config.position, h, canvasH, padding);
    ctx.drawImage(el, x, y, w, h);
  });
}
