import { getListingServer } from "@coaster/rpc/server";
import { ListingPage } from "consumer/app/(pages)/listings/[listingID]/server";
import { cookies } from "next/headers";

export default async function ListingPreview({ params }: { params: { listingID: string } }) {
  const listingID = Number(params.listingID);
  if (Number.isNaN(listingID)) {
    // Sometimes the value of listingID is TODO
    return <div>Something unexpected happened.</div>;
  }

  const listing = await getListingServer(listingID, cookies().toString());
  if (!listing) {
    return <div>Something unexpected happened.</div>;
  }

  return <ListingPage listing={listing} />;
}
