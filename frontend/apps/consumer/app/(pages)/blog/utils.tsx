import { SanityClient } from "@coaster/rpc/sanity";
import type { PortableTextBlock } from "@portabletext/types";
import imageUrlBuilder from "@sanity/image-url";
import type { ImageAsset, Slug } from "@sanity/types";

export interface PostImage extends ImageAsset {
  alt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: Slug;
  categories: string[];
  metaDescription: string;
  authorName: string;
  authorImage?: ImageAsset;
  mainImage: PostImage;
  body: PortableTextBlock[];
}

export const urlFor = (source: any) => imageUrlBuilder(SanityClient).image(source);
