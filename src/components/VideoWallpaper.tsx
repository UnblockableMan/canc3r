"use client";

// Optional looping video background (sources: cineosweb.github.io / custom URL)
// OR particle background (from Velara — uses particles.js library which
// actually renders visible particles, unlike our CSS-based ones).
// Renders behind all UI; dims itself so themes stay readable.

import { useEffect, useMemo, useRef } from "react";
import { useSettings, VIDEO_WALLPAPERS } from "@/store/settings";

export function VideoWallpaper() {
  const videoWallpaper = useSettings((s) => s.videoWallpaper);
  const customVideoUrl = useSettings((s) => s.customVideoUrl);
  const wallpaper = useSettings((s) => s.wallpaper);
  const ref = useRef<HTMLVideoElement | null>(null);
  const particleRef = useRef<HTMLDivElement | null>(null);

  const url = useMemo(() => {
    if (videoWallpaper === "none") return "";
    if (videoWallpaper === "custom") return customVideoUrl.trim();
    return VIDEO_WALLPAPERS.find((v) => v.id === videoWallpaper)?.url || "";
  }, [videoWallpaper, customVideoUrl]);

  useEffect(() => {
    const el = ref.current;
    if (el) el.play().catch(() => {});
  }, [url]);

  // Load particles.js for the "stars" wallpaper (Velara-style particles
  // that actually render visible dots, unlike the CSS radial-gradient
  // approach which is barely visible).
  useEffect(() => {
    if (wallpaper !== "stars") return;
    const existing = document.getElementById("particles-js-lib");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "particles-js-lib";
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.onload = () => {
      if (window.particlesJS && particleRef.current?.id) {
        window.particlesJS(particleRef.current.id, {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "var(--accent)" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "var(--accent)", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1, direction: "none", random: true, out_mode: "out" },
          },
          interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false } } },
        });
      }
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [wallpaper]);

  if (!url && wallpaper !== "stars") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {url && (
        <video
          ref={ref}
          key={url}
          src={url}
          className="h-full w-full object-cover"
          style={{ opacity: 0.32 }}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      {wallpaper === "stars" && (
        <div ref={particleRef} id="c3-particles" className="absolute inset-0" />
      )}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
    </div>
  );
}
