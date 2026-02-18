import { defineField, defineType } from "sanity";
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
        {
          type: "object",
          name: "imageTextItem",
          title: "Media + Text Item",
          validation: (Rule) =>
            Rule.custom((item) => {
              const hasFile = Boolean(item?.file);

              if (!hasFile) {
                return "Add a file.";
              }

              return true;
            }),
          fields: [
            defineField({
              name: "file",
              title: "File",
              type: "file",
              options: {
                accept: "image/*,video/*",
              },
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 4,
            }),
            defineField({
              name: "videoPreviewImage",
              title: "",
              type: "image",
              options: { hotspot: true },
              hidden: ({ parent }) => {
                const ref = parent?.file?.asset?._ref || "";
                const ext = ref.split("-").pop()?.toLowerCase();
                const videoExts = [
                  "mp4",
                  "mov",
                  "webm",
                  "m4v",
                  "avi",
                  "mkv",
                  "wmv",
                ];
                return !videoExts.includes(ext);
              },
            }),
          ],
          preview: {
            select: {
              title: "text",
              fileName: "file.asset.originalFilename",
              mimeType: "file.asset.mimeType",
              fileUrl: "file.asset.url",
              videoPreviewImage: "videoPreviewImage",
            },
            prepare({ title, fileName, mimeType, fileUrl, videoPreviewImage }) {
              const fileType = mimeType?.startsWith("video/")
                ? "Video"
                : mimeType?.startsWith("image/")
                  ? "Image"
                  : "File";

              return {
                title: title || "Untitled item",
                subtitle: fileName
                  ? `${fileType}: ${fileName}`
                  : "No file selected",
                media:
                  mimeType?.startsWith("video/") && videoPreviewImage
                    ? videoPreviewImage
                    : mimeType?.startsWith("image/") && fileUrl
                      ? () => (
                          <img
                            src={fileUrl}
                            alt={fileName || "Preview"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )
                      : undefined,
              };
            },
          },
        },
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
