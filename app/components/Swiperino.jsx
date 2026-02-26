"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";

export default function Swiperino({ isOpen, onClose, slides = [], docTitle = "" }) {
  const scrollRef = useRef(null);
  const dragStateRef = useRef({ active: false, x: 0, left: 0 });
  const syncRafRef = useRef(null);
  const LOOP_COPIES = 5;
  const canLoop = slides.length > 1;
  const virtualSlides = useMemo(() => {
    if (!canLoop) return slides;
    return Array.from({ length: LOOP_COPIES }, () => slides).flat();
  }, [slides, canLoop]);

  const recenterIfNeeded = useCallback(() => {
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
  }, [canLoop]);

  const tryPlayVideo = useCallback((video) => {
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, []);

  const syncVisibleVideos = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const videos = container.querySelectorAll("video[data-swiper-video='true']");

    videos.forEach((video) => {
      const rect = video.getBoundingClientRect();
      const visibleWidth =
        Math.min(rect.right, containerRect.right) - Math.max(rect.left, containerRect.left);
      const isVisible = visibleWidth > rect.width * 0.35;

      if (isVisible) {
        tryPlayVideo(video);
        return;
      }

      if (!video.paused) video.pause();
    });
  }, [tryPlayVideo]);

  const scheduleVideoSync = useCallback(() => {
    if (syncRafRef.current !== null) return;
    syncRafRef.current = requestAnimationFrame(() => {
      syncRafRef.current = null;
      syncVisibleVideos();
    });
  }, [syncVisibleVideos]);

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

    const handleScroll = () => {
      recenterIfNeeded();
      scheduleVideoSync();
    };

    window.addEventListener("keydown", handleKeyDown);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.style.cursor = "grab";
    requestAnimationFrame(() => {
      if (canLoop) {
        const oneLoopWidth = container.scrollWidth / LOOP_COPIES;
        container.scrollLeft = oneLoopWidth * Math.floor(LOOP_COPIES / 2);
      }
      scheduleVideoSync();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (syncRafRef.current !== null) {
        cancelAnimationFrame(syncRafRef.current);
        syncRafRef.current = null;
      }
    };
  }, [isOpen, onClose, canLoop, recenterIfNeeded, scheduleVideoSync]);

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
                  poster={slide.posterUrl || undefined}
                  loop
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  data-swiper-video="true"
                  onLoadedData={(event) => tryPlayVideo(event.currentTarget)}
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
