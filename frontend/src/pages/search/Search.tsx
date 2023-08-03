import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { SearchListings } from "src/rpc/api";
import { Listing } from "src/rpc/types";
import { HttpError, consumeError } from "src/utils/errors";
import { getGcsImageUrl } from "src/utils/images";

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<Listing[]>([]);

  const search = async (location: string) => {
    try {
      const response = await sendRequest(SearchListings, { location });
      setResults(response.listings);
      setLoading(false);
    } catch (e) {
      if (e instanceof HttpError) {
        const errorMessage = e.message;
      }
      consumeError(e);
    }
  };

  useEffect(() => {
    const location = searchParams.get("location");
    if (location) {
      search(location);
    }
  }, [searchParams]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="tw-h-full tw-py-2 tw-px-5 tw-mx-auto sm:tw-pt-5 tw-pb-24 sm:tw-px-24 sm:tw-m-0 tw-overflow-scroll">
      <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-mt-8 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10">
        {results.map((listing: Listing) => (
          <SearchResult key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

const SearchResult: React.FC<{ listing: Listing }> = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <div
      className="tw-flex tw-flex-col tw-text-base tw-font-medium tw-cursor-pointer tw-text-ellipsis tw-max-w-[320px]"
      onClick={() => navigate(`/listings/${listing.id}`)}
    >
      {/* TODO: when adding wishlist functionality, uncomment this
            <div className="tw-absolute tw-right-3 tw-top-3 tw-justify-center tw-items-center tw-flex tw-w-6 tw-h-6">
              <HeartIcon className="tw-w-6  hover:tw-w-5 tw-transition-all tw-duration-100 tw-text-gray-600" />
            </div> */}
      <img
        className="tw-rounded-xl tw-overflow-clip tw-bg-gray-100 tw-mb-5 tw-object-cover tw-aspect-square"
        src={listing.images.length > 0 ? getGcsImageUrl(listing.images[0]) : "TODO"}
      />
      <span className="tw-font-bold tw-text-lg">{listing.name}</span>
      <span>{listing.location}</span>
      <span>${listing.price}</span>
    </div>
  );
};
