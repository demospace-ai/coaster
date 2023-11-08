import { BackButton } from "@coaster/components/button/Button";
import { Callout } from "@coaster/components/callouts/Callout";
import { getListingServer } from "@coaster/rpc/server";
import { ListingStatus } from "@coaster/types";
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

  return (
    <main className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-pt-5 sm:tw-pt-12 tw-pb-32 tw-text-base tw-w-full tw-max-w-[1280px]">
        <BackButton className="tw-mr-auto tw-mb-4" />
        {listing.status !== ListingStatus.Published && (
          <Callout content={"Not published - under review"} className="tw-border tw-border-yellow-400 tw-mb-4" />
        )}
        <ListingPage listing={listing} />
      </div>
    </main>
  );
}
