"use client";

import { Listing } from "@coaster/types";
import { useDebounce } from "@coaster/utils/client";
import { getGcsImageUrl, mergeClasses } from "@coaster/utils/common";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export const SearchResultImages: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const indicatorRefs = listing.images.map(() => useRef<HTMLDivElement>(null));

  const handleScroll = useDebounce(
    useCallback(() => {
      if (carouselRef.current) {
        const newIndex = Math.round(carouselRef.current.scrollLeft / width);
        setImageIndex(newIndex);
        indicatorRefs[newIndex].current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }, [width]),
    250,
  );

  const scrollForward = () => {
    const newIndex = (imageIndex + 1) % listing.images.length;
    setImageIndex(newIndex);
    indicatorRefs[newIndex].current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    carouselRef.current?.scrollTo({
      left: width * newIndex,
      behavior: "smooth",
    });
  };

  const scrollBack = () => {
    const newIndex = (imageIndex - 1) % listing.images.length;
    setImageIndex(newIndex);
    indicatorRefs[newIndex].current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    carouselRef.current?.scrollTo({
      left: width * newIndex,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.addEventListener("scroll", handleScroll, { passive: true });
      setWidth(carouselRef.current.clientWidth);
    }
    return () => {
      carouselRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [carouselRef, handleScroll]);

  return (
    <div className="tw-relative tw-group tw-select-none tw-w-full">
      <div className="tw-absolute tw-flex tw-h-full tw-w-full tw-justify-center tw-items-center tw-transition-all tw-duration-200 tw-pointer-events-none tw-z-[1]">
        <div className="tw-flex tw-items-center group-hover:tw-opacity-100 tw-opacity-0">
          <div className="tw-absolute tw-right-2 tw-pointer-events-auto">
            <ChevronRightIcon
              className="tw-h-8 tw-cursor-pointer tw-stroke-slate-800 tw-p-2 tw-bg-white tw-rounded-full tw-opacity-80 hover:tw-opacity-100 hover:tw-scale-105 tw-transition-all tw-duration-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollForward();
              }}
            />
          </div>
          <div className="tw-absolute tw-left-2 tw-pointer-events-auto">
            <ChevronLeftIcon
              className="tw-h-8 tw-cursor-pointer tw-stroke-slate-800 tw-p-2 tw-bg-white tw-rounded-full tw-opacity-80 hover:tw-opacity-100 hover:tw-scale-105 tw-transition-all tw-duration-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollBack();
              }}
            />
          </div>
        </div>
        <div className="tw-absolute tw-flex tw-gap-1 tw-bottom-2 sm:tw-bottom-1 tw-pointer-events-auto tw-opacity-100 tw-max-w-[100px] tw-overflow-auto tw-hide-scrollbar">
          {listing.images.map((_, idx) => (
            <div
              key={idx}
              ref={indicatorRefs[idx]}
              className={mergeClasses(
                "tw-text-2xl tw-text-white tw-opacity-50",
                idx === imageIndex && "tw-opacity-100",
              )}
            >
              •
            </div>
          ))}
        </div>
      </div>
      <div
        ref={carouselRef}
        className="tw-relative tw-flex tw-items-center tw-w-full tw-h-full tw-rounded-xl tw-aspect-square tw-overflow-x-auto tw-snap-mandatory tw-snap-x tw-hide-scrollbar tw-z-0"
      >
        {listing.images.map((image) => (
          <Image
            fill
            key={image.id}
            alt="Listing image"
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1280px) 33vw, 25vw"
            placeholder="data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4="
            tabIndex={-1}
            className="tw-flex-none !tw-static tw-object-cover tw-snap-center tw-snap-always tw-cursor-pointer"
            src={getGcsImageUrl(image.storage_id)}
          />
        ))}
      </div>
    </div>
  );
};
