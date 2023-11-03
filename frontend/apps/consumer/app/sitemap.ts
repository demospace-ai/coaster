import { GetAllListingMetadata, sendRequest } from "@coaster/rpc/common";
import { SanityClient } from "@coaster/rpc/sanity";
import { Post } from "app/(pages)/blog/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingMetadataList = await sendRequest(GetAllListingMetadata);
  const listingPages = listingMetadataList.map((metadata) => ({
    url: `https://www.trycoaster.com/listings/${metadata.id}`,
    lastModified: metadata.updated_at,
  }));

  const blogPosts: Post[] = await SanityClient.fetch(
    `
      *[_type == "post" && defined(slug.current)]{
        slug,
        publishedAt,
        _updatedAt
      }
    `,
  );

  const blogPostPages = blogPosts.map((post: Post) => ({
    url: "https://www.trycoaster.com/blog/" + post.slug.current,
    lastModified: post.publishedAt ? post.publishedAt : post._updatedAt,
  }));

  return [
    {
      url: "https://www.trycoaster.com",
      lastModified: new Date(),
    },
    {
      url: "https://www.trycoaster.com/about",
      lastModified: new Date(2023, 9, 1),
    },
    {
      url: "https://www.trycoaster.com/terms",
      lastModified: new Date(2023, 9, 1),
    },
    {
      url: "https://www.trycoaster.com/privacy",
      lastModified: new Date(2023, 9, 1),
    },
    {
      url: "https://www.trycoaster.com/blog",
      lastModified: new Date(2023, 10, 1),
    },
    ...listingPages,
    ...blogPostPages,
  ];
}
