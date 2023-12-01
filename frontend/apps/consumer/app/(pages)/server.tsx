import Hero from "@coaster/assets/hero.jpg";
import Footer from "@coaster/assets/home-footer.jpg";
import NeedHelp from "@coaster/assets/need-help.jpg";
import { SearchBar } from "@coaster/components/search/SearchBar";
import { SanityClient } from "@coaster/rpc/sanity";
import { getFeaturedServer } from "@coaster/rpc/server";
import { Post } from "app/(pages)/blog/utils";
import { BlogSectionClient, FeaturedClient } from "app/(pages)/client";
import { FeaturedCategory } from "app/(pages)/utils";
import Image from "next/image";
import Link from "next/link";

export const FeaturedPage = async ({ category }: { category?: FeaturedCategory }) => {
  const featured = await getFeaturedServer();

  return (
    <main className="tw-flex tw-flex-col tw-w-full tw-h-full tw-justify-center">
      <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20">
        <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 tw-pb-24 tw-w-full tw-max-w-7xl">
          <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center tw-mb-6 sm:tw-mb-10 tw-mx-10 tw-w-full tw-min-h-[420px] tw-h-[420px] tw-max-h-[420px] sm:tw-min-h-[480px] sm:tw-h-[480px] sm:tw-max-h-[480px] tw-rounded-2xl tw-p-8">
            <div className="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-w-full">
              <Image
                fill
                alt="Hero image"
                priority
                src={Hero}
                sizes="(max-width: 640px) 80vw, 50vw"
                placeholder="blur"
                className="tw-rounded-2xl tw-object-left tw-object-cover"
              />
            </div>
            <div className="tw-z-[1]">
              <div className="tw-text-white tw-w-full tw-max-w-[800px] tw-py-5 tw-rounded-2xl tw-text-center">
                <div className="tw-font-semibold tw-text-5xl sm:tw-text-6xl tw-tracking-tighter">
                  Discover, Book, Adventure
                </div>
                <div className="tw-font-medium tw-text-xl tw-tracking-tight tw-mt-2">
                  Find a local guide to take you on the trip of a lifetime
                </div>
              </div>
              <SearchBar className="tw-mt-4" />
            </div>
          </div>
          <div className="tw-text-2xl tw-font-semibold tw-w-full tw-mb-2">Explore by Category</div>
          <FeaturedClient initialCategory={category} initialData={featured} />
          <BlogSection />
          <NeedHelpSection />
          <ExploreTrips />
        </div>
      </div>
      <Image src={Footer} sizes="100vw" alt="Footer image" quality={100} placeholder="blur" />
    </main>
  );
};

const BlogSection: React.FC = async () => {
  const posts: Post[] = await SanityClient.fetch(
    `
      *[_type == "post" && defined(slug.current)] | order(publishDate desc){
        _id,
        title,
        slug,
        metaDescription,
        "authorName": author->name,
        mainImage{
          ...,
          "metadata": asset->metadata,
        },
      }[0...3]
    `,
  );

  return <BlogSectionClient posts={posts} />;
};

const NeedHelpSection: React.FC = () => {
  return (
    <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-justify-start tw-w-full tw-min-h-[300px] tw-max-h-[300px] tw-h-[300px] sm:tw-min-h-[560px] sm:tw-h-[560px] sm:tw-max-h-[560px]">
      <div className="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-w-full">
        <Image
          fill
          alt="Need help?"
          quality={90}
          src={NeedHelp}
          sizes="90vw"
          placeholder="blur"
          className="tw-rounded-2xl tw-object-left tw-object-cover"
        />
      </div>
      <div className="tw-flex tw-flex-col tw-items-center tw-text-center tw-z-[1] tw-mt-16 sm:tw-mt-28 tw-text-white">
        <div className="tw-font-semibold tw-text-xl sm:tw-text-4xl tw-tracking-tighter">
          Need help finding the perfect trip?
        </div>
        <div className="tw-text-base sm:tw-text-lg tw-tracking-tight tw-mt-2">
          Talk to one of our adventure experts!
        </div>
        <Link
          className="tw-flex tw-justify-center tw-items-center tw-mt-4 tw-bg-black tw-text-white tw-w-48 tw-h-10 tw-rounded-lg tw-font-medium"
          href="https://calendly.com/coaster/adventure-expert-call"
        >
          Book a call
        </Link>
      </div>
    </div>
  );
};

const ExploreTrips: React.FC = () => {
  return (
    <>
      <div className="tw-text-3xl tw-font-semibold tw-mt-20 tw-mb-5">Ready to get out there?</div>
      <Link
        className="tw-flex tw-justify-center tw-items-center tw-bg-blue-950 tw-text-white tw-w-48 tw-h-10 tw-rounded-lg tw-font-medium -tw-mb-12"
        href="/search"
      >
        Explore trips
      </Link>
    </>
  );
};
