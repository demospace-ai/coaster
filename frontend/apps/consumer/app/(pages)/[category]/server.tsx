import Hero from "@coaster/assets/hero.jpg";
import { SearchBar } from "@coaster/components/search/SearchBar";
import { getFeaturedServer } from "@coaster/rpc/server";
import { FeaturedClient } from "app/(pages)/[category]/client";
import { FeaturedCategory } from "app/(pages)/[category]/utils";
import Image from "next/image";

export const FeaturedPage = async ({ category }: { category?: FeaturedCategory }) => {
  const featured = await getFeaturedServer();

  return (
    <main className="tw-flex tw-bg-[#efedea] tw-w-full tw-h-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-relative tw-flex tw-flex-col tw-mb-6 sm:tw-mb-10 tw-mx-10 tw-w-full tw-min-h-[420px] tw-h-[420px] tw-max-h-[420px] sm:tw-min-h-[480px] sm:tw-h-[480px] sm:tw-max-h-[480px] tw-rounded-2xl tw-items-center tw-justify-center tw-bg-cover tw-p-8">
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
      </div>
    </main>
  );
};
