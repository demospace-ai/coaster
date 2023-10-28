import { BackButton, Callout, LinkButton, ProfilePicture } from "@coaster/components/client";
import { getListingServer, getUserServer } from "@coaster/rpc/server";
import { ListingStatus, Listing as ListingType, User } from "@coaster/types";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { ClockIcon, GlobeAltIcon, StarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import {
  BookingPanel,
  ListingHeader,
  ListingImages,
  ReserveSlider,
} from "consumer/app/(pages)/listings/[listingID]/client";
import { getDuration, getHostName, getMaxGuests } from "consumer/app/(pages)/listings/[listingID]/utils";

export async function generateMetadata({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  return {
    title: listing ? listing.name : "Listing not found",
  };
}

export default async function Listing({ params }: { params: { listingID: string } }) {
  const user = await getUserServer();

  const listingID = Number(params.listingID);
  if (Number.isNaN(listingID)) {
    // Sometimes the value of listingID is TODO
    return <div>Something unexpected happened.</div>;
  }

  const listing = await getListingServer(listingID);
  if (!listing) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <div className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-pt-5 sm:tw-pt-12 tw-pb-32 tw-text-base tw-w-full tw-max-w-[1280px]">
        <BackButton className="tw-mr-auto tw-mb-4" />
        {listing.status !== ListingStatus.Published && (
          <Callout content={"Not published - under review"} className="tw-border tw-border-yellow-400 tw-mb-4" />
        )}
        <ListingHeader listing={listing} />
        <ListingImages listing={listing} />
        <div className="tw-flex tw-mt-8 sm:tw-mt-12">
          <ListingDetails listing={listing} />
          <BookingPanel user={user} listing={listing} />
        </div>
        <ReserveFooter user={user} listing={listing} />
      </div>
    </div>
  );
}

const ReserveFooter: React.FC<{ user: User | undefined; listing: ListingType }> = ({ user, listing }) => {
  return (
    <div className="tw-fixed lg:tw-hidden tw-z-20 tw-bottom-0 tw-left-0 tw-flex tw-items-center tw-justify-between tw-bg-white tw-border-t tw-border-solid tw-border-gray-300 tw-h-20 tw-w-full tw-px-4">
      <div className="tw-flex tw-flex-col">
        <div>
          <span className="tw-font-semibold">${listing.price}</span> per person
        </div>
        <div>/ {getDuration(listing)}</div>
      </div>
      <ReserveSlider user={user} listing={listing} />
    </div>
  );
};

const ListingDetails: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-flex tw-flex-col tw-w-full lg:tw-mr-16">
      <HostOverview listing={listing} />
      <QuickInfo listing={listing} />
      <Description listing={listing} />
      {listing.includes && listing.includes.length > 0 && <Included listing={listing} />}
      {listing.not_included && listing.not_included.length > 0 && <NotIncluded listing={listing} />}
      <HostDetails listing={listing} />
    </div>
  );
};

const HostDetails: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div>
      <div className="tw-mt-5 tw-flex tw-flex-row tw-items-center">
        <ProfilePicture
          url={listing.host.profile_picture_url}
          name={getHostName(listing.host)}
          className="tw-w-10 tw-h-10 tw-mr-4"
        />
        <div>
          <div className="tw-text-xl tw-font-medium">Meet your trip provider: {getHostName(listing.host)}</div>
          <div className="tw-flex tw-flex-row tw-items-center">
            <CheckBadgeIcon className="tw-h-4 tw-mr-1 tw-fill-green-600" />
            Identity Verified
          </div>
        </div>
      </div>
      <div className="tw-mt-4 tw-whitespace-pre-wrap">{listing.host.about}</div>
      <LinkButton
        className="tw-mt-6 tw-bg-white hover:tw-bg-gray-100 tw-text-black tw-border tw-border-solid tw-border-black tw-w-fit tw-px-8"
        href={`mailto:${listing.host.email}?subject=Question about your trip`}
      >
        Contact
      </LinkButton>
    </div>
  );
};

const Description: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-font-semibold">About</div>
      <div className="tw-mt-2 tw-whitespace-pre-wrap">{listing.description}</div>
    </div>
  );
};

const Included: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-font-semibold">What's included</div>
      <ul className="tw-list-disc tw-list-inside tw-mt-1">
        {listing.includes?.map((included) => <li key={included}>{included}</li>)}
      </ul>
    </div>
  );
};

const NotIncluded: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-font-semibold">Not Included</div>
      <ul className="tw-list-disc tw-list-inside tw-mt-1">
        {listing.not_included?.map((notIncluded) => <li key={notIncluded}>{notIncluded}</li>)}
      </ul>
    </div>
  );
};

const Highlights: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-font-semibold">Highlights</div>
      <ul className="tw-list-disc tw-list-inside tw-mt-1">
        {listing.highlights?.map((highlight) => <li key={highlight}>{highlight}</li>)}
      </ul>
    </div>
  );
};

const QuickInfo: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const duration = getDuration(listing);
  const maxGuests = getMaxGuests(listing);

  return (
    <div className="tw-border-b tw-border-solid tw-border-gray-300 tw-mt-6 tw-pb-2">
      <div className="tw-flex tw-items-center tw-mb-6">
        <StarIcon className="tw-h-6 tw-mr-4" />
        <div className="tw-flex tw-flex-col">
          <span className="tw-font-medium">Professional guide</span>
          <span className="tw-text-sm">Our guides are committed to providing a great experience.</span>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-my-6">
        <ClockIcon className="tw-h-6 tw-mr-4" />
        <div className="tw-flex tw-flex-col">
          <div className="tw-flex">
            <span className="tw-font-medium tw-mr-1.5">Duration:</span>
            {duration}
          </div>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-my-6">
        <UserGroupIcon className="tw-h-6 tw-mr-4" />
        <div className="tw-flex">
          <span className="tw-font-medium tw-mr-1.5">Max guests: </span>
          {maxGuests}
        </div>
      </div>
    </div>
  );
};

const HostOverview: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const languages = listing.languages ? listing.languages.join(", ") : "English";
  return (
    <div className="tw-flex tw-items-center tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300 tw-justify-between">
      <div>
        <div className="tw-text-xl sm:tw-text-2xl tw-font-medium">Provided by {getHostName(listing.host)}</div>
        <div className="tw-flex tw-items-center tw-mt-1">
          <GlobeAltIcon className="tw-h-5 tw-mr-1.5" />
          {languages}
        </div>
      </div>
      <ProfilePicture
        url={listing.host.profile_picture_url}
        name={getHostName(listing.host)}
        className="tw-w-12 tw-h-12"
      />
    </div>
  );
};
