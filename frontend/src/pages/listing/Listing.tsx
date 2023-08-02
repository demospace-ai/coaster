import { useParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useListing } from "src/rpc/data";

export const Listing: React.FC = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { listing } = useListing(Number(listingID));

  if (!listing) {
    return <Loading />;
  }

  return <div>{listing.name}</div>;
};
