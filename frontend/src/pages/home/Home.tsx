import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React, { useRef, useState } from "react";
import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "src/components/icons/Category";
import Hero from "src/components/images/hero.webp";
import { Loading } from "src/components/loading/Loading";
import { SearchBar } from "src/components/search/SearchBar";
import { SearchResult } from "src/pages/search/Search";
import { useFeatured } from "src/rpc/data";
import { Listing } from "src/rpc/types";

export const Home: React.FC = () => {
  const { featured } = useFeatured();

  if (!featured) {
    return <Loading />;
  }

  return (
    <div className="tw-flex tw-bg-[#efedea] tw-w-full tw-h-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div
          className="tw-flex tw-flex-col tw-mb-6 sm:tw-mb-10 tw-mx-10 tw-w-full tw-h-[480px] tw-rounded-2xl tw-items-center tw-justify-center tw-bg-cover tw-p-8"
          style={{ backgroundImage: `url(${Hero})` }}
        >
          <div className="tw-text-white tw-w-full tw-max-w-[800px] tw-py-5 tw-rounded-2xl tw-text-center">
            <div className="tw-font-semibold tw-text-5xl sm:tw-text-6xl tw-tracking-tighter">
              Discover, Book, Adventure
            </div>
            <div className="tw-font-medium tw-text-xl tw-tracking-tight tw-mt-2">
              Find a local guide to take you on the trip of a lifetime
            </div>
          </div>
          <SearchBar className="tw-mt-4" />
        </div>
        <div className="tw-text-2xl tw-font-semibold tw-w-full tw-mb-2">Explore by Category</div>
        <CategorySelector />
        <div>
          <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-mt-1 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-5 sm:tw-gap-10 tw-w-full">
            {featured?.map((listing: Listing) => (
              <SearchResult key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategorySelector: React.FC = () => {
  const [showBack, setShowBack] = useState(false);
  const [showForward, setShowForward] = useState(true);
  const categorySelectorRef = useRef<HTMLDivElement>(null);
  const categoryIcon =
    "tw-flex tw-flex-col tw-justify-center tw-items-center tw-cursor-pointer tw-select-none tw-box-border tw-pb-2 tw-border-b-2 tw-border-solid tw-border-transparent hover:tw-border-slate-700";

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
      categorySelectorRef.current.scrollBy({ left: 200, top: 0, behavior: "smooth" });
    }
  };

  const scrollBack = () => {
    if (categorySelectorRef.current) {
      categorySelectorRef.current.scrollBy({ left: -200, top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="tw-relative tw-flex tw-w-full">
      <div className="tw-absolute tw-top-1/2 -tw-translate-y-1/2 tw-w-full tw-h-full tw-flex tw-items-center tw-pointer-events-none">
        <div
          className="tw-fixed tw-left-0 tw-pr-10 tw-flex tw-items-center tw-overflow-hidden tw-transition-opacity tw-pointer-events-auto"
          style={{
            opacity: showBack ? "100" : "0",
            height: showBack ? "100%" : "0",
            backgroundImage: "linear-gradient(to left, rgb(255 255 255/0), #efedea 40px)",
          }}
        >
          <button
            className="tw-p-1 tw-rounded-full tw-bg-white tw-border tw-border-solid tw-border-slate-300"
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
            backgroundImage: "linear-gradient(to right, rgb(255 255 255/0), #efedea 40px)",
          }}
        >
          <button
            className="tw-p-1 tw-rounded-full tw-bg-white tw-border tw-border-solid tw-border-slate-300"
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
          {getSearchableCategories().map((category) => (
            <div className={categoryIcon} key={category}>
              {getCategoryIcon(category)}
              <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">{getCategoryForDisplay(category)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
