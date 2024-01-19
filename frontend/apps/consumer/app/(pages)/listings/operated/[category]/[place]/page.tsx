import {
  getDescriptionForCategory,
  getImagesForGeneratedListing,
} from "@coaster/components/generated/GeneratedListings";
import { getCategoryForDisplay } from "@coaster/components/icons/Category";
import { GeneratedCategoryType, ListingStatus, Listing as ListingType } from "@coaster/types";
import { isProd } from "@coaster/utils/common";
import { ListingPage } from "consumer/app/(pages)/listings/[listingID]/server";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: { category: GeneratedCategoryType; place: string } }) {
  const title = getCategoryForDisplay(params.category) + " Experience by Coaster";
  return {
    title,
    metadataBase: isProd() ? "https://trycoaster.com" : "http://localhost:3000",
    openGraph: {
      title,
    },
    twitter: {
      card: "summary_large_image",
      title,
    },
  };
}

export default async function GeneratedListing({
  params,
}: {
  params: { category: GeneratedCategoryType; place: string };
}) {
  const title = getCategoryForDisplay(params.category) + " Experience by Coaster";
  const listing: ListingType = {
    id: 1,
    name: title,
    description: getDescriptionForCategory(params.category),
    categories: [params.category],
    location: decodeURIComponent(params.place),
    price: 100,
    duration_minutes: 120,
    includes: [],
    not_included: [],
    host: {
      id: 1,
      first_name: "Coaster",
      last_name: "",
      profile_picture_url: "https://www.trycoaster.com/icon.png",
      about:
        "Coaster is on a mission to make outdoor adventures more accessible. We&apos;re accomplishing this goal by delivering top-tier programs that adhere to the highest safety and quality standards that are fully planned and led by experienced guides.",
      email: "trips@trycoaster.com",
    },
    images: getImagesForGeneratedListing(params.category),
    status: ListingStatus.Published,
    availability_type: "datetime",
    availability_display: "calendar",
    short_description: undefined,
    coordinates: undefined,
    cancellation: undefined,
    max_guests: undefined,
    highlights: undefined,
    languages: undefined,
    itinerary_steps: undefined,
  };

  return (
    <main className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-pt-5 sm:tw-pt-12 tw-pb-32 tw-text-base tw-w-full tw-max-w-7xl">
        <ListingPage listing={listing} generated />
      </div>
    </main>
  );
}
