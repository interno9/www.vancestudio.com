import { useMemo } from "react";
import { Card, Stack, Text } from "@sanity/ui";
import { dataset, projectId } from "../env";

export default function MediaWithPreviewInput(props) {
  const { value, renderDefault } = props;
  const fileRef = value?.asset?._ref || null;
  const previewUrl = useMemo(() => refToFileUrl(fileRef), [fileRef]);
  const mediaKind = useMemo(() => {
    if (!fileRef) return null;
    const ext = fileRef.split("-").pop()?.toLowerCase() || "";
    return VIDEO_EXTENSIONS.includes(ext) ? "video" : "image";
  }, [fileRef]);

  return (
    <Stack space={3}>
      {previewUrl ? (
        <Card padding={2} radius={2} tone="transparent" border>
          {mediaKind === "video" ? (
            <video
              src={previewUrl}
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <img
              src={previewUrl}
              alt="Selected media preview"
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
        </Card>
      ) : null}
      {renderDefault(props)}
    </Stack>
  );
}

const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "m4v", "avi", "mkv", "wmv"];

function refToFileUrl(ref) {
  if (!ref || !ref.startsWith("file-")) return null;
  const parts = ref.split("-");
  if (parts.length < 3) return null;
  const id = parts[1];
  const ext = parts[2];
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`;
}
