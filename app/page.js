"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { client } from "@/sanity/lib/client";
import Swiperino from "./components/Swiperino";

const SENTINEL_ROOT_MARGIN = "1200px 0px";
const TILE_ROOT_MARGIN = "150px 0px";
const SENTINEL_BATCH_COUNT = 3;
const BUFFER_BATCH_COUNT = 4;
const MIN_SCROLL_BUFFER_VIEWPORTS = 2;

const query = `*[_type == "contentDocument"]{
  _id,
  title,
  "url": image.asset->url,
  "mimeType": image.asset->mimeType,
  "width": image.asset->metadata.dimensions.width,
  "height": image.asset->metadata.dimensions.height
}`;

const detailQuery = `*[_type == "contentDocument" && _id == $id][0]{
  _id,
  title,
  items[]{
    _key,
    text,
    "url": file.asset->url,
    "mimeType": file.asset->mimeType
  }
}`;

export default function Page() {
  const [data, setData] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const sentinelRef = useRef(null);
  const batchRef = useRef(0);
  const isAppendingRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    client.fetch(query).then((result) => {
      if (isMounted) setData(result || []);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const syncSelectedId = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedId(params.get("id"));
    };

    syncSelectedId();
    window.addEventListener("popstate", syncSelectedId);
    return () => window.removeEventListener("popstate", syncSelectedId);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDoc(null);
      return;
    }

    let isMounted = true;
    client.fetch(detailQuery, { id: selectedId }).then((result) => {
      if (isMounted) setSelectedDoc(result || null);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [selectedId]);

  const handleImageClick = useCallback(
    (id) => {
      const params = new URLSearchParams(window.location.search);
      params.set("id", id);
      const next = params.toString();
      router.push(next ? `${pathname}?${next}` : pathname);
      setSelectedId(id);
    },
    [pathname, router],
  );

  const handleCloseSwiper = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("id");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
    setSelectedId(null);
  }, [pathname, router]);

  const appendRandomBatch = useCallback(
    (batchCount = 1) => {
      if (!data.length) return;
      const nextItems = Array.from({ length: batchCount }, () => {
        const batchId = batchRef.current;
        batchRef.current += 1;
        return createFeedBatch(data, batchId);
      }).flat();
      setFeedItems((prev) => [...prev, ...nextItems]);
    },
    [data],
  );

  useEffect(() => {
    if (!data.length) return;
    batchRef.current = 0;
    const firstBatch = createFeedBatch(data, 0);
    batchRef.current = 1;
    setFeedItems(firstBatch);
  }, [data]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !data.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (isAppendingRef.current) return;
        isAppendingRef.current = true;
        observer.unobserve(entry.target);
        appendRandomBatch(SENTINEL_BATCH_COUNT);
        requestAnimationFrame(() => {
          isAppendingRef.current = false;
          observer.observe(entry.target);
        });
      },
      { rootMargin: SENTINEL_ROOT_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [data, appendRandomBatch]);

  useEffect(() => {
    if (!data.length) return;

    const ensureBuffer = () => {
      if (isAppendingRef.current) return;
      const remaining =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);
      if (remaining > window.innerHeight * MIN_SCROLL_BUFFER_VIEWPORTS) return;
      isAppendingRef.current = true;
      appendRandomBatch(BUFFER_BATCH_COUNT);
      requestAnimationFrame(() => {
        isAppendingRef.current = false;
      });
    };

    window.addEventListener("scroll", ensureBuffer, { passive: true });
    window.addEventListener("resize", ensureBuffer);
    ensureBuffer();

    return () => {
      window.removeEventListener("scroll", ensureBuffer);
      window.removeEventListener("resize", ensureBuffer);
    };
  }, [data, appendRandomBatch]);

  return (
    <>
      <main className="grid grid-cols-1 md:grid-cols-3">
        {feedItems.map(
          ({ feedKey, originalId, title, url, mimeType, width, height }) => (
            <GalleryTile
              key={feedKey}
              id={originalId}
              title={title}
              url={url}
              mimeType={mimeType}
              width={width}
              height={height}
              onClick={handleImageClick}
            />
          ),
        )}
      </main>
      <div ref={sentinelRef} className="h-16 w-full" aria-hidden="true" />
      <Swiperino
        isOpen={Boolean(selectedId)}
        onClose={handleCloseSwiper}
        slides={selectedDoc?.items || []}
      />
    </>
  );
}

function shuffleArray(items = []) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createFeedBatch(items, batchId) {
  return shuffleArray(items).map((item, index) => ({
    ...item,
    feedKey: `${item._id}-${batchId}-${index}`,
    originalId: item._id,
  }));
}

function GalleryTile({ id, title, url, mimeType, width, height, onClick }) {
  const tileRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const isVideo = mimeType?.startsWith("video/");

  useEffect(() => {
    const node = tileRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: TILE_ROOT_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={tileRef}
      onClick={() => onClick(id)}
      type="button"
      className="relative group overflow-hidden focus:outline-none focus-visible:outline-none hover:cursor-pointer"
    >
      {isVideo ? (
        <video
          className="w-full aspect-square object-cover group-hover:blur-lg group-hover:scale-110 transition-all duration-200"
          src={url}
          muted
          loop
          autoPlay={isInView}
          playsInline
          controls={false}
          preload={isInView ? "metadata" : "none"}
        />
      ) : (
        <Image
          className="w-full aspect-square object-cover group-hover:blur-lg group-hover:scale-110 transition-all duration-200"
          src={url}
          alt={title || "Gallery image"}
          width={width || 1200}
          height={height || 1200}
          sizes="(min-width: 768px) 33.33vw, 100vw"
          quality={isInView ? 85 : 10}
          loading="lazy"
        />
      )}

      <span className="uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-1000 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {title}
      </span>
    </button>
  );
}
