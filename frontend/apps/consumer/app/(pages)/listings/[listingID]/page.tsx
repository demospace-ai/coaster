import { getListingServer } from "@coaster/rpc/server";
import { ListingPage } from "consumer/app/(pages)/listings/[listingID]/server";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  return {
    title: listing ? listing.name : "Coaster - Find your next adventure",
    description: listing ? listing.short_description : "",
    openGraph: {
      title: listing ? listing.name : "Coaster - Find your next adventure",
    },
    twitter: {
      card: "summary_large_image",
      title: listing ? listing.name : "Coaster - Find your next adventure",
      description: listing ? listing.short_description : "",
    },
  };
}

export default async function Listing({ params }: { params: { listingID: string } }) {
  const listingID = Number(params.listingID);
  const listing = await getListingServer(listingID);
  if (!listing) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <main className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-pt-5 sm:tw-pt-12 tw-pb-10 sm:tw-pb-20 tw-text-base tw-w-full tw-max-w-7xl">
        <ListingPage listing={listing} />
      </div>
    </main>
  );
}
