import { useNavigate } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useHostedListings } from "src/rpc/data";
import { Listing } from "src/rpc/types";

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

  return (
    <div className="tw-pt-6 sm:tw-pt-8 tw-pb-24 tw-px-8 sm:tw-px-20 tw-overflow-scroll">
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
