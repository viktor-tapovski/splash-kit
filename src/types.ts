export type ImagePosition = "top" | "center" | "bottom";

export interface ImageConfig {
  src: string;
  position: ImagePosition;
  /** Fraction of viewport's shorter dimension (0–1). Aspect ratio preserved. */
  size: number;
}

export interface DeviceInfo {
  viewportW: number;
  viewportH: number;
  screenW: number;
  screenH: number;
  dpr: number;
  isIOS: boolean;
  isPWA: boolean;
  isMobile: boolean;
}

export interface SplashKitOptions {
  background: string;
  images?: ImageConfig[];
  /** Milliseconds before auto-dismiss. Default: 2000 */
  duration?: number;
  /** Fade-out duration in ms. Default: 400 */
  fade?: number;
  /** Show on non-PWA contexts too. Default: false */
  force?: boolean;
  onDismiss?: () => void;
}
