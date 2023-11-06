import { getBookingsServer } from "@coaster/rpc/server";

export default async function Reservations() {
  const bookings = await getBookingsServer();
  if (!bookings) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <div className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-font-bold tw-text-xl tw-w-full tw-text-center sm:tw-text-left">Reservations</div>
        {bookings.map((booking) => (
          <div key={booking.id} className="tw-text-center tw-text-lg">
            {booking.id} - {booking.listing_name}
          </div>
        ))}
      </div>
    </div>
  );
}
