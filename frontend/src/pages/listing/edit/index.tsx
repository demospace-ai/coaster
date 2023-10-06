import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from "@heroicons/react/24/outline";
import { NavLink, Outlet, useOutletContext, useParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useListing } from "src/rpc/data";
import { Listing } from "src/rpc/types";
import { isProd } from "src/utils/env";
import { mergeClasses } from "src/utils/twmerge";

export const EditListingLayout: React.FC = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { listing, error: loadListingError } = useListing(Number(listingID));

  if (!listing) {
    if (!loadListingError) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
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
                ? `https://www.trycoaster.com/listings/${listingID}`
                : `http://localhost:3000/listings/${listingID}`
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
                end
                key="details"
                to=""
                className={({ isActive }) =>
                  mergeClasses(
                    "tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none",
                    isActive ? "tw-bg-white tw-shadow" : "hover:tw-bg-slate-100",
                  )
                }
              >
                Listing Details
              </NavLink>
              <NavLink
                end
                key="images"
                to="images"
                className={({ isActive }) =>
                  mergeClasses(
                    "tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none",
                    isActive ? "tw-bg-white tw-shadow" : "hover:tw-bg-slate-100",
                  )
                }
              >
                Images
              </NavLink>
              <NavLink
                end
                key="includes"
                to="includes"
                className={({ isActive }) =>
                  mergeClasses(
                    "tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none",
                    isActive ? "tw-bg-white tw-shadow" : "hover:tw-bg-slate-100",
                  )
                }
              >
                Included Amenities
              </NavLink>
              <NavLink
                end
                key="availability"
                to="availability"
                className={({ isActive }) =>
                  mergeClasses(
                    "tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none",
                    isActive ? "tw-bg-white tw-shadow" : "hover:tw-bg-slate-100",
                  )
                }
              >
                Availability
              </NavLink>
            </div>
            <ChevronRightIcon className="sm:tw-hidden tw-h-4" />
          </div>
          <div className="tw-mt-2 tw-mb-32 tw-w-full">
            <Outlet context={{ listing }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export function useListingContext() {
  return useOutletContext<{ listing: Listing }>();
}
