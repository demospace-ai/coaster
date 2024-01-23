import { SanityClient } from "@coaster/rpc/sanity";
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
    openGraph: {
      title: post.title,
      description: post.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
    alternates: {
      canonical: `https://www.trycoaster.com/blog/${slug}`,
    },
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
      },
      publishedAt,
      _updatedAt
    }
  `,
    { slug },
  );

  return (
    <article className="tw-prose prose-headings:tw-font-heading prose-headings:tw-mb-3 tw-mt-12 tw-mb-64 tw-mx-4 sm:tw-mx-10 tw-max-w-4xl">
      <h1 className="tw-mb-4 tw-font-heading">{post.title}</h1>
      <div className="tw-flex tw-items-center tw-mb-1">
        <div>By {post.authorName}</div>
        <span className="tw-mx-2">|</span>
        <span>
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : new Date(post._updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
        </span>
        <span className="tw-mx-2">|</span>
        {post.categories && (
          <>
            <ul className="tw-list-none tw-p-0 tw-m-0">
              {post.categories.map((category) => (
                <li
                  className="tw-flex tw-w-fit tw-mr-2 tw-px-2 tw-py-0.5 tw-text-sm tw-bg-orange-100 tw-border tw-border-solid tw-border-orange-300 tw-rounded-lg"
                  key={category}
                >
                  {category}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
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
