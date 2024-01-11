import { getCategoryForDisplay } from "@coaster/components/icons/Category";
import { SearchResult } from "@coaster/components/search/SearchResult";
import { search } from "@coaster/rpc/server";
import { Category, CategoryType, Listing } from "@coaster/types";
import { CustomResult } from "app/(pages)/search/client";

export default async function Page({ params }: { params: { activity: string } }) {
  const listings = await search({ categories: `["${params.activity}"]` });
  const activityType: CategoryType = Category.Enum[params.activity as CategoryType];

  return (
    <div className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-start tw-pb-24 tw-pt-5 sm:tw-pt-8">
        <div className="tw-mb-3 tw-w-full tw-text-center tw-text-4xl tw-font-bold sm:tw-text-left">
          {getCategoryForDisplay(activityType)}
        </div>
        <div className="tw-mb-5 tw-max-w-2xl tw-text-base">{getDescriptionForCategory(activityType)}</div>
        <div className="tw-mb-5 tw-mt-5 tw-grid tw-w-full tw-grid-flow-row-dense tw-grid-cols-1 tw-gap-10 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4">
          {listings.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
          <CustomResult />
        </div>
      </div>
    </div>
  );
}

function getDescriptionForCategory(activityType: CategoryType) {
  switch (activityType) {
    case Category.Enum.boating:
      return "Discover the thrill and tranquility of being out on the water with our selection of boat tours. Each trip is a blend of adventure and serenity, exploring breathtaking routes and connecting with nature in a profound way.";
    case Category.Enum.camping:
      return "Experience the great outdoors with our selection of camping trips. Each trip is a blend of adventure and serenity, exploring breathtaking routes and connecting with nature in a profound way.";
    case Category.Enum.cycling:
      return "Embrace the freedom of the open road with our guided cycling tours. Traverse breathtaking landscapes, conquer challenging climbs, and enjoy locally recommended pastries and coffee.";
    case Category.Enum.flyfishing:
    case Category.Enum.fishing:
      return "Immerse yourself in the peaceful art of angling with our guided fishing excursions. Connect with nature and unwind as you seek out this year's big catch in serene locales.";
    case Category.Enum.hiking:
      return "Embrace the great outdoors with our guided hiking tours. You'll explore winding paths and scenic landscapes, from rugged mountain paths to serene forest trails, each step a journey of discovery and connection.";
    case Category.Enum.diving:
      return "Explore the depths of the ocean with our guided diving tours. Experience the exhilaration of underwater exploration, from serene coral reefs to mysterious shipwrecks.";
    case Category.Enum.skiing:
      return "Venture into pristine winter wonderlands with our guided skiing excursions. From powdery slopes to off-piste adventures, enjoy the thrill of carving through fresh snow and exploring untouched terrains.";
    case Category.Enum.surfing:
      return "Surf empty waves with the help of respected local guides. We've hand-selected trips that offer idyllic lodging and expert guides who know the right break for every condition.";
    default:
      "Explore our selection of curated experiences, hand-picked to provide unforgettable memories.";
  }
}
