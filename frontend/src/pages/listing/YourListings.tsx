import { NavLink, useNavigate } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useHostedListings } from "src/rpc/data";
import { Listing } from "src/rpc/types";

export const YourListings: React.FC = () => {
  const { hosted, error } = useHostedListings();
  const navigate = useNavigate();

  if (!hosted) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  return (
    <div className="tw-flex tw-justify-center tw-pt-6 tw-pb-24 tw-px-8 tw-overflow-auto">
      <div className="tw-flex tw-flex-col sm:tw-max-w-3xl tw-w-full">
        <div className="tw-flex tw-flex-row tw-justify-between tw-w-full tw-mt-6 tw-mb-5">
          <div className="tw-font-bold tw-text-3xl">Your listings</div>
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
    </div>
  );
};
