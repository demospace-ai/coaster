import { NavLink, Outlet } from "react-router-dom";
import { mergeClasses } from "src/utils/twmerge";

export const FinanceLayout: React.FC = () => {
  return (
    <div className="tw-flex tw-justify-center tw-pt-6 sm:tw-pt-12 tw-pb-24 tw-px-8 tw-overflow-auto">
      <div className="tw-flex tw-flex-col sm:tw-max-w-3xl tw-w-full">
        <div className="tw-mb-8 tw-text-3xl tw-font-bold">Finance</div>
        <div className="tw-flex tw-border-b tw-border-solid tw-border-slate-200 tw-mb-6">
          <NavLink
            to=""
            end
            className={({ isActive }) =>
              mergeClasses("tw-mr-4 tw-pb-3", isActive && "tw-border-b-2 tw-border-solid tw-border-black")
            }
          >
            Payouts
          </NavLink>
          <NavLink
            to="payout-methods"
            end
            className={({ isActive }) =>
              mergeClasses("tw-mr-4 tw-pb-3", isActive && "tw-border-b-2 tw-border-solid tw-border-black")
            }
          >
            Payout Methods
          </NavLink>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
