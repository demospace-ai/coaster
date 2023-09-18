import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
      <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 2xl:tw-grid-cols-5 tw-mt-2 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10 tw-w-full">
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
      <ListingImages listing={listing} />
      <span className="tw-mt-5 tw-font-bold tw-text-lg">{listing.name}</span>
      <span>{listing.location}</span>
      <span>${listing.price}</span>
    </div>
  );
};

export const ListingImages: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [scrolledToIndex, setScrolledToIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (scrolledToIndex !== imageIndex) {
      setScrolledToIndex(imageIndex);
      carouselRef.current?.scrollTo({ left: width * imageIndex, behavior: "smooth" });
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
    carouselRef.current?.scrollTo({ left: width * newIndex, behavior: "smooth" });
  };

  const scrollBack = () => {
    const newIndex = (imageIndex - 1) % listing.images.length;
    setImageIndex(newIndex);
    setScrolledToIndex(newIndex);
    carouselRef.current?.scrollTo({ left: width * newIndex, behavior: "smooth" });
  };

  // Use effect to attach to the scrollend event rather than just every scroll
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.addEventListener("scrollend", handleScroll);
      setWidth(carouselRef.current.clientWidth);
    }
    return () => carouselRef.current?.removeEventListener("scrollend", handleScroll);
  }, [carouselRef, handleScroll]);

  return (
    <div className="tw-relative tw-group tw-select-none">
      <div className="tw-absolute tw-flex tw-pointer-events-none tw-h-full tw-w-full tw-items-center group-hover:tw-opacity-100 tw-opacity-0 tw-transition-all tw-duration-200">
        <div className="tw-absolute tw-right-2 tw-pointer-events-auto">
          <ChevronRightIcon
            className="tw-h-8 tw-cursor-pointer tw-stroke-slate-800 tw-p-2 tw-bg-white tw-rounded-full tw-opacity-90 hover:tw-opacity-100 hover:tw-scale-105 tw-transition-all tw-duration-100"
            onClick={(e) => {
              e.stopPropagation();
              scrollForward();
            }}
          />
        </div>
        <div className="tw-absolute tw-left-2 tw-pointer-events-auto">
          <ChevronLeftIcon
            className="tw-h-8 tw-cursor-pointer tw-stroke-slate-800 tw-p-2 tw-bg-white tw-rounded-full tw-opacity-90 hover:tw-opacity-100 hover:tw-scale-105 tw-transition-all tw-duration-100"
            onClick={(e) => {
              e.stopPropagation();
              scrollBack();
            }}
          />
        </div>
      </div>
      <div
        ref={carouselRef}
        className="tw-flex tw-items-center tw-w-full tw-h-full tw-rounded-xl tw-aspect-square tw-overflow-clip tw-overflow-x-auto tw-snap-mandatory tw-snap-x tw-hide-scrollbar"
      >
        {listing.images.map((image) => (
          <img
            key={image.id}
            tabIndex={-1}
            className="tw-flex-none tw-w-full tw-h-full tw-bg-gray-100 tw-object-cover tw-snap-center tw-snap-always tw-cursor-pointer"
            src={getGcsImageUrl(image)}
          />
        ))}
      </div>
    </div>
  );
};
