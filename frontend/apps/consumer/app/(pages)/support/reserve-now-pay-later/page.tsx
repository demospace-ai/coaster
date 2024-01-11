export default function Page() {
  return (
    <main className="tw-mt-6 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 tw-pb-16 sm:tw-mt-10 sm:tw-px-20 sm:tw-pb-32">
      <div className="tw-w-full tw-max-w-4xl tw-text-base">
        <h1 className="tw-mb-4 tw-text-4xl tw-font-bold sm:tw-mb-6 sm:tw-text-5xl">Reserve Now, Enjoy Later</h1>
        <h2 className="tw-mb-4 tw-text-2xl tw-font-semibold">Overview</h2>
        <p className="tw-mb-5">
          Our Reserve Now & Pay Later option allows you to secure a spot on without any initial payment! No deposit is
          needed, but you will need to provide an authorized credit card when you make the reservation. A nominal one
          dollar (or the lowest denomination in your currency) authorization fee is charged to verify the card.
        </p>
        <h3 className="tw-mb-4 tw-text-2xl tw-font-semibold">How it Works</h3>
        <ul className="tw-mb-5 tw-list-decimal tw-pl-5 marker:tw-text-xl">
          <li className="tw-mb-4">
            <h4 className="tw-text-xl tw-font-semibold">Find your Dream Trip</h4>
            <p>
              Pick out your desired experience with the comfort of knowing that your reservation is flexible.
              Adjustments can be made if there's a change in plans or weather conditions.
            </p>
          </li>
          <li className="tw-mb-4">
            <h4 className="tw-text-xl tw-font-semibold">Reserve </h4>
            <p>
              Found an exciting trip? Just provide a bit of information, and we'll hold your place for up to four months
              ahead of time. Rest assured, we won't bill you at this point.
            </p>
          </li>
          <li className="tw-mb-4">
            <h4 className="tw-text-xl tw-font-semibold">Decide When to Pay</h4>
            <p>
              You have the flexibility to pay when it suits you, or opt-in for automatic payment which will be processed
              two days before your activity date. A reminder will be sent beforehand, and you have the option to cancel
              without cost up to a full day before the event.
            </p>
          </li>
          <li className="tw-mb-4">
            <h4 className="tw-text-xl tw-font-semibold">Embark on your Adventure!</h4>
            <p>
              With your spot confirmed and your itinerary set, all that's left is to look forward to the experience. Get
              ready to enjoy your adventure or continue to explore more thrilling escapades.
            </p>
          </li>
        </ul>
        <h2 className="tw-mb-4 tw-text-2xl tw-font-semibold">Terms & Conditions</h2>
        <p className="tw-mb-5">
          Payment for your experience will be processed 48 hours in advance, according to Pacific Time (US West Coast).
          For example, if you have scheduled an experience in Mexico City to begin at 1pm on Saturday, October 5, your
          payment will be processed on Thursday, October 3 at 1pm Pacific Time (which is 3pm Mexico City time).
        </p>
        <p className="tw-mb-5">
          If your experience does not have a specific start time, payment will be handled at midnight Pacific Time. For
          instance, if you book an experience in Mexico City for October 5, your payment will be processed around 2am
          Mexico City time on October 3.
        </p>
        <p className="tw-mb-5">
          Enjoy the same prices and promotions as direct bookings. Feel free to apply any valid promotional codes and
          take advantage of discounts available on our site.
        </p>
        <p className="tw-mb-5">
          After booking, your reservation is confirmed. We'll remind you to make the full payment 5 days before your
          travel date, with the full amount due between 2 to 9 days before your journey, depending on the specific
          experience booked.
        </p>
        <p className="tw-mb-5">
          Upon reserving, you'll receive a confirmation email. Your official ticket will be sent once full payment is
          received. You'll then get an email with a link to access your ticket.
        </p>
        <p className="tw-mb-5 tw-italic">*Final payment dates vary with each booking or product.</p>
      </div>
    </main>
  );
}
