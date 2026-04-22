import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { detectDevice } from "../src/detector";

describe("detectDevice", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { value: 390, writable: true, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 844, writable: true, configurable: true });
    Object.defineProperty(window, "devicePixelRatio", { value: 3, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns correct viewport and screen dimensions", () => {
    const device = detectDevice();
    expect(device.viewportW).toBe(390);
    expect(device.viewportH).toBe(844);
    expect(device.dpr).toBe(3);
  });

  it("detects iOS via userAgent", () => {
    vi.stubGlobal("navigator", { ...navigator, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)" });
    expect(detectDevice().isIOS).toBe(true);
  });

  it("returns isIOS false for Android userAgent", () => {
    vi.stubGlobal("navigator", { ...navigator, userAgent: "Mozilla/5.0 (Linux; Android 12)" });
    expect(detectDevice().isIOS).toBe(false);
  });

  it("detects PWA via display-mode standalone", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("standalone") }));
    expect(detectDevice().isPWA).toBe(true);
  });

  it("defaults dpr to 1 when devicePixelRatio is 0", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 0, writable: true, configurable: true });
    expect(detectDevice().dpr).toBe(1);
  });
});
