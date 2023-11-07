import { getBookingServer } from "@coaster/rpc/server";

export default async function Reservation({ params }: { params: { bookingReference: string } }) {
  const booking = await getBookingServer(params.bookingReference);
  if (!booking) {
    return <div>Something unexpected happened.</div>;
  }

  return (
    <main className="tw-flex tw-w-full tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-w-full tw-max-w-[1280px]">
        <div className="tw-font-bold tw-text-xl tw-w-full tw-text-center sm:tw-text-left">{booking.listing_name}</div>
      </div>
    </main>
  );
}
