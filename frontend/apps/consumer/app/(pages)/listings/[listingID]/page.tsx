import { getListingServer } from "@coaster/rpc/server";
import { isProd } from "@coaster/utils/common";
import { ListingPage } from "consumer/app/(pages)/listings/[listingID]/server";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  return {
    title: listing ? listing.name : "Listing not found",
    description: listing ? listing.short_description : "",
    metadataBase: isProd() ? "https://trycoaster.com" : "http://localhost:3000",
  };
}

export default async function Listing({ params }: { params: { listingID: string } }) {
  const listingID = Number(params.listingID);
  const listing = await getListingServer(listingID);
  if (!listing) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <main className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-pt-5 sm:tw-pt-12 tw-pb-32 tw-text-base tw-w-full tw-max-w-[1280px]">
        <ListingPage listing={listing} />
      </div>
    </main>
  );
}
