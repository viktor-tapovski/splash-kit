import { describe, it, expect, vi, beforeEach } from "vitest";
import { createOverlay, dismissOverlay } from "../src/overlay";

describe("createOverlay", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("appends overlay div to body", () => {
    createOverlay();
    expect(document.getElementById("splash-kit-overlay")).not.toBeNull();
  });

  it("overlay contains a canvas element", () => {
    const { canvas } = createOverlay();
    expect(canvas.tagName).toBe("CANVAS");
    expect(document.getElementById("splash-kit-overlay")?.contains(canvas)).toBe(true);
  });

  it("overlay has fixed position and max z-index", () => {
    const { overlay } = createOverlay();
    expect(overlay.style.position).toBe("fixed");
    expect(parseInt(overlay.style.zIndex)).toBeGreaterThan(9000);
  });
});

describe("dismissOverlay", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  it("sets opacity to 0 to trigger fade", () => {
    const { overlay } = createOverlay();
    dismissOverlay(overlay, 400);
    expect(overlay.style.opacity).toBe("0");
  });

  it("removes overlay from DOM after fade + buffer", () => {
    const { overlay } = createOverlay();
    dismissOverlay(overlay, 400);
    vi.advanceTimersByTime(500);
    expect(document.getElementById("splash-kit-overlay")).toBeNull();
  });

  it("calls onDismiss callback after removal", () => {
    const { overlay } = createOverlay();
    const onDismiss = vi.fn();
    dismissOverlay(overlay, 400, onDismiss);
    vi.advanceTimersByTime(500);
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
