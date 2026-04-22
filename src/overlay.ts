const OVERLAY_ID = "splash-kit-overlay";

export function createOverlay(): { overlay: HTMLDivElement; canvas: HTMLCanvasElement } {
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "999999",
    overflow: "hidden",
    opacity: "1",
    transition: "",
  });

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    width: "100%",
    height: "100%",
    display: "block",
  });

  overlay.appendChild(canvas);
  document.body.appendChild(overlay);
  return { overlay, canvas };
}

export function dismissOverlay(
  overlay: HTMLDivElement,
  fadeDuration: number,
  onDismiss?: () => void
): void {
  overlay.style.transition = `opacity ${fadeDuration}ms ease`;
  overlay.style.opacity = "0";

  let dismissed = false;
  const cleanup = () => {
    if (dismissed) return;
    dismissed = true;
    overlay.remove();
    onDismiss?.();
  };

  overlay.addEventListener("transitionend", cleanup, { once: true });
  setTimeout(cleanup, fadeDuration + 50);
}
