"use client";

import { Loading, SearchResult, getCategoryForDisplay } from "@coaster/components/client";
import type { CategoryType, Listing } from "@coaster/rpc";
import { useSearch } from "@coaster/rpc";
import { toUndefined } from "@coaster/utils";
import { useSearchParams } from "next/navigation";

export default function Search(): JSX.Element {
  const searchParams = useSearchParams();
  const location = searchParams.get("location");
  const categories = searchParams.get("categories");
  const { listings } = useSearch(toUndefined(location), toUndefined(categories));

  if (!listings) {
    return <Loading />;
  }

  let categoriesParsed: CategoryType[] = [];
  if (categories) {
    categoriesParsed = JSON.parse(categories) as CategoryType[];
  }

  return (
    <div className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-font-bold tw-text-xl tw-w-full tw-text-center sm:tw-text-left">
          {listings.length} results for{" "}
          {categoriesParsed.map((category: CategoryType) => `"${getCategoryForDisplay(category)}"`).join(", ")}
        </div>
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-mt-5 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10 tw-w-full">
          {listings.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}
