import { getCategoryForDisplay } from "@coaster/components/icons/Category";
import { getBookingServer } from "@coaster/rpc/server";
import { Booking } from "@coaster/types";
import { getDuration } from "@coaster/utils/common";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { getBookingStatusPill, getStartTimeString } from "app/(pages)/reservations/[bookingReference]/utils";
import Image from "next/image";

export default async function Reservation({ params }: { params: { bookingReference: string } }) {
  const booking = await getBookingServer(params.bookingReference);
  if (!booking) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <main className="tw-flex tw-w-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-flex sm:tw-hidden tw-flex-col tw-justify-start tw-w-full tw-mb-4">
          <div className="tw-font-semibold tw-text-lg tw-text-slate-800">{booking.reference}</div>
          <div className="tw-font-bold tw-text-3xl">{booking.listing.name}</div>
        </div>
        <div className="tw-flex tw-flex-row tw-w-full">
          <Image
            src={booking.booking_image.url}
            width={booking.booking_image.width}
            height={booking.booking_image.height}
            alt="Booking image"
            sizes="(max-width: 639px) 128px, 192px"
            placeholder="data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4="
            tabIndex={-1}
            className="tw-w-32 sm:tw-w-48"
          />
          <div className="tw-ml-4">
            <div className="tw-hidden sm:tw-flex tw-flex-col tw-mb-2">
              <div className="tw-font-semibold tw-text-lg tw-text-slate-800">{booking.reference}</div>
              <div className="tw-font-bold tw-text-3xl">{booking.listing.name}</div>
            </div>
            <div className="tw-text-base tw-font-medium">{booking.listing.location}</div>
            <div className="tw-text-base tw-font-medium">
              {getStartTimeString(booking.start_date, booking.start_time, booking.listing.availability_type)}
            </div>
            {getBookingStatusPill(booking.status)}
          </div>
        </div>
        <YourBooking booking={booking} />
        <AboutTheTrip booking={booking} />
      </div>
    </main>
  );
}

const YourBooking: React.FC<{ booking: Booking }> = ({ booking }) => {
  return (
    <div className="tw-flex tw-flex-col tw-justify-start tw-w-full tw-mt-10">
      <div className="tw-text-2xl tw-font-bold tw-mb-4">Your Booking</div>
      <div className="tw-text-base tw-font-semibold tw-mb-1">Reference</div>
      <div className="tw-mb-4">{booking.reference}</div>
      <div className="tw-text-base tw-font-semibold tw-mb-1">Participants</div>
      <div className="tw-mb-4">{booking.guests > 1 ? `${booking.guests} guests` : "1 guest"}</div>
      <div className="tw-text-base tw-font-semibold tw-mb-1">Total Cost</div>
      <div className="tw-mb-4">${booking.payments.length > 0 ? booking.payments[0].total_amount / 100 : "Pending"}</div>
    </div>
  );
};

const AboutTheTrip: React.FC<{ booking: Booking }> = ({ booking }) => {
  return (
    <div className="tw-flex tw-flex-col tw-justify-start tw-w-full tw-mt-5">
      <div className="tw-text-2xl tw-font-bold tw-mb-4">About the trip</div>
      <div className="tw-text-base tw-font-semibold tw-mb-1">Activity Type</div>
      <div className="tw-mb-4">{booking.listing.category ? getCategoryForDisplay(booking.listing.category) : ""}</div>
      <div className="tw-text-base tw-font-semibold tw-mb-1">Duration</div>
      <div className="tw-mb-4">Approx. {getDuration(booking.listing.duration_minutes)}</div>
      {booking.listing.includes && booking.listing.includes.length > 0 && (
        <div className="tw-mb-5">
          <div className="tw-text-base tw-font-semibold tw-mb-2">Includes</div>
          <ul>
            {booking.listing.includes.map((item) => (
              <li key={item} className="tw-flex tw-items-center">
                <CheckIcon className="tw-h-4 tw-w-4 tw-text-green-600 tw-mr-2" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {booking.listing.not_included && booking.listing.not_included.length > 0 && (
        <div className="tw-mb-5">
          <div className="tw-text-base tw-font-semibold tw-mb-2">What's not included</div>
          <ul>
            {booking.listing.not_included.map((item) => (
              <li key={item} className="tw-flex tw-items-center">
                <XMarkIcon className="tw-h-5 tw-w-5 tw-text-red-500 tw-mr-2" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
