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
    <div className="tw-group tw-relative tw-w-full tw-select-none tw-overscroll-contain">
      <div className="tw-pointer-events-none tw-absolute tw-z-[1] tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-transition-all tw-duration-200">
        <div className="tw-flex tw-items-center tw-opacity-0 group-hover:tw-opacity-100">
          <div className="tw-pointer-events-auto tw-absolute tw-right-2">
            <ChevronRightIcon
              className="tw-h-8 tw-cursor-pointer tw-rounded-full tw-bg-white tw-stroke-slate-800 tw-p-2 tw-opacity-80 tw-transition-all tw-duration-100 hover:tw-scale-105 hover:tw-opacity-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollForward();
              }}
            />
          </div>
          <div className="tw-pointer-events-auto tw-absolute tw-left-2">
            <ChevronLeftIcon
              className="tw-h-8 tw-cursor-pointer tw-rounded-full tw-bg-white tw-stroke-slate-800 tw-p-2 tw-opacity-80 tw-transition-all tw-duration-100 hover:tw-scale-105 hover:tw-opacity-100"
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
          className="tw-hide-scrollbar tw-pointer-events-auto tw-absolute tw-bottom-2 tw-flex tw-max-w-[100px] tw-gap-1 tw-overflow-auto tw-opacity-100 sm:tw-bottom-1"
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
        className="tw-hide-scrollbar tw-relative tw-z-0 tw-flex tw-aspect-square tw-h-full tw-w-full tw-snap-x tw-snap-mandatory tw-items-center tw-overflow-x-auto tw-rounded-xl"
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
            className="tw-h-full tw-w-full tw-flex-none tw-cursor-pointer tw-snap-center tw-snap-always tw-object-cover"
            src={image.url}
          />
        ))}
      </div>
    </div>
  );
};
