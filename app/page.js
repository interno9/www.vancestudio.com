"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  useEffect(() => {
    client.fetch(query).then((result) => {
      setData(result || []);
    });
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
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCloseSwiper = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
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
        slides={selectedDoc?.items}
      />
    </>
  );
}
