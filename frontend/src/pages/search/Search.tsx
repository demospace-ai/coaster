import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useSearch } from "src/rpc/data";
import { Listing } from "src/rpc/types";
import { getGcsImageUrl } from "src/utils/images";
import { toUndefined } from "src/utils/undefined";

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");
  const { listings } = useSearch(toUndefined(location));

  if (!listings) {
    return <Loading />;
  }

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-px-5 sm:tw-px-24 ">
      <div className="tw-font-bold tw-text-xl tw-w-full tw-text-center sm:tw-text-left">
        {listings.length} results for {location}
      </div>
      <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 2xl:tw-grid-cols-5 tw-mt-1 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10">
        {listings.map((listing: Listing) => (
          <SearchResult key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export const SearchResult: React.FC<{ listing: Listing }> = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <div
      className="tw-flex tw-flex-col tw-text-base tw-font-medium tw-cursor-pointer tw-text-ellipsis"
      onClick={() => navigate(`/listings/${listing.id}`)}
    >
      {/* TODO: when adding wishlist functionality, uncomment this
            <div className="tw-absolute tw-right-3 tw-top-3 tw-justify-center tw-items-center tw-flex tw-w-6 tw-h-6">
              <HeartIcon className="tw-w-6  hover:tw-w-5 tw-transition-all tw-duration-100 tw-text-gray-600" />
            </div> */}
      <div className="tw-flex tw-rounded-xl tw-overflow-clip tw-aspect-square tw-mb-5">
        <img
          className="tw-bg-gray-100 tw-object-cover tw-aspect-square hover:tw-scale-105 tw-transition-all tw-duration-200"
          src={listing.images.length > 0 ? getGcsImageUrl(listing.images[0]) : "TODO"}
        />
      </div>
      <span className="tw-font-bold tw-text-lg">{listing.name}</span>
      <span>{listing.location}</span>
      <span>${listing.price}</span>
    </div>
  );
};
