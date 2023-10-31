import { NavLink } from "@coaster/components/link/Link";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tw-flex tw-justify-center tw-pt-6 sm:tw-pt-12 tw-pb-24 tw-px-8 tw-overflow-auto">
      <div className="tw-flex tw-flex-col sm:tw-max-w-3xl tw-w-full">
        <div className="tw-mb-8 tw-text-3xl tw-font-bold">Finance</div>
        <div className="tw-flex tw-border-b tw-border-solid tw-border-slate-200 tw-mb-6">
          <NavLink
            href="/finance"
            className="tw-mr-4 tw-pb-3"
            activeClassName="tw-border-b-2 tw-border-solid tw-border-black"
          >
            Payouts
          </NavLink>
          <NavLink
            href="/finance/payout-methods"
            className="tw-mr-4 tw-pb-3"
            activeClassName="tw-border-b-2 tw-border-solid tw-border-black"
          >
            Payout Methods
          </NavLink>
        </div>
        {children}
      </div>
    </div>
  );
}
