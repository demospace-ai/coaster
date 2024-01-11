"use client";

import { Listing } from "@coaster/types";
import { getDuration, mergeClasses } from "@coaster/utils/common";
import Image from "next/image";
import Link from "next/link";

export const SearchResult: React.FC<{ listing: Listing; className?: string }> = ({ listing, className }) => {
  const numDays = listing.duration_minutes ? Math.ceil(listing.duration_minutes / 60 / 24) : 1;

  return (
    <Link
      className={mergeClasses(
        "tw-flex tw-w-full tw-cursor-pointer tw-flex-col tw-text-ellipsis tw-text-base tw-font-medium",
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
      <div className="tw-flex tw-aspect-square tw-overflow-hidden tw-rounded-xl">
        <Image
          width={listing.images[0].width}
          height={listing.images[0].height}
          alt="Listing image"
          sizes="(max-width: 400px) 75vw, (max-width: 640px) 30vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1536px) 18vw, (max-width: 2000px) 15vw, 12vw"
          placeholder="data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4="
          tabIndex={-1}
          className="tw-h-full tw-w-full tw-object-cover tw-transition-all tw-duration-200 tw-ease-in-out hover:tw-scale-105"
          src={listing.images[0].url}
        />
      </div>
      <span className="tw-mt-2 tw-text-lg tw-font-bold sm:tw-mt-3">{listing.name}</span>
      <span>{listing.location}</span>
      <span>
        ${listing.price ? Math.floor(listing.price / numDays) : "TBD"}
        {numDays > 1 ? "/day " : " "}• {getDuration(listing.duration_minutes)}
      </span>
    </Link>
  );
};
