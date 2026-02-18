"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { client } from "@/sanity/lib/client";
import Swiperino from "./components/Swiperino";

const query = `*[_type == "contentDocument"]{
  _id,
  title,
  "url": image.asset->url,
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
    client.fetch(query).then((result) => {
      setData(result || []);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
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

    client.fetch(detailQuery, { id: selectedId }).then((result) => {
      setSelectedDoc(result || null);
    });
  }, [selectedId]);

  const handleImageClick = (id) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("id", id);
    router.push(`${pathname}?${params.toString()}`);
    setSelectedId(id);
  };

  const handleCloseSwiper = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.delete("id");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
    setSelectedId(null);
  };

  const appendRandomBatch = useCallback(
    (batchCount = 1) => {
      if (!data.length) return;
      const nextItems = [];

      for (let batchOffset = 0; batchOffset < batchCount; batchOffset += 1) {
        const batchId = batchRef.current;
        batchRef.current += 1;
        const randomBatch = shuffleArray(data).map((item, index) => ({
          ...item,
          feedKey: `${item._id}-${batchId}-${index}`,
          originalId: item._id,
        }));
        nextItems.push(...randomBatch);
      }

      setFeedItems((prev) => [...prev, ...nextItems]);
    },
    [data],
  );

  useEffect(() => {
    if (!data.length) return;
    batchRef.current = 0;
    const firstBatch = shuffleArray(data).map((item, index) => ({
      ...item,
      feedKey: `${item._id}-0-${index}`,
      originalId: item._id,
    }));
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
        appendRandomBatch(3);
        requestAnimationFrame(() => {
          isAppendingRef.current = false;
          observer.observe(entry.target);
        });
      },
      { rootMargin: "1200px 0px" },
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
      if (remaining > window.innerHeight * 2) return;
      isAppendingRef.current = true;
      appendRandomBatch(4);
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
        {feedItems.map(({ feedKey, originalId, title, url, width, height }) => (
          <GalleryTile
            key={feedKey}
            id={originalId}
            title={title}
            url={url}
            width={width}
            height={height}
            onClick={handleImageClick}
          />
        ))}
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

function GalleryTile({ id, title, url, width, height, onClick }) {
  const tileRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

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
      { rootMargin: "150px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={tileRef}
      onClick={() => onClick(id)}
      type="button"
      className="group overflow-hidden focus:outline-none focus-visible:outline-none hover:cursor-pointer"
    >
      <Image
        className="w-full aspect-square object-cover group-hover:blur-lg group-hover:scale-110 transition-all duration-200"
        src={url}
        alt={title}
        width={width}
        height={height}
        sizes="(min-width: 768px) 33.33vw, 100vw"
        quality={isInView ? 85 : 10}
        loading="lazy"
      />
    </button>
  );
}
