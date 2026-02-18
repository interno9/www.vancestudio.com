"use client";
import React, { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { usePathname } from "next/navigation";

const SmoothScroll = ({ children }) => {
  const pathname = usePathname();
  const isBrowser = typeof window !== "undefined";
  const isTouch = isBrowser && window.matchMedia("(hover: none)").matches;
  if (!pathname || pathname.includes("studio") || pathname.includes("map")) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!isBrowser || isTouch) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -20 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      // Remove or adjust these for mobile compatibility
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isBrowser, isTouch]);

  return <>{children}</>;
};

export default SmoothScroll;
