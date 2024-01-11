import { RequestTrip } from "app/(pages)/request-trip/client";

export default function Page() {
  return (
    <main className="tw-mt-6 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 tw-pb-16 sm:tw-mt-10 sm:tw-px-20 sm:tw-pb-32">
      <div className="tw-max-w tw-flex tw-w-full tw-flex-col tw-items-center tw-text-base">
        <h1 className="tw-mb-4 tw-text-4xl tw-font-bold sm:tw-mb-6 sm:tw-text-5xl">Request a Trip</h1>
        <h2 className="tw-mb-2 tw-text-lg tw-font-semibold">Looking for something else?</h2>
        <h3>Send us a description of what you're looking for and we'll be in touch within 24 hours!</h3>
        <RequestTrip />
      </div>
    </main>
  );
}
