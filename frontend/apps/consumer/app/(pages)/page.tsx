import { Hero } from "@coaster/assets";
import { SearchBar } from "@coaster/components/search/SearchBar";
import { getFeaturedServer } from "@coaster/rpc/server";
import { Featured } from "consumer/app/(pages)/client";
import Image from "next/image";

export const dynamic = "force-static";

export const metadata = {
  themeColor: "#efedea",
};

export default async function Page() {
  const featured = await getFeaturedServer();

  return (
    <main className="tw-flex tw-bg-[#efedea] tw-w-full tw-h-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-relative tw-flex tw-flex-col tw-mb-6 sm:tw-mb-10 tw-mx-10 tw-w-full tw-min-h-[420px] tw-h-[420px] tw-max-h-[420px] sm:tw-min-h-[480px] sm:tw-h-[480px] sm:tw-max-h-[480px] tw-rounded-2xl tw-items-center tw-justify-center tw-bg-cover tw-p-8">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-w-full">
            <Image
              fill
              alt=""
              priority
              src={Hero.src}
              sizes="100vw"
              blurDataURL="data:image/webp;base64,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"
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
        <Featured initialData={featured} />
      </div>
    </main>
  );
}
