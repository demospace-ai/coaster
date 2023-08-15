import { useParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useListing } from "src/rpc/data";
import { getGcsImageUrl } from "src/utils/images";
import { toTitleCase } from "src/utils/string";

export const Listing: React.FC = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { listing, error } = useListing(Number(listingID));

  if (!listing) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  return (
    <div className="tw-overflow-scroll tw-h-full">
      <div className="tw-flex tw-flex-col tw-px-5 tw-pt-10 tw-pb-20 sm:tw-py-20 sm:tw-px-[5rem] lg:tw-px-[10rem] lg:tw-max-w-[90rem] lg:tw-mx-auto">
        <div className="tw-flex tw-max-h-[50vh] tw-rounded-xl tw-overflow-clip tw-mb-5">
          <div className="tw-flex tw-w-full sm:tw-w-3/4 sm:tw-mr-2">
            <img
              className="tw-bg-gray-100 tw-object-cover tw-h-full tw-w-full"
              src={listing.images.length > 0 ? getGcsImageUrl(listing.images[0]) : "TODO"}
            />
          </div>
          <div className="tw-flex-col tw-w-1/4 tw-gap-2 tw-hidden sm:tw-flex">
            <img
              className="tw-bg-gray-100 tw-object-cover tw-h-full tw-w-full"
              src={listing.images.length > 1 ? getGcsImageUrl(listing.images[1]) : "TODO"}
            />
            <img
              className="tw-bg-gray-100 tw-object-cover tw-h-full tw-w-full"
              src={listing.images.length > 2 ? getGcsImageUrl(listing.images[2]) : "TODO"}
            />
          </div>
        </div>
        <span className="tw-mt-3 tw-font-semibold sm:tw-font-bold tw-text-3xl sm:tw-text-4xl">{listing.name}</span>
        <span className="tw-mt-3 tw-font-medium tw-text-base">
          {listing.location} • {toTitleCase(listing.category ? listing.category : "")}
        </span>
        <span className="tw-mt-4 tw-text-base">{listing.description}</span>
      </div>
    </div>
  );
};
