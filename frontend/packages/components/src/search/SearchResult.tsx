"use client";

import { Listing } from "@coaster/types";
import { getDuration, getGcsImageUrl, mergeClasses } from "@coaster/utils/common";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

export const SearchResult: React.FC<{ listing: Listing; className?: string }> = ({ listing, className }) => {
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
      className={mergeClasses(
        "tw-flex tw-flex-col tw-w-full tw-text-base tw-font-medium tw-cursor-pointer tw-text-ellipsis",
        className,
      )}
      href={`/listings/${listing.id}`}
      target="_blank"
      rel="noreferrer"
    >
      {/*
        TODO: when adding wishlist functionality, uncomment this
        <div className="tw-absolute tw-right-3 tw-top-3 tw-justify-center tw-items-center tw-flex tw-w-6 tw-h-6">
          <HeartIcon className="tw-w-6  hover:tw-w-5 tw-transition-all tw-duration-100 tw-text-gray-600" />
        </div>
      */}
      <Image
        width={listing.images[0].width}
        height={listing.images[0].height}
        key={listing.images[0].id}
        alt="Listing image"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        placeholder="data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4="
        tabIndex={-1}
        className="tw-flex tw-rounded-xl tw-aspect-square tw-flex-none tw-object-cover tw-w-full"
        src={getGcsImageUrl(listing.images[0].storage_id)}
      />
      <span className="tw-mt-2 sm:tw-mt-3 tw-font-bold tw-text-lg">{listing.name}</span>
      <span>{listing.location}</span>
      <span>
        ${listing.price} • {getDuration(listing.duration_minutes)}
      </span>
    </Link>
  );
};
