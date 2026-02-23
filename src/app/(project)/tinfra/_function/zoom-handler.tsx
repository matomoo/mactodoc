"use client";

import { useEffect } from "react";

export function ZoomHandler() {
  useEffect(() => {
    const handleZoom = () => {
      // Get zoom level
      const zoom = Math.round(window.devicePixelRatio * 100);
      document.documentElement.style.setProperty("--zoom-level", zoom.toString());

      // Adjust sidebar width based on zoom
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebar) {
        const baseWidth = 48; // 3rem in pixels
        const adjustedWidth = baseWidth / (zoom / 100);
        document.documentElement.style.setProperty("--sidebar-width-icon", `${adjustedWidth}px`);
      }
    };

    handleZoom();
    window.addEventListener("resize", handleZoom);

    return () => window.removeEventListener("resize", handleZoom);
  }, []);

  return null;
}
