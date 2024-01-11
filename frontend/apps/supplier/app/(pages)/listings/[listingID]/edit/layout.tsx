import { NavLink } from "@coaster/components/link/Link";
import { getListingServer } from "@coaster/rpc/server";
import { isProd } from "@coaster/utils/common";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from "@heroicons/react/24/outline";
import { cookies } from "next/headers";
import Link from "next/link";
import { ListingContextProvider } from "supplier/app/(pages)/listings/[listingID]/edit/context";

export default async function EditListingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { listingID: string };
}) {
  const listing = await getListingServer(Number(params.listingID), cookies().toString());
  if (!listing) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <div className="tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-px-4 tw-py-4 sm:tw-px-20 sm:tw-py-12">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col">
        <div className="tw-flex tw-w-full tw-items-center tw-justify-between">
          <div className="tw-hyphens-auto tw-text-3xl tw-font-semibold sm:tw-text-4xl sm:tw-font-bold">
            Edit Listing
          </div>
          <Link
            className="tw-flex tw-items-center tw-gap-1 tw-rounded-lg tw-border tw-border-solid tw-border-blue-600 tw-px-3 tw-py-1 tw-text-blue-600"
            href={
              isProd()
                ? `https://www.trycoaster.com/listings/${listing.id}/preview`
                : `http://localhost:3000/listings/${listing.id}/preview`
            }
            target="_blank"
            rel="noreferrer"
          >
            See preview
            <EyeIcon className="tw-h-4" />
          </Link>
        </div>
        <div className="tw-mt-4 tw-flex tw-flex-col sm:tw-mt-8 sm:tw-flex-row">
          <div className="tw-relative tw-mb-3 tw-flex tw-items-center sm:tw-items-start">
            <ChevronLeftIcon className="tw-h-4 sm:tw-hidden" />
            <div className="tw-hide-scrollbar tw-flex tw-flex-1 tw-gap-3 tw-overflow-auto tw-rounded-xl tw-p-1 sm:tw-sticky sm:tw-top-32 sm:tw-mr-[10vw] sm:tw-flex-col sm:tw-overflow-visible">
              <NavLink
                key="details"
                href={`/listings/${params.listingID}/edit`}
                className="tw-w-full tw-whitespace-nowrap tw-rounded-lg tw-px-4 tw-py-2.5 tw-text-start tw-font-medium tw-leading-5 tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Listing Details
              </NavLink>
              <NavLink
                key="images"
                href={`/listings/${listing.id}/edit/images`}
                className="tw-w-full tw-whitespace-nowrap tw-rounded-lg tw-px-4 tw-py-2.5 tw-text-start tw-font-medium tw-leading-5 tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Images
              </NavLink>
              <NavLink
                key="itinerary"
                href={`/listings/${params.listingID}/edit/itinerary`}
                className="tw-w-full tw-whitespace-nowrap tw-rounded-lg tw-px-4 tw-py-2.5 tw-text-start tw-font-medium tw-leading-5 tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Itinerary
              </NavLink>
              <NavLink
                key="includes"
                href={`/listings/${listing.id}/edit/includes`}
                className="tw-w-full tw-whitespace-nowrap tw-rounded-lg tw-px-4 tw-py-2.5 tw-text-start tw-font-medium tw-leading-5 tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Included Amenities
              </NavLink>
              <NavLink
                key="availability"
                href={`/listings/${listing.id}/edit/availability`}
                className="tw-w-full tw-whitespace-nowrap tw-rounded-lg tw-px-4 tw-py-2.5 tw-text-start tw-font-medium tw-leading-5 tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Availability
              </NavLink>
            </div>
            <ChevronRightIcon className="tw-h-4 sm:tw-hidden" />
          </div>
          <div className="tw-mb-32 tw-mt-2 tw-w-full">
            <ListingContextProvider initialData={listing}>{children}</ListingContextProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
