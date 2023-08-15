import React from "react";
import {
  CampingIcon,
  ClimbingIcon,
  CyclingIcon,
  DivingIcon,
  FishingIcon,
  HikingIcon,
  KayakIcon,
  SkiingIcon,
  SnowmobileIcon,
  SurfingIcon,
  YogaIcon,
} from "src/components/icons/Icons";
import { Loading } from "src/components/loading/Loading";
import { SearchResult } from "src/pages/search/Search";
import { useFeatured } from "src/rpc/data";
import { Listing } from "src/rpc/types";

export const Home: React.FC = () => {
  const { featured } = useFeatured();

  if (!featured) {
    return <Loading />;
  }

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-pt-1 sm:tw-pt-5 tw-pb-24 tw-px-5 sm:tw-px-20">
      <CategorySelector />
      <div>
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 2xl:tw-grid-cols-5 tw-mt-4 sm:tw-mt-8 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10">
          {featured.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const CategorySelector: React.FC = () => {
  const categoryIcon =
    "tw-flex tw-flex-col tw-items-center tw-p-2 tw-h-20 tw-w-20 tw-rounded-xl tw-cursor-pointer tw-select-none hover:tw-shadow-centered tw-mx-1";

  return (
    <div className="tw-flex tw-w-full tw-overflow-scroll tw-py-3 sm:tw-py-5 xl:tw-px-48">
      <div className="tw-flex tw-h-full tw-flex-1 tw-gap-3 tw-justify-between">
        <div className={categoryIcon}>
          <SkiingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Skiing</span>
        </div>
        <div className={categoryIcon}>
          <SurfingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Surfing</span>
        </div>
        <div className={categoryIcon}>
          <FishingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Fishing</span>
        </div>
        <div className={categoryIcon}>
          <HikingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Hiking</span>
        </div>
        <div className={categoryIcon}>
          <CampingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Camping</span>
        </div>
        <div className={categoryIcon}>
          <CyclingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Cycling</span>
        </div>
        <div className={categoryIcon}>
          <DivingIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Diving</span>
        </div>
        <div className={categoryIcon}>
          <ClimbingIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Climbing</span>
        </div>
        <div className={categoryIcon}>
          <YogaIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Yoga</span>
        </div>
        <div className={categoryIcon}>
          <KayakIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Kayak</span>
        </div>
        <div className={categoryIcon}>
          <SnowmobileIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Snowmobile</span>
        </div>
      </div>
    </div>
  );
};
