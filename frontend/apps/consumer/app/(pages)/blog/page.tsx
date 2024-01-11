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
        "authorName": author->name,
        mainImage{
          ...,
          "metadata": asset->metadata,
        },
      }
    `,
  );

  return (
    <main className="tw-mt-6 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 tw-pb-32 sm:tw-mt-10 sm:tw-px-20">
      <div className="tw-w-full tw-max-w-7xl">
        <div className="tw-mb-6 sm:tw-mb-10">
          <h1 className="tw-text-5xl tw-font-bold">Blog</h1>
        </div>
        <div className="tw-grid tw-w-full tw-grid-flow-row-dense tw-grid-cols-1 tw-justify-start tw-gap-12 sm:tw-grid-cols-2 sm:tw-gap-10 md:tw-grid-cols-3">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug.current}`} key={post._id} className="tw-flex tw-max-w-xl tw-flex-col">
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
              <div className="tw-mt-4 tw-uppercase">By {post.authorName}</div>
              <div className="tw-mt-1 tw-text-2xl tw-font-bold">{post.title}</div>
              <div className="tw-mt-1 tw-text-base">{post.metaDescription}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
