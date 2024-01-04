import { RequestTrip } from "app/(pages)/request-trip/client";

export default function Page() {
  return (
    <main className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mt-6 sm:tw-mt-10 tw-pb-16 sm:tw-pb-32">
      <div className="tw-w-full tw-max-w-4xl tw-text-base">
        <h1 className="tw-font-bold tw-text-4xl sm:tw-text-5xl tw-mb-4 sm:tw-mb-6">Request a Trip</h1>
        <h2 className="tw-text-lg tw-font-semibold tw-mb-1">Looking for something else?</h2>
        <RequestTrip />
      </div>
    </main>
  );
}
