"use client";

import { NavLink } from "@coaster/components/link/Link";
import { Loading } from "@coaster/components/loading/Loading";
import { useAuthContext, useHostedListings } from "@coaster/rpc/client";
import { ListingStatus, StripeAccountStatus } from "@coaster/types";
import { mergeClasses } from "@coaster/utils/common";
import { CalendarDaysIcon, CheckIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function Hosting() {
  const { user } = useAuthContext();
  const { hosted, error } = useHostedListings();

  const setupStep =
    "tw-py-3 tw-px-4 tw-text-base tw-font-medium tw-bg-white tw-border tw-border-slate-100 tw-rounded-lg tw-flex tw-items-center tw-mb-5 tw-cursor-pointer tw-shadow hover:tw-bg-slate-100 tw-select-none";
  const stepNumber =
    "tw-flex tw-flex-none tw-h-6 tw-w-6 tw-text-sm tw-rounded-full tw-border-2 tw-border-slate-400 tw-flex tw-justify-center tw-items-center tw-mr-4 tw-bg-white";

  if (!hosted) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  const draft = hosted.find((listing) => listing.status === ListingStatus.Draft);
  const listingCreated = hosted && hosted.length > 0;
  const profileComplete = user && user.profile_picture_url;
  const financeComplete = user && user.stripe_account_status === StripeAccountStatus.Complete;

  return (
    <div className="tw-flex tw-justify-center tw-overflow-auto tw-px-8 tw-pb-56 tw-pt-6 sm:tw-pt-12">
      <div className="tw-flex tw-w-full tw-flex-col sm:tw-max-w-3xl">
        <div className="tw-mb-8 tw-text-3xl tw-font-bold">Welcome back, {user?.first_name}!</div>
        {draft && (
          <div className="tw-mb-10 tw-flex tw-w-fit tw-items-center tw-justify-between tw-rounded-xl tw-border tw-border-solid tw-border-slate-300 tw-p-6">
            <div>
              <div className="tw-mb-1 tw-text-xl tw-font-bold">Draft Listing</div>
              <div className="tw-mb-2 tw-text-slate-500">{draft.name ? draft.name : "Untitled"}</div>
              <NavLink href="/listings/new" className="tw-underline">
                Continue where you left off
              </NavLink>
            </div>
            <ExclamationCircleIcon className="tw-ml-2 tw-h-6 tw-text-yellow-600 sm:tw-ml-12" />
          </div>
        )}
        <div className="tw-mb-3 tw-flex tw-flex-col tw-justify-end tw-text-xl tw-font-semibold sm:tw-text-2xl">
          <div className="tw-flex tw-flex-row tw-items-center">
            <div>Setup Checklist</div>
            <CompletionTimeBanner />
          </div>
        </div>
        <div className="tw-mb-6">Complete these steps so that your activities can go live.</div>
        <NavLink className={mergeClasses(setupStep, listingCreated && "tw-line-through")} href="/listings/new">
          <div className={stepNumber}>
            {listingCreated ? <CheckIcon className="tw-m-0.5 tw-w-full tw-stroke-2" /> : 1}
          </div>
          Create your first listing
        </NavLink>
        <NavLink className={mergeClasses(setupStep, profileComplete && "tw-line-through")} href="/profile">
          <div className={stepNumber}>
            {profileComplete ? <CheckIcon className="tw-m-0.5 tw-w-full tw-stroke-2" /> : 2}
          </div>
          Setup your profile to tell travelers about yourself
        </NavLink>
        <NavLink
          className={mergeClasses(setupStep, financeComplete && "tw-line-through")}
          href="/finance/payout-methods"
        >
          <div className={stepNumber}>3</div>
          Add your payment information for payouts
        </NavLink>
        <div className="tw-mt-10 tw-rounded-lg tw-border tw-border-solid tw-border-slate-100 tw-bg-white tw-shadow">
          <div className="tw-px-4 tw-py-5 sm:tw-p-6">
            <h3 className="tw-text-base tw-font-medium tw-leading-6 tw-text-gray-900">Need help?</h3>
            <div className="tw-mt-2 tw-max-w-xl tw-text-sm tw-text-gray-500">
              <p>
                If you have any trouble getting setup, let us know! Our team will help you get everything configured.
              </p>
            </div>
            <div className="tw-mt-5 tw-flex tw-flex-row tw-gap-4">
              <a
                href="https://calendly.com/coaster/onboarding"
                target="_blank"
                rel="noreferrer"
                className="tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-solid tw-border-slate-300 tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-shadow hover:tw-bg-slate-100"
              >
                <CalendarDaysIcon className="tw-mr-2 tw-h-4" />
                Book a call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CompletionTimeBanner: React.FC = () => {
  return (
    <div className="tw-ml-4 tw-rounded-lg tw-bg-blue-50 tw-px-2 tw-py-1">
      <div className="tw-flex">
        <div className="tw-flex-shrink-0">
          <ClockIcon className="tw-h-5 tw-w-5 tw-stroke-2 tw-text-blue-600" aria-hidden="true" />
        </div>
        <div className="tw-ml-2 tw-flex-1 md:tw-flex md:tw-justify-between">
          <p className="tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-blue-700">10 minutes</p>
        </div>
      </div>
    </div>
  );
};
