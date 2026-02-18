"use client";

import { useEffect, useState } from "react";
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
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
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

  return (
    <>
      <main className="grid grid-cols-2 md:grid-cols-3">
        {data.map(({ _id, title, url, width, height }) =>
          url ? (
            <button
              key={_id}
              onClick={() => handleImageClick(_id)}
              type="button"
              className="focus:outline-none focus-visible:outline-none hover:cursor-pointer"
            >
              <Image
                className="w-full aspect-square object-cover"
                src={url}
                alt={title || "Content image"}
                width={width || 1200}
                height={height || 1200}
              />
            </button>
          ) : null,
        )}
      </main>
      <Swiperino
        isOpen={Boolean(selectedId)}
        onClose={handleCloseSwiper}
        slides={selectedDoc?.items || []}
      />
    </>
  );
}
