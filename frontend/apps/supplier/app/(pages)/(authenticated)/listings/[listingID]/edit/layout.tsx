import { NavLink } from "@coaster/components/client";
import { getListingServer } from "@coaster/rpc/server";
import { isProd } from "@coaster/utils";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from "@heroicons/react/24/outline";
import { ListingContextProvider } from "supplier/app/(pages)/listings/[listingID]/edit/context";

export default async function EditListingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { listingID: string };
}) {
  const listing = await getListingServer(Number(params.listingID));
  if (!listing) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-justify-center tw-items-center tw-px-4 sm:tw-px-20 tw-py-4 sm:tw-py-12">
      <div className="tw-flex tw-flex-col tw-w-full tw-max-w-7xl">
        <div className="tw-flex tw-w-full tw-justify-between tw-items-center">
          <div className="tw-font-semibold sm:tw-font-bold tw-text-3xl sm:tw-text-4xl tw-hyphens-auto">
            Edit Listing
          </div>
          <a
            className="tw-flex tw-items-center tw-gap-1 tw-text-blue-600 tw-border tw-border-solid tw-border-blue-600 tw-px-3 tw-py-1 tw-rounded-lg"
            href={
              isProd()
                ? `https://www.trycoaster.com/listings/${listing.id}`
                : `http://localhost:3000/listings/${listing.id}`
            }
            target="_blank"
            rel="noreferrer"
          >
            See preview
            <EyeIcon className="tw-h-4" />
          </a>
        </div>
        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-mt-4 sm:tw-mt-8">
          <div className="tw-relative tw-flex tw-items-center sm:tw-items-start tw-mb-3">
            <ChevronLeftIcon className="sm:tw-hidden tw-h-4" />
            <div className="sm:tw-sticky sm:tw-top-32 tw-flex tw-flex-1 sm:tw-flex-col tw-rounded-xl tw-p-1 tw-overflow-auto tw-hide-scrollbar sm:tw-overflow-visible tw-gap-3 sm:tw-mr-[10vw]">
              <NavLink
                key="details"
                href={`/listings/${params.listingID}/edit`}
                className="tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Listing Details
              </NavLink>
              <NavLink
                key="images"
                href={`/listings/${listing.id}/edit/images`}
                className="tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Images
              </NavLink>
              <NavLink
                key="includes"
                href={`/listings/${listing.id}/edit/includes`}
                className="tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Included Amenities
              </NavLink>
              <NavLink
                key="availability"
                href={`/listings/${listing.id}/edit/availability`}
                className="tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none hover:tw-bg-slate-100"
                activeClassName="tw-bg-white tw-shadow"
              >
                Availability
              </NavLink>
            </div>
            <ChevronRightIcon className="sm:tw-hidden tw-h-4" />
          </div>
          <div className="tw-mt-2 tw-mb-32 tw-w-full">
            <ListingContextProvider initialData={listing}>{children}</ListingContextProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
