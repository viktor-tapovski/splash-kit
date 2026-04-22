import type { DeviceInfo } from "./types";

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isMobile(): boolean {
  if ((navigator as { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile !== undefined) {
    return !!(navigator as { userAgentData?: { mobile?: boolean } }).userAgentData!.mobile;
  }
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  return navigator.maxTouchPoints > 0;
}

function isPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function detectDevice(): DeviceInfo {
  return {
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
    screenW: window.screen.width,
    screenH: window.screen.height,
    dpr: window.devicePixelRatio || 1,
    isIOS: isIOS(),
    isPWA: isPWA(),
    isMobile: isMobile(),
  };
}
