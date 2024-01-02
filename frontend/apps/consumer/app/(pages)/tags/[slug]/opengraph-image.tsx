import { getTagServer } from "@coaster/rpc/server";
import sharp from "sharp";

export const runtime = "edge";

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const tag = await getTagServer(params.slug);
  if (!tag) {
    return undefined;
  }

  return [
    {
      id: "og-image",
      alt: tag.title,
      contentType: "image/png",
      size: {
        width: 1200,
        height: 630,
      },
    },
  ];
}

export default async function Image({ params }: { params: { slug: string } }) {
  const tag = await getTagServer(params.slug);
  if (!tag || !tag.image_url) {
    return undefined;
  }

  const imageRes = await fetch(tag.image_url);
  const original = await imageRes.arrayBuffer();
  const converted = await sharp(original).resize({ height: 630, width: 1200 }).rotate().png({ quality: 80 }).toBuffer();
  return new Response(converted);
}
