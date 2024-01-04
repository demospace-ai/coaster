import { RequestTrip } from "app/(pages)/request-trip/client";

export default function Page() {
  return (
    <main className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mt-6 sm:tw-mt-10 tw-pb-16 sm:tw-pb-32">
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w tw-text-base">
        <h1 className="tw-font-bold tw-text-4xl sm:tw-text-5xl tw-mb-4 sm:tw-mb-6">Request a Trip</h1>
        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Looking for something else?</h2>
        <h3>Send us a description of what you're looking for and we'll be in touch within 24 hours!</h3>
        <RequestTrip />
      </div>
    </main>
  );
}
