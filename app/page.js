import Image from "next/image";
import { client } from "@/sanity/lib/client";

const query = `*[_type == "contentDocument"][0]{
  title,
  image{
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  }
}`;

export default async function Page() {
  const data = await client.fetch(query);
  const image = data?.image?.asset;
  const imageUrl = image?.url;

  if (!imageUrl) {
    return <div>No image found in contentDocument.</div>;
  }

  return (
    <main style={{ padding: "24px" }}>
      <div style={{ width: "320px", aspectRatio: "1 / 1", position: "relative" }}>
        <Image
          src={imageUrl}
          alt={data?.title || "Content image"}
          fill
          sizes="320px"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </main>
  );
}
