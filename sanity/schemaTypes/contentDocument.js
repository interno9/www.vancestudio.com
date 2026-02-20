import { defineArrayMember, defineField, defineType } from "sanity";
import MediaWithPreviewInput from "../components/MediaWithPreviewInput";

export const contentDocument = defineType({
  name: "contentDocument",
  title: "Content Document",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Image or Video",
      type: "file",
      components: {
        input: MediaWithPreviewInput,
      },
      options: {
        accept: "image/*,video/*",
      },
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        defineArrayMember({
          type: "file",
          title: "Media",
          options: {
            accept: "image/*,video/*",
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      mimeType: "image.asset.mimeType",
      imageUrl: "image.asset.url",
    },
    prepare({ title, mimeType, imageUrl }) {
      return {
        title: title || "Untitled content",
        subtitle: mimeType?.startsWith("video/") ? "Video" : "Image",
        media:
          mimeType?.startsWith("image/") && imageUrl
            ? () => (
                <img
                  src={imageUrl}
                  alt={title || "Preview"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )
            : undefined,
      };
    },
  },
});
