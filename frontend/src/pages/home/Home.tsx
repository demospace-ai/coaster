import React from "react";
import { Loading } from "src/components/loading/Loading";
import { SearchResult } from "src/pages/search/Search";
import { useFeatured } from "src/rpc/data";
import { Listing } from "src/rpc/types";

export const Home: React.FC = () => {
  const { featured } = useFeatured();

  if (!featured) {
    return <Loading />;
  }

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-h-full tw-pt-8 tw-pb-24 tw-px-5 sm:tw-px-24 tw-overflow-scroll">
      <div>
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-mt-8 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10">
          {featured.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
};
