import { useParams } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { Callout } from "src/components/callouts/Callout";
import { Loading } from "src/components/loading/Loading";
import { useListing } from "src/rpc/data";
import { ListingStatus, Listing as ListingType } from "src/rpc/types";
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
    <div className="tw-flex tw-flex-col tw-px-5 tw-pt-5 sm:tw-pt-16 tw-pb-32 sm:tw-px-[5rem] lg:tw-px-[10rem] lg:tw-max-w-[90rem] lg:tw-mx-auto tw-text-base">
      {listing.status !== ListingStatus.Published && (
        <Callout content={"Not published - under review"} className="tw-border tw-border-yellow-400 tw-mb-4" />
      )}
      <div className="tw-font-semibold sm:tw-font-bold tw-text-3xl sm:tw-text-4xl tw-hyphens-auto">
        {listing.name} askdjfhaaslkjdhfalk aslkdjhfals aslkdjfhaksjldfh
      </div>
      <div className="tw-flex tw-items-center tw-mt-3 tw-mb-4 tw-font-medium">
        {listing.location} • {toTitleCase(listing.category ? listing.category : "")}{" "}
      </div>
      <ListingImages listing={listing} />
      <div className="tw-flex tw-mt-12">
        <ListingDetails listing={listing} />
        <BookingPanel listing={listing} />
      </div>
      <ReserveFooter listing={listing} />
    </div>
  );
};

export const ReserveFooter: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-fixed md:tw-hidden tw-z-20 tw-bottom-0 tw-left-0 tw-flex tw-items-center tw-justify-between tw-bg-white tw-border-t tw-border-solid tw-border-gray-300 tw-h-20 tw-w-full tw-px-10">
      <span>
        <span className="tw-font-bold">${listing.price}</span>
        {listing.duration_hours ? listing.duration_hours : "/night"}
      </span>
      <Button className="tw-font-semibold tw-py-2">Check Availability</Button>
    </div>
  );
};

export const BookingPanel: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-hidden md:tw-flex tw-w-[40%]">
      <div className="tw-flex tw-flex-col tw-px-8 tw-py-6 tw-w-full tw-border tw-border-solid tw-border-gray-300 tw-rounded-xl tw-shadow-centered-lg">
        <span className="tw-text-2xl tw-font-semibold tw-mb-3">Reserve your spot</span>
        <span className="tw-mb-3">
          <span className="tw-font-bold">${listing.price}</span>
          {listing.duration_hours ? listing.duration_hours : "/night"}
        </span>
        <Button className="tw-font-semibold tw-py-2 tw-mb-4">Check Availability</Button>
        <span className="tw-text-sm">
          *Likely to sell out: Based on Coaster's booking data and information from the provider from the past 30 days,
          it seems likely this experience will sell out soon.
        </span>
      </div>
    </div>
  );
};

export const ListingDetails: React.FC<{ listing: ListingType }> = ({ listing }) => {
  // TODO: link to full description
  const shortDescription = getShortDescription(listing);

  return (
    <div className="tw-flex tw-flex-col tw-w-full md:tw-w-[60%]">
      <div className="tw-font-semibold">About</div>
      <div className="tw-mt-2">{shortDescription}</div>
      <div className="tw-mt-5 tw-font-semibold">Full description</div>
      <div className="tw-mt-2 tw-whitespace-pre-wrap">{listing.description}</div>
    </div>
  );
};

export const ListingImages: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-flex tw-max-h-[50vh] tw-rounded-xl tw-overflow-clip">
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
  );
};

const getShortDescription = (listing: ListingType) => {
  let shortDescription = "An unforgettable experience"; // TODO: this should never happen
  if (listing.short_description) {
    shortDescription = listing.short_description;
  } else {
    if (listing.description) {
      const shortened = listing.description.substring(0, 200);
      if (shortened && shortened.length >= 200) {
        shortDescription = shortened.concat("...");
      } else {
        shortDescription = shortened;
      }
    }
  }
  return shortDescription;
};
