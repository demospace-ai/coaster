import { Hero } from "@coaster/assets";
import { SearchBar } from "@coaster/components/client";
import { getFeaturedServer } from "@coaster/rpc/server";
import { Featured } from "consumer/app/(pages)/client";
import Image from "next/image";

export default async function Page() {
  const featured = await getFeaturedServer();

  return (
    <div className="tw-flex tw-bg-[#efedea] tw-w-full tw-h-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-relative tw-flex tw-flex-col tw-mb-6 sm:tw-mb-10 tw-mx-10 tw-w-full tw-h-[480px] tw-rounded-2xl tw-items-center tw-justify-center tw-bg-cover tw-p-8 tw-z-0">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-w-full -tw-z-10">
            <Image fill priority src={Hero.src} alt="" className="tw-rounded-2xl tw-object-left tw-object-cover" />
          </div>
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
        <div className="tw-text-2xl tw-font-semibold tw-w-full tw-mb-2">Explore by Category</div>
        <Featured initialData={featured} />
      </div>
    </div>
  );
}
