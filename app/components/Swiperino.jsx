"use client";
import { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";

export default function Swiperino({ isOpen, onClose, slides = [], docTitle = "" }) {
  const scrollRef = useRef(null);
  const dragStateRef = useRef({ active: false, x: 0, left: 0 });
  const LOOP_COPIES = 7;
  const canLoop = slides.length > 1;
  const virtualSlides = useMemo(() => {
    if (!canLoop) return slides;
    return Array.from({ length: LOOP_COPIES }, () => slides).flat();
  }, [slides, canLoop]);

  const recenterIfNeeded = () => {
    const container = scrollRef.current;
    if (!container || !canLoop) return;

    const oneLoopWidth = container.scrollWidth / LOOP_COPIES;
    const min = oneLoopWidth;
    const max = oneLoopWidth * (LOOP_COPIES - 2);
    const current = container.scrollLeft;

    if (current > min && current < max) return;
    const normalized =
      ((current % oneLoopWidth) + oneLoopWidth) % oneLoopWidth;
    container.scrollLeft = oneLoopWidth * Math.floor(LOOP_COPIES / 2) + normalized;
  };

  useEffect(() => {
    if (!isOpen) return;

    const container = scrollRef.current;
    if (!container) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowRight") {
        container.scrollBy({ left: window.innerWidth, behavior: "smooth" });
      }
      if (event.key === "ArrowLeft") {
        container.scrollBy({ left: -window.innerWidth, behavior: "smooth" });
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      container.scrollLeft += event.deltaY + event.deltaX;
      recenterIfNeeded();
    };

    const onPointerDown = (event) => {
      dragStateRef.current = {
        active: true,
        x: event.clientX,
        left: container.scrollLeft,
      };
      container.style.cursor = "grabbing";
    };

    const onPointerMove = (event) => {
      if (!dragStateRef.current.active) return;
      const dx = event.clientX - dragStateRef.current.x;
      container.scrollLeft = dragStateRef.current.left - dx;
      recenterIfNeeded();
    };

    const onPointerUp = () => {
      dragStateRef.current.active = false;
      container.style.cursor = "grab";
    };

    window.addEventListener("keydown", handleKeyDown);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", recenterIfNeeded, { passive: true });
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.style.cursor = "grab";
    if (canLoop) {
      requestAnimationFrame(() => {
        const oneLoopWidth = container.scrollWidth / LOOP_COPIES;
        container.scrollLeft = oneLoopWidth * Math.floor(LOOP_COPIES / 2);
      });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", recenterIfNeeded);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isOpen, onClose, canLoop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-white">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close swiper"
        className="fixed left-1/2 -translate-x-1/2 top-2 z-50 hover:cursor-pointer opacity-30 hover:opacity-100 transition-opacity"
      >
        <X size={22} strokeWidth={2} />
      </button>

      <div
        ref={scrollRef}
        className="h-screen w-screen overflow-x-auto overflow-y-hidden touch-pan-x"
      >
        <div className="flex h-screen w-max">
          {virtualSlides.map((slide, index) => (
            <article
              key={`${slide._key || slide.url}-${index}`}
              className="h-screen w-auto shrink-0 flex items-center justify-center"
            >
              {slide?.mimeType?.startsWith("video/") ? (
                <video
                  src={slide.url}
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="h-screen w-auto max-w-none object-contain"
                />
              ) : (
                <img
                  src={slide.url}
                  alt={docTitle || "Slide image"}
                  className="h-screen w-auto max-w-none object-contain"
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
