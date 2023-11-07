import { getBookingsServer } from "@coaster/rpc/server";
import { HelpButton } from "app/(pages)/reservations/client";
import Link from "next/link";

export default async function Reservations() {
  const bookings = await getBookingsServer();
  if (!bookings) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <main className="tw-flex tw-w-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-font-semibold tw-text-3xl tw-w-full tw-text-center sm:tw-text-left tw-pb-6 tw-mb-8 tw-border-b tw-border-solid tw-border-gray-300">
          Reservations
        </div>
        {bookings.map((booking) => (
          <Link key={booking.reference} className="tw-w-full tw-text-lg" href={`/reservations/${booking.reference}`}>
            {booking.reference} - {booking.listing_name}
          </Link>
        ))}
        <div className="tw-text-sm tw-w-full tw-text-center sm:tw-text-left tw-pt-6 tw-mt-16 tw-border-t tw-border-solid tw-border-gray-300">
          Can't find your reservation? <HelpButton />
        </div>
      </div>
    </main>
  );
}
