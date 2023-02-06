import { Cog6ToothIcon, HomeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import classNames from "classnames";
import { NavLink } from "react-router-dom";
import { DashboardIcon, QuestionCircleIcon } from "src/components/icons/Icons";
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { useSelector } from "src/root/model";
import logo from './logo.png';

export const NavigationBar: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  // No navigation bar whatsoever for login page
  if (!isAuthenticated || !organization) {
    return <></>;
  };

  const route = "tw-inline-block tw-pt-[0.5px] tw-ml-2.5 tw-font-medium";
  const routeContainer = "tw-relative tw-flex tw-flex-row tw-h-9 tw-box-border tw-cursor-pointer tw-items-center tw-text-gray-800 tw-mt-0.5 tw-mb-0.5 tw-mx-2 tw-rounded-md tw-select-none";
  const navLink = "tw-w-full tw-h-full tw-pl-3 tw-rounded-md tw-flex tw-flex-row tw-items-center hover:tw-bg-gray-300";

  return (
    <>
      <div className="tw-min-w-[240px] tw-w-60 tw-h-full tw-flex tw-flex-col tw-box-border tw-border-r tw-border-solid tw-border-gray-200 tw-bg-gray-100">
        <NavLink className="tw-py-4 tw-px-4 tw-flex tw-flex-row tw-h-16 tw-box-border tw-cursor-pointer tw-w-full tw-mb-4" to="/">
          <img src={logo} className='tw-h-6 tw-w-6 tw-justify-center tw-items-center tw-rounded tw-flex tw-my-auto tw-select-none' alt="fabra logo" />
          <div className='tw-my-auto tw-ml-3 tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-bold tw-font-[Montserrat] tw-text-2xl'>
            fabra
          </div>
        </NavLink>
        <div className="tw-mx-4 tw-mb-2 tw-uppercase tw-text-xs tw-text-gray-500 tw-font-medium">
          Overview
        </div>
        <div className={routeContainer}>
          <NavLink className={({ isActive }) => classNames(navLink, isActive && "tw-bg-gray-300")} to={'/'}>
            <HomeIcon className="tw-h-4" strokeWidth="2" />
            <div className={route}>Home</div>
          </NavLink>
        </div>
        <div className={routeContainer}>
          <Tooltip label="Coming soon!">
            <div className={navLink}>
              <UserGroupIcon className="tw-h-4" strokeWidth="2" />
              <div className={route}>Linked Accounts</div>
            </div>
          </Tooltip>
        </div>
        <div className={routeContainer}>
          <Tooltip label="Coming soon!">
            <div className={navLink}>
              <DashboardIcon className="tw-h-4" strokeWidth="2" />
              <div className={route}>Logs</div>
            </div>
          </Tooltip>
        </div>
        <div id="bottomSection" className="tw-mt-auto tw-mb-5">
          <div className={routeContainer}>
            <NavLink className={({ isActive }) => classNames(navLink, isActive && "tw-bg-gray-300")} to="/settings">
              <Cog6ToothIcon className="tw-h-4 tw-ml-[1px] -tw-mr-[0.5px]" strokeWidth="2" />
              <div className={route}>Settings</div>
            </NavLink>
          </div>
          <div className={routeContainer}>
            <a className={navLink} href='mailto:nick@fabra.io?subject=Help with Fabra'>
              <QuestionCircleIcon className="tw-h-[18px] tw-mt-[1px]" strokeWidth="2" />
              <div className={route}>Help</div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};