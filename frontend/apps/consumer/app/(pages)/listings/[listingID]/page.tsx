import { getListingServer } from "@coaster/rpc/server";
import { ListingPage } from "consumer/app/(pages)/listings/[listingID]/server";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  if (!listing) {
    return {
      title: "Coaster - Find your next adventure",
    };
  }

  return {
    title: listing.name + " | Coaster",
    description: listing.short_description,
    openGraph: {
      title: listing.name,
      description: listing.short_description,
    },
    twitter: {
      card: "summary_large_image",
      title: listing.name,
      description: listing.short_description,
    },
    alternates: {
      canonical: `https://www.trycoaster.com/listings/${listing.id}`,
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
    <main className="tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-pb-10 tw-pt-5 tw-text-base sm:tw-pb-20 sm:tw-pt-12">
        <ListingPage listing={listing} />
      </div>
    </main>
  );
}
