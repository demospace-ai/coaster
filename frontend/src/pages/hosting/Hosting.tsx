import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useSelector } from "src/root/model";
import { useHostedListings } from "src/rpc/data";
import { Listing, ListingStatus } from "src/rpc/types";

export const Hosting: React.FC = () => {
  const user = useSelector((state) => state.login.user);
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
    <div className="tw-pt-6 sm:tw-pt-12 tw-pb-24 tw-px-8 sm:tw-px-48 tw-overflow-scroll">
      <div className="tw-mb-8 tw-text-3xl tw-font-bold">Welcome back, {user?.first_name}!</div>
      {draft && (
        <div className="tw-border tw-border-solid tw-border-slate-300 tw-rounded-xl tw-p-6 tw-w-fit tw-mb-10 tw-flex tw-items-center tw-justify-between">
          <div>
            <div className="tw-font-bold tw-text-xl tw-mb-1">Draft Listing</div>
            <div className="tw-text-slate-500 tw-mb-2">{draft.name ? draft.name : "Untitled"}</div>
            <NavLink to="/listings/new" className="tw-underline">
              Continue where you left off
            </NavLink>
          </div>
          <ExclamationCircleIcon className="tw-h-6 tw-text-yellow-600 tw-ml-2 sm:tw-ml-12" />
        </div>
      )}
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-6 tw-mb-4">
        <div className="tw-font-bold tw-text-2xl">Your listings</div>
        <NavLink
          className="tw-border tw-border-solid tw-border-gray-600 tw-px-3 tw-py-2 tw-rounded-lg tw-ml-8 hover:tw-bg-gray-200"
          to={"/listings/new"}
        >
          New Listing
        </NavLink>
      </div>
      {hosted.map((listing: Listing) => (
        <div
          className="tw-my-2 tw-cursor-pointer tw-w-fit tw-underline"
          onClick={() => navigate(`/listings/${listing.id}/edit`)}
          key={listing.id}
        >
          {listing.name}
        </div>
      ))}
    </div>
  );
};
