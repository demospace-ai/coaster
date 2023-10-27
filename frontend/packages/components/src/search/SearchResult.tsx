"use client";

import { Listing } from "@coaster/types";
import { getGcsImageUrl } from "@coaster/utils/common";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export const SearchResult: React.FC<{ listing: Listing }> = ({ listing }) => {
  return (
    <Link
      className="tw-flex tw-flex-col tw-text-base tw-font-medium tw-cursor-pointer tw-text-ellipsis"
      href={`/listings/${listing.id}`}
    >
      {/* TODO: when adding wishlist functionality, uncomment this
            <div className="tw-absolute tw-right-3 tw-top-3 tw-justify-center tw-items-center tw-flex tw-w-6 tw-h-6">
              <HeartIcon className="tw-w-6  hover:tw-w-5 tw-transition-all tw-duration-100 tw-text-gray-600" />
            </div> */}
      <SearchListingImages listing={listing} />
      <span className="tw-mt-2 sm:tw-mt-3 tw-font-bold tw-text-lg">{listing.name}</span>
      <span>{listing.location}</span>
      <span>${listing.price}</span>
    </Link>
  );
};

const SearchListingImages: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [scrolledToIndex, setScrolledToIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (scrolledToIndex !== imageIndex) {
      setScrolledToIndex(imageIndex);
      carouselRef.current?.scrollTo({
        left: width * imageIndex,
        behavior: "smooth",
      });
    }
  }, [imageIndex]);

  const handleScroll = useCallback(() => {
    if (carouselRef.current) {
      const newIndex = Math.round(carouselRef.current.scrollLeft / width);
      setImageIndex(newIndex);
      setScrolledToIndex(newIndex);
    }
  }, [width]);

  const scrollForward = () => {
    const newIndex = (imageIndex + 1) % listing.images.length;
    setImageIndex(newIndex);
    setScrolledToIndex(newIndex);
    carouselRef.current?.scrollTo({
      left: width * newIndex,
      behavior: "smooth",
    });
  };

  const scrollBack = () => {
    const newIndex = (imageIndex - 1) % listing.images.length;
    setImageIndex(newIndex);
    setScrolledToIndex(newIndex);
    carouselRef.current?.scrollTo({
      left: width * newIndex,
      behavior: "smooth",
    });
  };

  // Use effect to attach to the scrollend event rather than just every scroll
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.addEventListener("scrollend", handleScroll, { passive: true });
      carouselRef.current.addEventListener("touchend", handleScroll, { passive: true });
      setWidth(carouselRef.current.clientWidth);
    }
    return () => {
      carouselRef.current?.removeEventListener("scrollend", handleScroll);
      carouselRef.current?.removeEventListener("touchend", handleScroll);
    };
  }, [carouselRef, handleScroll]);

  return (
    <div className="tw-relative tw-group tw-select-none">
      <div className="tw-absolute tw-flex tw-h-full tw-w-full tw-items-center group-hover:tw-opacity-100 tw-opacity-0 tw-transition-all tw-duration-200 tw-pointer-events-none">
        <div className="tw-absolute tw-right-2 tw-pointer-events-auto">
          <ChevronRightIcon
            className="tw-h-8 tw-cursor-pointer tw-stroke-slate-800 tw-p-2 tw-bg-white tw-rounded-full tw-opacity-90 hover:tw-opacity-100 hover:tw-scale-105 tw-transition-all tw-duration-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollForward();
            }}
          />
        </div>
        <div className="tw-absolute tw-left-2 tw-pointer-events-auto">
          <ChevronLeftIcon
            className="tw-h-8 tw-cursor-pointer tw-stroke-slate-800 tw-p-2 tw-bg-white tw-rounded-full tw-opacity-90 hover:tw-opacity-100 hover:tw-scale-105 tw-transition-all tw-duration-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollBack();
            }}
          />
        </div>
      </div>
      <div
        ref={carouselRef}
        className="tw-flex tw-items-center tw-w-full tw-h-full tw-rounded-xl tw-aspect-square tw-overflow-x-auto tw-snap-mandatory tw-snap-x tw-hide-scrollbar"
      >
        {listing.images.map((image) => (
          <img
            key={image.id}
            alt="Listing image"
            tabIndex={-1}
            className="tw-flex-none tw-w-full tw-h-full tw-bg-gray-100 tw-object-cover tw-snap-center tw-snap-always tw-cursor-pointer"
            src={getGcsImageUrl(image.storage_id)}
          />
        ))}
      </div>
    </div>
  );
};
