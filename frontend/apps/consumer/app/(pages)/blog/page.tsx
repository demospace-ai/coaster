import { SanityClient } from "@coaster/rpc/sanity";
import { Post, urlFor } from "app/(pages)/blog/utils";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coaster Blog",
};

export default async function AllPosts() {
  const posts: Post[] = await SanityClient.fetch(
    `
      *[_type == "post" && defined(slug.current)]{
        _id,
        title,
        slug,
        metaDescription,
        mainImage{
          ...,
          "metadata": asset->metadata,
        },
      }
    `,
  );

  return (
    <main className="tw-w-full tw-max-w-7xl tw-mt-10 tw-mx-4 sm:tw-mx-10">
      <div className="tw-mb-10">
        <h1 className="tw-font-bold tw-text-6xl">Blog</h1>
      </div>
      <div className="tw-flex tw-w-full tw-justify-start">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug.current}`} key={post._id} className="tw-flex tw-flex-col tw-max-w-2xl">
            <Image
              priority
              alt={post.mainImage.alt}
              src={urlFor(post.mainImage).url()}
              sizes="100vw"
              width={post.mainImage.metadata.dimensions.width}
              height={post.mainImage.metadata.dimensions.height}
              placeholder="blur"
              blurDataURL={post.mainImage.metadata.lqip}
              className="tw-shadow-md"
            />
            <div className="tw-mt-4 tw-font-bold tw-text-2xl">{post.title}</div>
            <div className="tw-mt-1 tw-text-base">{post.metaDescription}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
