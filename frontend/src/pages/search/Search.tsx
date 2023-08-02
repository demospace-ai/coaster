import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { SearchListings } from "src/rpc/api";
import { Listing } from "src/rpc/types";
import { HttpError, consumeError } from "src/utils/errors";

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
    <div className="tw-h-full tw-py-7 tw-mx-auto sm:tw-px-24 sm:tw-m-0">
      <div className="tw-flex tw-flex-col tw-mt-8 tw-mb-5 tw-justify-end tw-font-bold tw-text-3xl">
        {results.map((listing: Listing) => (
          <div
            className="tw-relative tw-flex tw-flex-col tw-text-base tw-font-medium tw-w-64 tw-max-w-[256px] tw-cursor-pointer tw-text-ellipsis"
            onClick={() => navigate(`/listings/${listing.id}`)}
          >
            {/* TODO: when adding wishlist functionality, uncomment this
            <div className="tw-absolute tw-right-3 tw-top-3 tw-justify-center tw-items-center tw-flex tw-w-6 tw-h-6">
              <HeartIcon className="tw-w-6  hover:tw-w-5 tw-transition-all tw-duration-100 tw-text-gray-600" />
            </div> */}
            <img className="tw-rounded-xl tw-overflow-clip tw-bg-gray-100 tw-h-64 tw-mb-5" />
            <span className="tw-font-bold tw-text-lg">{listing.name}</span>
            <span>{listing.location}</span>
            <span>${listing.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
