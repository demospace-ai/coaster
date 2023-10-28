import { getListingServer } from "@coaster/rpc/server";
import { isProd } from "@coaster/utils/common";
import { ListingPage } from "consumer/app/(pages)/listings/[listingID]/server";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  return {
    title: listing ? listing.name : "Listing not found",
    metadataBase: isProd() ? "https://trycoaster.com" : "http://localhost:3000",
  };
}

export default async function Listing({ params }: { params: { listingID: string } }) {
  const listingID = Number(params.listingID);
  if (Number.isNaN(listingID)) {
    // Sometimes the value of listingID is TODO
    return <div>Something unexpected happened.</div>;
  }

  const listing = await getListingServer(listingID);
  if (!listing) {
    return <div>Something unexpected happened.</div>;
  }

  return <ListingPage listing={listing} />;
}
