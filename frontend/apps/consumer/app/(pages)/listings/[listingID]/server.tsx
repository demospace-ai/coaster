import { LinkButton } from "@coaster/components/button/Button";
import { ProfilePicture } from "@coaster/components/profile/ProfilePicture";
import { search } from "@coaster/rpc/server";
import { Listing, Listing as ListingType } from "@coaster/types";
import { getDuration } from "@coaster/utils/common";
import { CheckBadgeIcon, ClockIcon, GlobeAltIcon, StarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { ListingsSectionClient } from "app/(pages)/client";
import {
  BookingPanel,
  Itinerary,
  ListingHeader,
  ListingImages,
  ReserveFooter,
} from "consumer/app/(pages)/listings/[listingID]/client";
import { getHostName, getMaxGuests } from "consumer/app/(pages)/listings/[listingID]/utils";

export const ListingPage: React.FC<{ listing: ListingType; generated?: boolean }> = ({ listing, generated }) => {
  return (
    <>
      <ListingHeader listing={listing} generated={!!generated} />
      <ListingImages listing={listing} />
      <div className="tw-flex tw-mt-8 sm:tw-mt-10">
        <ListingDetails listing={listing} />
        <BookingPanel listing={listing} generated={!!generated} />
      </div>
      <RecommendedListings listing={listing} />
      <ReserveFooter listing={listing} generated={!!generated} />
    </>
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
      {listing.itinerary_steps && listing.itinerary_steps.length > 0 && <Itinerary listing={listing} />}
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
          className="tw-mr-4"
          width={40}
          height={40}
          square
        />
        <div>
          <div className="tw-text-2xl tw-font-semibold tw-font-heading">
            Meet your trip provider: {getHostName(listing.host)}
          </div>
          <div className="tw-flex tw-flex-row tw-items-center">
            <CheckBadgeIcon className="tw-h-4 tw-mr-1 tw-fill-green-600 tw-stroke-white" />
            Identity Verified
          </div>
        </div>
      </div>
      <div className="tw-mt-4 tw-whitespace-pre-wrap">{listing.host.about}</div>
      <LinkButton
        className="tw-mt-6 tw-bg-white hover:tw-bg-gray-100 tw-text-black tw-font-semibold tw-border tw-border-solid tw-border-black tw-w-fit tw-px-8"
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
      <div className="tw-mt-5 tw-text-2xl tw-font-semibold tw-font-heading">About</div>
      <div
        className="tw-mt-2 tw-whitespace-pre-wrap [&_ul]:tw-list-disc [&_ul]:tw-ml-5 [&_ol]:tw-list-decimal [&_ol]:tw-ml-5 [&_p]:tw-min-h-[1.5rem] [&_a]:tw-text-blue-600"
        dangerouslySetInnerHTML={{ __html: listing.description ?? "" }}
      />
    </div>
  );
};

const Included: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-text-2xl tw-font-semibold tw-font-heading">What&apos;s included</div>
      <ul className="tw-list-disc tw-list-inside tw-mt-2">
        {listing.includes?.map((included) => <li key={included}>{included}</li>)}
      </ul>
    </div>
  );
};

const NotIncluded: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-text-2xl tw-font-semibold tw-font-heading">Not Included</div>
      <ul className="tw-list-disc tw-list-inside tw-mt-2">
        {listing.not_included?.map((notIncluded) => <li key={notIncluded}>{notIncluded}</li>)}
      </ul>
    </div>
  );
};

const QuickInfo: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const duration = getDuration(listing.duration_minutes);
  const maxGuests = getMaxGuests(listing);

  return (
    <div className="tw-border-b tw-border-solid tw-border-gray-300 tw-mt-6 tw-pb-2">
      <div className="tw-flex tw-items-center tw-mb-6">
        <StarIcon className="tw-h-6 tw-w-6 tw-mr-4 tw-shrink-0" />
        <div className="tw-flex tw-flex-col">
          <span className="tw-font-medium">Professional guide</span>
          <span className="tw-text-sm">Our guides are committed to providing a great experience.</span>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-my-6">
        <ClockIcon className="tw-h-6 tw-w-6 tw-mr-4" />
        <div className="tw-flex tw-flex-col">
          <div className="tw-flex">
            <span className="tw-font-medium tw-mr-1.5">Duration:</span>
            {duration}
          </div>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-my-6">
        <UserGroupIcon className="tw-h-6 tw-w-6 tw-mr-4" />
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
      <div className="tw-mr-1">
        <div className="tw-text-xl sm:tw-text-2xl tw-font-semibold tw-font-heading">
          Provided by {getHostName(listing.host)}
        </div>
        <div className="tw-flex tw-items-center tw-mt-1">
          <GlobeAltIcon className="tw-h-5 tw-mr-1.5" />
          {languages}
        </div>
      </div>
      <ProfilePicture
        url={listing.host.profile_picture_url}
        name={getHostName(listing.host)}
        width={54}
        height={54}
        square
      />
    </div>
  );
};

const RecommendedListings: React.FC<{ listing: ListingType }> = async ({ listing }) => {
  var listings: Listing[] = await search({ categories: '["popular"]' });

  return (
    <div className="tw-flex tw-w-full tw-mt-12 sm:tw-mt-16">
      <ListingsSectionClient title="Recommended for you" listings={listings} searchQuery={undefined} />
    </div>
  );
};
