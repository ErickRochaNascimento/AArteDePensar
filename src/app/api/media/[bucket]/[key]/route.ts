import { getDb } from "@/lib/db";
import { imageMimeType, readImage, type ImageBucket } from "@/lib/media-storage";

type RouteContext = { params: Promise<{ bucket: string; key: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { bucket, key } = await params;
  if (bucket !== "authors" && bucket !== "covers") return new Response("Not found", { status: 404 });
  const imageBucket = bucket as ImageBucket;
  const mimeType = imageMimeType(key);
  if (!mimeType) return new Response("Not found", { status: 404 });
  const url = `/api/media/${imageBucket}/${key}`;

  try {
    const linked = imageBucket === "authors"
      ? await getDb().author.findFirst({ where: { photoUrl: url }, select: { id: true } })
      : await getDb().book.findFirst({ where: { coverImageUrl: url }, select: { id: true } });
    if (!linked) return new Response("Not found", { status: 404 });

    const data = await readImage(imageBucket, key);
    if (!data) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(data.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 503 });
  }
}
