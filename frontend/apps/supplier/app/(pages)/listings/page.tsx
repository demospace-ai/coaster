import { getCategoryForDisplay } from "@coaster/components/icons/Category";
import { NavLink } from "@coaster/components/link/Link";
import { getHostedListingsServer } from "@coaster/rpc/server";
import { Listing } from "@coaster/types";
import { ListingMenu } from "supplier/app/(pages)/listings/client";

export default async function YourListings() {
  const hosted = await getHostedListingsServer();
  if (!hosted) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <div className="tw-flex tw-justify-center tw-overflow-auto tw-px-8 tw-pb-24 tw-pt-2 sm:tw-pt-6">
      <div className="tw-flex tw-w-full tw-flex-col sm:tw-max-w-7xl">
        <div className="tw-mb-5 tw-mt-6 tw-flex tw-w-full tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-text-2xl tw-font-bold sm:tw-text-3xl">Your listings</div>
          <NavLink
            className="tw-ml-8 tw-h-fit tw-whitespace-nowrap tw-rounded-lg tw-border tw-border-solid tw-border-gray-600 tw-px-3 tw-py-2 hover:tw-bg-gray-200"
            href="/listings/new"
          >
            New Listing
          </NavLink>
        </div>
        <div className="tw-flow-root">
          <div className="tw-inline-block tw-w-full tw-py-2 tw-align-middle">
            <div className="tw-overflow-auto tw-rounded-lg tw-shadow tw-ring-1 tw-ring-black tw-ring-opacity-5">
              <table className="tw-w-full tw-divide-y tw-divide-gray-300">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="tw-py-3.5 tw-pl-4 tw-pr-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900 sm:tw-pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="tw-max-w-md tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="tw-max-w-md tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900"
                    >
                      Price
                    </th>
                    <th scope="col" className="tw-relative tw-py-3.5 tw-pl-3 tw-pr-4 sm:tw-pr-6">
                      <span className="tw-sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-divide-y tw-divide-gray-200 tw-bg-white">
                  {hosted.map((listing: Listing) => (
                    <tr key={listing.id}>
                      <td className="tw-whitespace-nowrap tw-py-4 tw-pl-4 tw-pr-3 tw-text-sm tw-font-medium tw-text-gray-900 sm:tw-pl-6">
                        <NavLink href={`/listings/${listing.id}/edit`}>{listing.name}</NavLink>
                      </td>
                      <td className="tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500">
                        {listing.status}
                      </td>
                      <td className="tw-max-w-[120px] tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500">
                        {listing.categories
                          ? listing.categories.map((category) => getCategoryForDisplay(category)).join(" | ")
                          : ""}
                      </td>
                      <td className="tw-max-w-[120px] tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500">
                        {listing.location}
                      </td>
                      <td className="tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500">
                        ${listing.price}
                      </td>
                      <td className="tw-flex tw-items-center tw-justify-end tw-whitespace-nowrap tw-py-4 tw-pr-6 tw-text-sm tw-font-medium">
                        <NavLink
                          href={`/listings/${listing.id}/edit`}
                          className="tw-w-fit tw-cursor-pointer tw-text-indigo-600 hover:tw-text-indigo-900"
                        >
                          Edit
                        </NavLink>
                        <ListingMenu listing={listing} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
