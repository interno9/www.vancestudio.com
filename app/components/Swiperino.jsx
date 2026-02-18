"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { X } from "lucide-react";

export default function Swiperino({ isOpen, onClose, slides = [] }) {
  const swiperRef = useRef(null);
  const [cursorClass, setCursorClass] = useState("cursor-e-resize");
  const canLoop = slides.length > 1;
  const LOOP_COPIES = 5;
  const virtualSlides = useMemo(() => {
    if (!canLoop) return slides;
    return Array.from({ length: LOOP_COPIES }, () => slides).flat();
  }, [slides, canLoop]);
  const loopOffset = canLoop ? slides.length * Math.floor(LOOP_COPIES / 2) : 0;

  const recenterIfNeeded = (swiper) => {
    if (!canLoop || !slides.length) return;
    const safeMin = slides.length;
    const safeMax = virtualSlides.length - slides.length;
    const idx = swiper.activeIndex;
    if (idx >= safeMin && idx < safeMax) return;

    const normalized = ((idx % slides.length) + slides.length) % slides.length;
    swiper.slideTo(loopOffset + normalized, 0, false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-40 bg-white ${cursorClass}`}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close swiper"
        onPointerUp={(event) => event.stopPropagation()}
        className="fixed left-1/2 -translate-x-1/2 top-2 z-50 hover:cursor-pointer opacity-30 hover:opacity-100 transition-opacity"
      >
        <X size={22} strokeWidth={2} />
      </button>

      <Swiper
        key={`swiper-${slides.length}-${canLoop ? "loop" : "single"}`}
        modules={[FreeMode, Mousewheel]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (canLoop) swiper.slideTo(loopOffset, 0, false);
        }}
        onSlideChange={(swiper) => {
          recenterIfNeeded(swiper);
        }}
        onTouchEnd={(swiper) => recenterIfNeeded(swiper)}
        onTransitionEnd={(swiper) => recenterIfNeeded(swiper)}
        loop={false}
        slidesPerView="auto"
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.8,
          momentumVelocityRatio: 0.8,
          minimumVelocity: 0.05,
          momentumBounce: false,
          sticky: false,
        }}
        speed={700}
        mousewheel={{ forceToAxis: false, releaseOnEdges: false }}
        resistanceRatio={0}
        watchSlidesProgress
        className="h-screen"
        spaceBetween={0}
        centeredSlides={true}
      >
        {virtualSlides.map((slide, index) => (
          <SwiperSlide
            key={`${slide._key || slide.url}-${index}`}
            className="!flex !w-auto !shrink-0 h-screen items-center justify-center"
          >
            <div className="flex h-screen w-auto items-center justify-center">
              {slide?.mimeType?.startsWith("video/") ? (
                <video
                  src={slide.url}
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="h-screen w-auto max-w-full object-contain"
                />
              ) : (
                <img
                  src={slide.url}
                  alt={slide.text || "Slide image"}
                  className="h-screen w-auto max-w-full object-contain"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
