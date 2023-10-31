"use client";

import { Listing } from "@coaster/types";
import dynamic from "next/dynamic";
import Link from "next/link";

export const SearchResult: React.FC<{ listing: Listing }> = ({ listing }) => {
  const SearchResultImages = dynamic(() => import("./SearchResultImages").then((mod) => mod.SearchResultImages), {
    loading: () => (
      <div
        className="tw-w-full tw-h-full tw-aspect-square tw-rounded-xl"
        style={{
          backgroundImage:
            "url(data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4=)",
        }}
      />
    ),
  });

  return (
    <Link
      className="tw-flex tw-flex-col tw-w-full tw-aspect-square tw-text-base tw-font-medium tw-cursor-pointer tw-text-ellipsis"
      href={`/listings/${listing.id}`}
      target="_blank"
      rel="noreferrer"
    >
      {/* TODO: when adding wishlist functionality, uncomment this
            <div className="tw-absolute tw-right-3 tw-top-3 tw-justify-center tw-items-center tw-flex tw-w-6 tw-h-6">
              <HeartIcon className="tw-w-6  hover:tw-w-5 tw-transition-all tw-duration-100 tw-text-gray-600" />
            </div> */}
      <SearchResultImages listing={listing} />
      <span className="tw-mt-2 sm:tw-mt-3 tw-font-bold tw-text-lg">{listing.name}</span>
      <span>{listing.location}</span>
      <span>${listing.price}</span>
    </Link>
  );
};
