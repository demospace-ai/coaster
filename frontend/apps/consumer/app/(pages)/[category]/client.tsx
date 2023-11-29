"use client";

import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "@coaster/components/icons/Category";
import { SearchResult } from "@coaster/components/search/SearchResult";
import { useFeatured } from "@coaster/rpc/client";
import { Listing } from "@coaster/types";
import { useIsMobile } from "@coaster/utils/client";
import { mergeClasses } from "@coaster/utils/common";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, SunIcon } from "@heroicons/react/24/outline";
import { FeaturedCategory } from "app/(pages)/[category]/utils";
import { Dispatch, SetStateAction, useRef, useState } from "react";

export const FeaturedClient: React.FC<{ initialCategory: FeaturedCategory; initialData: Listing[] }> = ({
  initialCategory,
  initialData,
}) => {
  const [category, setCategory] = useState<FeaturedCategory>(initialCategory);
  const categories = category ? (category === "daytrips" ? undefined : `["${category}"]`) : undefined;
  const { listings } = useFeatured(categories, category === "daytrips" ? 1440 : undefined, initialData);

  return (
    <div className="tw-min-h-screen tw-w-full">
      <CategorySelector selected={category} setSelected={setCategory} />
      <div className="tw-w-full">
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-mt-1 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-5 sm:tw-gap-10 tw-w-full">
          {listings ? (
            <>{listings?.map((listing: Listing) => <SearchResult key={listing.id} listing={listing} />)}</>
          ) : (
            <>
              {[1, 2, 3, 4].map((idx) => (
                <LoadingListing key={idx} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingListing: React.FC = () => {
  return (
    <div
      className="tw-flex tw-w-full tw-h-full tw-aspect-square tw-rounded-xl"
      style={{
        backgroundImage:
          "url(data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4=)",
      }}
    />
  );
};

const CategorySelector: React.FC<{
  selected: FeaturedCategory;
  setSelected: Dispatch<SetStateAction<FeaturedCategory>>;
}> = ({ selected, setSelected }) => {
  const isMobile = useIsMobile();
  const [showBack, setShowBack] = useState(false);
  const [showForward, setShowForward] = useState(true);
  const categorySelectorRef = useRef<HTMLDivElement>(null);
  const categoryIcon =
    "tw-flex tw-flex-col tw-justify-center tw-items-center tw-cursor-pointer tw-select-none tw-box-border tw-pb-2 tw-border-b-2 tw-border-solid tw-border-transparent hover:tw-border-slate-400";

  const setScroll = () => {
    if (categorySelectorRef.current) {
      setShowBack(categorySelectorRef.current.scrollLeft >= 20);
      setShowForward(
        categorySelectorRef.current.scrollWidth - categorySelectorRef.current.scrollLeft - 20 >=
          categorySelectorRef.current.clientWidth,
      );
    }
  };

  const scrollForward = () => {
    if (categorySelectorRef.current) {
      categorySelectorRef.current.scrollBy({
        left: 200,
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollBack = () => {
    if (categorySelectorRef.current) {
      categorySelectorRef.current.scrollBy({
        left: -200,
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollIntoView = () => {
    const headerOffset = isMobile ? 125 : 160;
    const elementPosition = categorySelectorRef.current?.getBoundingClientRect().top || 0;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  return (
    <div className="tw-relative tw-flex tw-w-full">
      <div className="tw-absolute tw-top-1/2 -tw-translate-y-1/2 tw-w-full tw-h-full tw-flex tw-items-center tw-pointer-events-none">
        <div
          className="tw-fixed tw-left-0 tw-pr-10 tw-flex tw-items-center tw-overflow-hidden tw-transition-opacity tw-pointer-events-auto"
          style={{
            opacity: showBack ? "100" : "0",
            height: showBack ? "100%" : "0",
            backgroundImage: "linear-gradient(to left, rgb(255 255 255/0), rgb(255 255 255) 40px)",
          }}
        >
          <button
            className="tw-p-1 tw-rounded-full tw-bg-white tw-border tw-border-solid tw-border-slate-300"
            aria-label="Scroll category back"
            onClick={(e) => {
              e.stopPropagation();
              scrollBack();
            }}
          >
            <ChevronLeftIcon className="tw-h-5 tw-cursor-pointer tw-stroke-slate-500" />
          </button>
        </div>
        <div
          className="tw-fixed tw-right-0 tw-pl-10 tw-flex tw-items-center tw-overflow-hidden tw-transition-opacity tw-duration-100 tw-pointer-events-auto"
          style={{
            opacity: showForward ? "100" : "0",
            height: showForward ? "100%" : "0",
            backgroundImage: "linear-gradient(to right, rgb(255 255 255/0), rgb(255 255 255) 40px)",
          }}
        >
          <button
            className="tw-p-1 tw-rounded-full tw-bg-white tw-border tw-border-solid tw-border-slate-300"
            aria-label="Scroll category forward"
            onClick={(e) => {
              e.stopPropagation();
              scrollForward();
            }}
          >
            <ChevronRightIcon className="tw-h-5 tw-cursor-pointer tw-stroke-slate-500" />
          </button>
        </div>
      </div>
      <div
        ref={categorySelectorRef}
        className="tw-flex tw-w-full tw-overflow-auto tw-mt-2 tw-hide-scrollbar tw-mb-2 sm:tw-mb-0"
        onScroll={setScroll}
      >
        <div className="tw-flex tw-h-full tw-flex-1 tw-gap-12 tw-px-2 tw-justify-between tw-pr-10">
          <div
            className={mergeClasses(
              categoryIcon,
              selected === undefined && "tw-border-slate-900 hover:tw-border-slate-900",
            )}
            key="featured"
            aria-label="Featured"
            onClick={() => {
              setSelected(undefined);
              scrollIntoView();
            }}
          >
            <StarIcon className="tw-w-10 tw-h-10 tw-stroke-1" />
            <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Featured</span>
          </div>
          <div
            className={mergeClasses(
              categoryIcon,
              selected === "daytrips" && "tw-border-slate-900 hover:tw-border-slate-900",
            )}
            key="day-trips"
            aria-label="Day Trips"
            onClick={() => {
              setSelected("daytrips");
              scrollIntoView();
            }}
          >
            <SunIcon className="tw-w-11 tw-h-11 -tw-m-1 tw-stroke-1" />
            <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2 tw-whitespace-nowrap">Day Trips</span>
          </div>
          {getSearchableCategories().map((category) => (
            <div
              className={mergeClasses(
                categoryIcon,
                category === selected && "tw-border-slate-900 hover:tw-border-slate-900",
              )}
              key={category}
              aria-label={getCategoryForDisplay(category)}
              onClick={() => {
                setSelected(category);
                scrollIntoView();
              }}
            >
              {getCategoryIcon(category)}
              <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2 tw-px-0.5">
                {getCategoryForDisplay(category)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
