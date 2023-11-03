import { SanityClient } from "@coaster/rpc/sanity";
import { isProd } from "@coaster/utils/common";
import { PortableText } from "@portabletext/react";
import { Post, urlFor } from "app/(pages)/blog/utils";
import Image from "next/image";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post: Post = await SanityClient.fetch(
    `
      *[_type == "post" && slug.current == $slug][0]{
        title,
        metaDescription,
      }
    `,
    { slug },
  );

  return {
    title: post.title,
    description: post.metaDescription,
    metadataBase: isProd() ? "https://trycoaster.com" : "http://localhost:3000",
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post: Post = await SanityClient.fetch(
    `
    *[_type == "post" && slug.current == $slug][0]{
      title,
      "authorName": author->name,
      "authorImage": author->image,
      "categories": categories[]->title,
      mainImage{
        ...,
        "metadata": asset->metadata,
      },
      "body": body[]{
        ...,
        ...select(
          _type == "image" => {
            ...,
            "metadata": asset->metadata,
          }
        )
      }
    }
  `,
    { slug },
  );

  return (
    <article className="tw-prose tw-mt-12 tw-mb-64 tw-mx-4 sm:tw-mx-10 tw-max-w-4xl">
      <h1>{post.title}</h1>
      <span>By {post.authorName}</span>
      {post.categories && (
        <ul>
          Posted in
          {post.categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      )}
      <div>
        <Image
          priority
          alt={post.mainImage.alt}
          src={urlFor(post.mainImage).url()}
          sizes="(max-width: 640px) 100vw, 860px"
          width={post.mainImage.metadata.dimensions.width}
          height={post.mainImage.metadata.dimensions.height}
          placeholder="blur"
          blurDataURL={post.mainImage.metadata.lqip}
        />
      </div>
      <PortableText value={post.body} components={Components} />
    </article>
  );
}

const Components = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <Image
          alt={value.alt}
          src={urlFor(value).url()}
          sizes="(max-width: 640px) 100vw, 860px"
          width={value.metadata.dimensions.width}
          height={value.metadata.dimensions.height}
          placeholder="blur"
          blurDataURL={value.metadata.lqip}
        />
      );
    },
  },
};
