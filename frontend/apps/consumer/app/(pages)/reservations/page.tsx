import { getBookingsServer } from "@coaster/rpc/server";
import { getStartTimeString } from "app/(pages)/reservations/[bookingReference]/utils";
import { HelpButton } from "app/(pages)/reservations/client";
import Image from "next/image";
import Link from "next/link";

export default async function Reservations() {
  const bookings = await getBookingsServer();
  if (!bookings) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <main className="tw-flex tw-w-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-justify-start tw-items-start tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-font-semibold tw-text-3xl tw-w-full tw-text-center sm:tw-text-left tw-pb-6 tw-mb-8 tw-border-b tw-border-solid tw-border-gray-300">
          Reservations
        </div>
        {bookings.length === 0 ? (
          <>
            <div className="tw-font-semibold tw-text-2xl tw-mb-2">Nothing booked yet!</div>
            <div className="tw-mb-5">Browse our collection of curated adventures and get out there.</div>
            <Link
              className="tw-px-5 tw-py-2 tw-border tw-border-solid tw-border-black tw-rounded-lg tw-font-medium"
              href="/"
            >
              Explore trips
            </Link>
          </>
        ) : (
          <div className="tw-flex tw-flex-col tw-gap-4">
            {bookings.map((booking) => (
              <Link key={booking.reference} className="tw-flex tw-text-lg" href={`/reservations/${booking.reference}`}>
                <Image
                  src={booking.booking_image.url}
                  width={booking.booking_image.width}
                  height={booking.booking_image.height}
                  alt="Booking image"
                  sizes="(max-width: 640px) 128px, 192px"
                  placeholder="data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4="
                  tabIndex={-1}
                  className="tw-w-20 sm:tw-w-32"
                />
                <div className="tw-flex tw-flex-col tw-ml-5">
                  <div className="tw-font-bold">
                    {booking.reference} - {booking.listing.name}
                  </div>
                  <div>{booking.listing.location}</div>
                  <div>
                    {getStartTimeString(booking.start_date, booking.start_time, booking.listing.availability_type)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="tw-text-sm tw-w-full tw-text-center sm:tw-text-left tw-pt-6 tw-mt-16 tw-border-t tw-border-solid tw-border-gray-300">
          Can't find your reservation? <HelpButton />
        </div>
      </div>
    </main>
  );
}
