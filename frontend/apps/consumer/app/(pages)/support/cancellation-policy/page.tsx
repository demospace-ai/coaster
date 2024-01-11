export default function Page() {
  return (
    <main className="tw-mt-6 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 tw-pb-16 sm:tw-mt-10 sm:tw-px-20 sm:tw-pb-32">
      <div className="tw-w-full tw-max-w-4xl tw-text-base">
        <h1 className="tw-mb-4 tw-text-4xl tw-font-bold sm:tw-mb-6 sm:tw-text-5xl">Cancellation Policy</h1>
        <div>
          <h2 className="tw-mb-4 tw-text-2xl tw-font-semibold">Overview</h2>
          <p className="tw-mb-5">
            Each tour or activity has a specific cancellation policy. Please review and understand the cancellation
            policy applicable to your chosen experience before confirming your booking. You can find this information
            under the "Cancellation Policy" section for each experience. Additionally, existing bookings' policies can
            be checked on the respective tickets.
          </p>
          <p className="tw-mb-5">
            To cancel your booking, please follow the instructions <a href="#">here</a>.
          </p>
          <div>
            <h3 className="tw-mb-4 tw-text-xl tw-font-semibold">Types of Cancellation Policies:</h3>
            <div className="tw-flex tw-flex-col tw-gap-4">
              <div>
                <h4 className="tw-mb-2 tw-text-lg tw-font-semibold">Free Cancellation:</h4>
                <ul className="tw-mb-4 tw-list-disc tw-pl-5">
                  <li>Full Refund: Cancel at least 24 hours before the start time of the experience.</li>
                  <li>No Refund: Cancellations made less than 24 hours before the start time.</li>
                  <li>No Changes: Changes made less than 24 hours before the start time are not accepted.</li>
                </ul>
              </div>
              <div>
                <h4 className="tw-mb-2 tw-text-lg tw-font-semibold">Non-refundable:</h4>
                <p className="tw-mb-4">These experiences cannot be refunded or changed for any reason.</p>
              </div>
              <div>
                <h4 className="tw-mb-2 tw-text-lg tw-font-semibold">Moderate:</h4>
                <ul className="tw-mb-4 tw-list-disc tw-pl-5">
                  <li>Full Refund: Cancel at least 4 full days before the start time of the experience.</li>
                  <li>No Refund: Cancellations made less than 3 full days before the start time.</li>
                  <li>No Changes: Changes made less than 3 full days before the start time are not accepted.</li>
                </ul>
              </div>
              <div>
                <h4 className="tw-mb-2 tw-text-lg tw-font-semibold">Strict:</h4>
                <ul className="tw-mb-4 tw-list-disc tw-pl-5">
                  <li>Full Refund: Cancel at least 7 full days before the start time of the experience.</li>
                  <li>Partial Refund (50%): Cancel 3-6 full days before the start time.</li>
                  <li>No Refund: Cancellations made less than 2 full days before the start time.</li>
                  <li>No Changes: Changes made less than 3 full days before the start time are not accepted.</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="tw-mb-5 tw-italic">Note: Cut-off times are based on the experience's local time.</p>
        </div>
      </div>
    </main>
  );
}
