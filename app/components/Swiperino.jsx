"use client";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { X } from "lucide-react";

export default function Swiperino({ isOpen, onClose, slides = [] }) {
  const swiperRef = useRef(null);
  const pointerStart = useRef({ x: 0, y: 0 });
  const [cursorClass, setCursorClass] = useState("cursor-e-resize");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") swiperRef.current?.slidePrev();
      if (event.key === "ArrowRight") swiperRef.current?.slideNext();
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-40 bg-white ${cursorClass}`}
      onMouseMove={(event) => {
        setCursorClass(
          event.clientX < window.innerWidth / 2
            ? "cursor-w-resize"
            : "cursor-e-resize",
        );
      }}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const dx = Math.abs(event.clientX - pointerStart.current.x);
        const dy = Math.abs(event.clientY - pointerStart.current.y);
        if (dx > 8 || dy > 8) return;
        if (event.clientX < window.innerWidth / 2)
          swiperRef.current?.slidePrev();
        else swiperRef.current?.slideNext();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close swiper"
        onPointerUp={(event) => event.stopPropagation()}
        className="fixed left-1/2 -translate-x-1/2 top-2 z-50 font-bold hover:cursor-pointer opacity-30 hover:opacity-100 transition-opacity"
      >
        <X size={22} strokeWidth={2} />
      </button>

      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        loop={slides.length > 1}
        slidesPerView="auto"
        className="h-screen"
        spaceBetween={0}
      >
        {slides.map((slide) => (
          <SwiperSlide
            key={slide._key || slide.url}
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
