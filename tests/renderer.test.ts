import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToCanvas } from "../src/renderer";
import type { DeviceInfo } from "../src/types";

const device: DeviceInfo = {
  viewportW: 390,
  viewportH: 844,
  screenW: 390,
  screenH: 844,
  dpr: 3,
  isIOS: true,
  isPWA: true,
};

function makeMockCanvas() {
  const calls: { method: string; args: unknown[] }[] = [];
  const ctx = {
    fillStyle: "",
    fillRect: vi.fn((...args) => calls.push({ method: "fillRect", args })),
    drawImage: vi.fn((...args) => calls.push({ method: "drawImage", args })),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
    toDataURL: vi.fn(() => "data:image/png;base64,abc"),
  } as unknown as HTMLCanvasElement;
  return { canvas, ctx, calls };
}

describe("renderToCanvas", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Image",
      class {
        crossOrigin = "";
        naturalWidth = 200;
        naturalHeight = 100;
        set src(_: string) {
          this.onload?.();
        }
        onload?: () => void;
        onerror?: () => void;
      }
    );
  });

  it("sets canvas physical dimensions = viewport * dpr", async () => {
    const { canvas } = makeMockCanvas();
    await renderToCanvas(canvas, "#fff", [], device);
    expect(canvas.width).toBe(390 * 3);
    expect(canvas.height).toBe(844 * 3);
  });

  it("fills background before drawing images", async () => {
    const { canvas, ctx } = makeMockCanvas();
    await renderToCanvas(canvas, "#ff0000", [], device);
    expect(ctx.fillStyle).toBe("#ff0000");
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 390 * 3, 844 * 3);
  });

  it("draws image centered horizontally", async () => {
    const { canvas, ctx } = makeMockCanvas();
    await renderToCanvas(canvas, "#000", [{ src: "/logo.png", position: "center", size: 0.4 }], device);
    expect(ctx.drawImage).toHaveBeenCalledOnce();
    const [, x] = (ctx.drawImage as ReturnType<typeof vi.fn>).mock.calls[0];
    const canvasW = 390 * 3;
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(canvasW / 2);
  });

  it("draws bottom image near bottom of canvas", async () => {
    const { canvas, ctx } = makeMockCanvas();
    await renderToCanvas(canvas, "#000", [{ src: "/logo.png", position: "bottom", size: 0.2 }], device);
    const [, , y] = (ctx.drawImage as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(y).toBeGreaterThan(844 * 3 * 0.5);
  });

  it("draws top image near top of canvas", async () => {
    const { canvas, ctx } = makeMockCanvas();
    await renderToCanvas(canvas, "#000", [{ src: "/logo.png", position: "top", size: 0.2 }], device);
    const [, , y] = (ctx.drawImage as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(y).toBeLessThan(844 * 3 * 0.5);
  });

  it("preserves aspect ratio (2:1 image → drawW = 2 * drawH)", async () => {
    const { canvas, ctx } = makeMockCanvas();
    await renderToCanvas(canvas, "#000", [{ src: "/logo.png", position: "center", size: 0.4 }], device);
    const args = (ctx.drawImage as ReturnType<typeof vi.fn>).mock.calls[0];
    const drawW = args[3] as number;
    const drawH = args[4] as number;
    expect(drawW / drawH).toBeCloseTo(2, 1);
  });

  it("throws when image fails to load", async () => {
    vi.stubGlobal(
      "Image",
      class {
        crossOrigin = "";
        set src(_: string) {
          this.onerror?.();
        }
        onload?: () => void;
        onerror?: () => void;
      }
    );
    const { canvas } = makeMockCanvas();
    await expect(
      renderToCanvas(canvas, "#000", [{ src: "/bad.png", position: "center", size: 0.4 }], device)
    ).rejects.toThrow('SplashKit: failed to load image "/bad.png"');
  });
});
