"use client";

import { Listing } from "@coaster/types";
import { useDebounce } from "@coaster/utils/client";
import { mergeClasses } from "@coaster/utils/common";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export const SearchResultImages: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const indicatorContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useDebounce(
    useCallback(() => {
      if (carouselRef.current) {
        const newIndex = Math.round(carouselRef.current.scrollLeft / width);
        setImageIndex(newIndex);
        indicatorContainerRef.current?.scrollTo({ left: 2 * newIndex, behavior: "smooth" });
      }
    }, [width]),
    250,
  );

  const scrollForward = () => {
    const newIndex = (imageIndex + 1) % listing.images.length;
    setImageIndex(newIndex);
    indicatorContainerRef.current?.scrollTo({ left: 2 * newIndex, behavior: "smooth" });
    carouselRef.current?.scrollTo({
      left: width * newIndex,
      behavior: "smooth",
    });
  };

  const scrollBack = () => {
    const newIndex = Math.max(imageIndex - 1, 0);
    setImageIndex(newIndex);
    indicatorContainerRef.current?.scrollTo({ left: 2 * newIndex, behavior: "smooth" });
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
    <div className="tw-relative tw-group tw-select-none tw-w-full tw-overscroll-contain">
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
        <div
          ref={indicatorContainerRef}
          className="tw-absolute tw-flex tw-gap-1 tw-bottom-2 sm:tw-bottom-1 tw-pointer-events-auto tw-opacity-100 tw-max-w-[100px] tw-overflow-auto tw-hide-scrollbar"
        >
          {listing.images.map((_, idx) => (
            <div
              key={idx}
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
            width={image.width}
            height={image.height}
            key={image.id}
            alt="Listing image"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            placeholder="data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4="
            tabIndex={-1}
            className="tw-flex-none tw-object-cover tw-snap-center tw-snap-always tw-cursor-pointer tw-w-full tw-h-full"
            src={image.url}
          />
        ))}
      </div>
    </div>
  );
};
