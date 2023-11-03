import { SanityClient } from "@coaster/rpc/sanity";
import { Post, urlFor } from "app/(pages)/blog/utils";

export const runtime = "edge";

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post: Post = await SanityClient.fetch(
    `
      *[_type == "post" && slug.current == $slug][0]{
        mainImage,
      }
    `,
    { slug },
  );

  return [
    {
      id: "og-image",
      alt: post.mainImage.alt,
      contentType: "image/png",
      size: {
        width: 1200,
        height: 630,
      },
    },
  ];
}

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post: Post = await SanityClient.fetch(
    `
    *[_type == "post" && slug.current == $slug][0]{
      mainImage{
        ...,
        "metadata": asset->metadata,
      },
    }
  `,
    { slug },
  );

  const imageRes = await fetch(urlFor(post.mainImage).width(1200).height(630).quality(80).format("png").url());
  const imageData = await imageRes.arrayBuffer();
  return new Response(imageData);
}
