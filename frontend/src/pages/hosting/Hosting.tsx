import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useHostedListings } from "src/rpc/data";
import { Listing, ListingStatus } from "src/rpc/types";

export const Hosting: React.FC = () => {
  const { hosted, error } = useHostedListings();
  const navigate = useNavigate();

  if (!hosted) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  const draft = hosted.find((listing) => listing.status === ListingStatus.Draft);

  return (
    <div className="tw-pt-6 sm:tw-pt-8 tw-pb-24 tw-px-8 sm:tw-px-20 tw-overflow-scroll">
      {draft && (
        <div className="tw-border tw-border-solid tw-border-slate-300 tw-rounded-xl tw-p-8 tw-w-80 tw-mb-10 tw-flex tw-items-center tw-justify-between">
          <div>
            <div className="tw-font-bold tw-text-xl tw-mb-1">Draft Listing</div>
            <div className="tw-text-slate-500 tw-mb-2">{draft.name ? draft.name : "Untitled"}</div>
            <NavLink to="/listings/new" className="tw-underline">
              Continue where you left off
            </NavLink>
          </div>
          <ExclamationCircleIcon className="tw-h-6 tw-text-yellow-600" />
        </div>
      )}
      <div className="tw-mb-4 tw-font-bold tw-text-2xl">Your listings</div>
      {hosted.map((listing: Listing) => (
        <div
          className="tw-my-2 tw-cursor-pointer tw-w-fit"
          onClick={() => navigate(`/listings/${listing.id}`)}
          key={listing.id}
        >
          {listing.name}
        </div>
      ))}
    </div>
  );
};
