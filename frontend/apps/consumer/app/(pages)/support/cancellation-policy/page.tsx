export default function Page() {
  return (
    <main className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mt-6 sm:tw-mt-10 tw-pb-16 sm:tw-pb-32">
      <div className="tw-w-full tw-max-w-4xl tw-text-base">
        <h1 className="tw-font-bold tw-text-4xl sm:tw-text-5xl tw-mb-4 sm:tw-mb-6">Cancellation Policy</h1>
        <div>
          <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Overview</h2>
          <p className="tw-mb-5">
            Each tour or activity has a specific cancellation policy. Please review and understand the cancellation
            policy applicable to your chosen experience before confirming your booking. You can find this information
            under the &quot;Cancellation Policy&quot; section for each experience. Additionally, existing bookings&apos;
            policies can be checked on the respective tickets.
          </p>
          <p className="tw-mb-5">
            To cancel your booking, please follow the instructions <a href="#">here</a>.
          </p>
          <div>
            <h3 className="tw-text-xl tw-font-semibold tw-mb-4">Types of Cancellation Policies:</h3>
            <div className="tw-flex tw-flex-col tw-gap-4">
              <div>
                <h4 className="tw-text-lg tw-font-semibold tw-mb-2">Free Cancellation:</h4>
                <ul className="tw-list-disc tw-pl-5 tw-mb-4">
                  <li>Full Refund: Cancel at least 24 hours before the start time of the experience.</li>
                  <li>No Refund: Cancellations made less than 24 hours before the start time.</li>
                  <li>No Changes: Changes made less than 24 hours before the start time are not accepted.</li>
                </ul>
              </div>
              <div>
                <h4 className="tw-text-lg tw-font-semibold tw-mb-2">Non-refundable:</h4>
                <p className="tw-mb-4">These experiences cannot be refunded or changed for any reason.</p>
              </div>
              <div>
                <h4 className="tw-text-lg tw-font-semibold tw-mb-2">Moderate:</h4>
                <ul className="tw-list-disc tw-pl-5 tw-mb-4">
                  <li>Full Refund: Cancel at least 4 full days before the start time of the experience.</li>
                  <li>No Refund: Cancellations made less than 3 full days before the start time.</li>
                  <li>No Changes: Changes made less than 3 full days before the start time are not accepted.</li>
                </ul>
              </div>
              <div>
                <h4 className="tw-text-lg tw-font-semibold tw-mb-2">Strict:</h4>
                <ul className="tw-list-disc tw-pl-5 tw-mb-4">
                  <li>Full Refund: Cancel at least 7 full days before the start time of the experience.</li>
                  <li>Partial Refund (50%): Cancel 3-6 full days before the start time.</li>
                  <li>No Refund: Cancellations made less than 2 full days before the start time.</li>
                  <li>No Changes: Changes made less than 3 full days before the start time are not accepted.</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="tw-italic tw-mb-5">Note: Cut-off times are based on the experience&apos;s local time.</p>
        </div>
      </div>
    </main>
  );
}
