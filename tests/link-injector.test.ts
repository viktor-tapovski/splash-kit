import { describe, it, expect, beforeEach } from "vitest";
import { injectStartupImage } from "../src/link-injector";
import type { DeviceInfo, SplashKitOptions } from "../src/types";

const device: DeviceInfo = {
  viewportW: 390,
  viewportH: 844,
  screenW: 390,
  screenH: 844,
  dpr: 3,
  isIOS: true,
  isPWA: true,
};

const options: SplashKitOptions = {
  background: "#1a1a2e",
  images: [],
};

function makeCanvas(dataUrl = "data:image/png;base64,abc"): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.toDataURL = () => dataUrl;
  return canvas;
}

describe("injectStartupImage", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    localStorage.clear();
  });

  it("injects apple-touch-startup-image link tag", () => {
    injectStartupImage(makeCanvas(), device, options);
    const link = document.querySelector('link[rel="apple-touch-startup-image"]');
    expect(link).not.toBeNull();
  });

  it("link href matches canvas dataUrl", () => {
    injectStartupImage(makeCanvas("data:image/png;base64,xyz"), device, options);
    const link = document.querySelector('link[rel="apple-touch-startup-image"]') as HTMLLinkElement;
    expect(link.href).toContain("data:image/png");
  });

  it("link media query contains device dimensions", () => {
    injectStartupImage(makeCanvas(), device, options);
    const link = document.querySelector('link[rel="apple-touch-startup-image"]') as HTMLLinkElement;
    expect(link.media).toContain("390px");
    expect(link.media).toContain("844px");
    expect(link.media).toContain("3");
  });

  it("caches dataUrl in localStorage", () => {
    injectStartupImage(makeCanvas("data:image/png;base64,cached"), device, options);
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("splashkit:"));
    expect(keys.length).toBe(1);
  });

  it("uses cached dataUrl on second call without regenerating", () => {
    const canvas1 = makeCanvas("data:image/png;base64,first");
    injectStartupImage(canvas1, device, options);

    document.head.innerHTML = "";
    const canvas2 = makeCanvas("data:image/png;base64,second");
    injectStartupImage(canvas2, device, options);

    const link = document.querySelector('link[rel="apple-touch-startup-image"]') as HTMLLinkElement;
    expect(link.href).toContain("first");
  });

  it("replaces existing splash-kit link tag on reinject", () => {
    injectStartupImage(makeCanvas(), device, options);
    injectStartupImage(makeCanvas(), device, options);
    const links = document.querySelectorAll('link[rel="apple-touch-startup-image"][data-splash-kit]');
    expect(links.length).toBe(1);
  });
});
