import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default async function Reservation({ params }: { params: { bookingReference: string } }) {
  return (
    <main className="tw-flex tw-flex-col tw-items-center tw-pt-20 sm:tw-pt-32">
      <div className="tw-font-bold tw-text-3xl">Success!</div>
      <CheckBadgeIcon className="tw-mt-2 tw-h-20 tw-w-20 tw-fill-green-500" />
      <div className="tw-mt-3 tw-text-lg">Your request to book has been sent.</div>
      <div className="tw-text-lg">
        Booking reference: <span className="tw-font-semibold">{params.bookingReference}</span>
      </div>
      <Link
        className="tw-mt-5 tw-px-5 tw-py-2 tw-border tw-border-solid tw-border-black tw-rounded-lg tw-font-medium"
        href={`/reservations/${params.bookingReference}`}
      >
        View booking
      </Link>
    </main>
  );
}
