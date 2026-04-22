import { SplashKit } from "../src/index";
import type { SplashKitOptions } from "../src/index";

type Preset = {
  name: string;
  color: string;
  options: SplashKitOptions;
};

const presets: Preset[] = [
  {
    name: "Dark",
    color: "#0f0f1a",
    options: {
      background: "#0f0f1a",
      images: [
        { src: "/assets/logo.svg", position: "center", size: 0.35 },
        { src: "/assets/wordmark.svg", position: "bottom", size: 0.5 },
      ],
      duration: 2500,
      fade: 500,
    },
  },
  {
    name: "Purple",
    color: "#3b0764",
    options: {
      background: "#3b0764",
      images: [
        { src: "/assets/logo.svg", position: "center", size: 0.4 },
        { src: "/assets/wordmark.svg", position: "bottom", size: 0.5 },
      ],
      duration: 2000,
      fade: 400,
    },
  },
  {
    name: "Ocean",
    color: "#0c4a6e",
    options: {
      background: "#0c4a6e",
      images: [
        { src: "/assets/logo.svg", position: "top", size: 0.25 },
        { src: "/assets/wordmark.svg", position: "center", size: 0.55 },
      ],
      duration: 2000,
      fade: 600,
    },
  },
  {
    name: "Ember",
    color: "#7c2d12",
    options: {
      background: "#7c2d12",
      images: [{ src: "/assets/logo.svg", position: "center", size: 0.45 }],
      duration: 1500,
      fade: 300,
    },
  },
  {
    name: "Slate",
    color: "#1e293b",
    options: {
      background: "#1e293b",
      images: [
        { src: "/assets/wordmark.svg", position: "center", size: 0.6 },
        { src: "/assets/logo.svg", position: "bottom", size: 0.2 },
      ],
      duration: 2000,
      fade: 400,
    },
  },
  {
    name: "Minimal",
    color: "#111111",
    options: {
      background: "#111111",
      images: [{ src: "/assets/logo.svg", position: "center", size: 0.3 }],
      duration: 1200,
      fade: 800,
    },
  },
];

let activePreset = presets[0];

function updateConfigDisplay(options: SplashKitOptions): void {
  const images = options.images ?? [];
  (document.getElementById("cfg-bg") as HTMLElement).textContent =
    options.background;
  (document.getElementById("cfg-images") as HTMLElement).textContent =
    images.length
      ? images.map((i) => `${i.position} · size ${i.size}`).join(" / ")
      : "none";
  (document.getElementById("cfg-duration") as HTMLElement).textContent =
    `${options.duration ?? 2000}ms`;
  (document.getElementById("cfg-fade") as HTMLElement).textContent =
    `${options.fade ?? 400}ms`;
}

function buildPresets(): void {
  const grid = document.getElementById("presets") as HTMLElement;

  presets.forEach((preset, idx) => {
    const btn = document.createElement("button");
    btn.className = "preset-btn" + (idx === 0 ? " active" : "");
    btn.dataset.idx = String(idx);

    const swatch = document.createElement("div");
    swatch.className = "preset-swatch";
    swatch.style.background = preset.color;

    btn.appendChild(swatch);
    btn.appendChild(document.createTextNode(preset.name));

    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".preset-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activePreset = presets[idx];
      updateConfigDisplay(activePreset.options);
    });

    grid.appendChild(btn);
  });
}

function updatePWABadge(): void {
  const badge = document.getElementById("pwa-badge") as HTMLElement;
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as { standalone?: boolean }).standalone === true);
  badge.textContent = isPWA ? "PWA ✓" : "browser";
  if (isPWA) badge.style.color = "#a78bfa";
}

function getOptions(): SplashKitOptions {
  const forceToggle = document.getElementById("force-toggle") as HTMLInputElement;
  return { ...activePreset.options, force: forceToggle?.checked ?? true };
}

// Bootstrap: show splash on page load with default preset
SplashKit(getOptions());

// Wire up UI
buildPresets();
updateConfigDisplay(activePreset.options);
updatePWABadge();

(document.getElementById("replay-btn") as HTMLButtonElement).addEventListener(
  "click",
  () => {
    SplashKit(getOptions());
  },
);
