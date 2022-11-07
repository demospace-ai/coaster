import { Menu, Transition } from "@headlessui/react";
import { ChartBarIcon, ChevronDownIcon, CommandLineIcon, PresentationChartLineIcon } from '@heroicons/react/20/solid';
import { ChartBarSquareIcon, CheckIcon, Cog6ToothIcon, HomeIcon, PlusIcon, TableCellsIcon, UsersIcon } from '@heroicons/react/24/outline';
import classNames from "classnames";
import { Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CursorRayIcon, DashboardIcon, QuestionCircleIcon } from "src/components/icons/Icons";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { useCreateAnalysis } from "src/pages/insights/actions";
import { useSelector } from "src/root/model";
import { AnalysisType } from "src/rpc/api";
import styles from './navigationBar.m.css';

export const NavigationBar: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  // No navigation bar whatsoever for login page
  if (!isAuthenticated || !organization) {
    return <></>;
  };

  const routeContainer = "tw-relative tw-flex tw-flex-row tw-h-8 tw-box-border tw-cursor-pointer tw-items-center tw-text-gray-800 tw-mt-0 tw-mb-[3px] tw-mx-2 tw-rounded-md tw-select-none";
  const navLink = "tw-w-full tw-h-full tw-pl-3 tw-rounded-md tw-flex tw-flex-row tw-items-center hover:tw-bg-gray-300";

  return (
    <>
      <div className="tw-min-w-[240px] tw-w-60 tw-h-full tw-flex tw-flex-col tw-box-border tw-border-r tw-border-solid tw-border-gray-200 tw-bg-gray-100">
        <OrganizationButton />
        <div className={routeContainer}>
          <NavLink className={({ isActive }) => classNames(navLink, isActive && "tw-bg-gray-300")} to={'/'}>
            <HomeIcon className="tw-h-4" strokeWidth="2" />
            <div className={styles.route}>Home</div>
          </NavLink>
        </div>
        <div className={routeContainer}>
          <NavLink className={({ isActive }) => classNames(navLink, isActive && "tw-bg-gray-300")} to={'/insights'}>
            <ChartBarSquareIcon className="tw-h-4" strokeWidth="2" />
            <div className={styles.route}>Insights</div>
          </NavLink>
          <NewAnalysisButton />
        </div>
        <Tooltip label="Coming soon!">
          <div className={routeContainer}>
            <div className={navLink}>
              <DashboardIcon className="tw-h-4" strokeWidth="2" />
              <div className={styles.route}>Dashboards</div>
            </div>
            <div className="tw-absolute tw-right-1 hover:tw-bg-gray-350 tw-rounded-md tw-p-1">
              <PlusIcon className="tw-h-4" strokeWidth="2" />
            </div>
          </div>
        </Tooltip>
        <Tooltip label="Coming soon!">
          <div className={routeContainer}>
            <div className={navLink}>
              <CursorRayIcon className="tw-h-[18px] -tw-ml-[1px] -tw-mr-[1px]" strokeWidth="1.8" />
              <div className={styles.route}>Events</div>
            </div>
          </div>
        </Tooltip>
        <Tooltip label="Coming soon!">
          <div className={routeContainer}>
            <div className={navLink}>
              <UsersIcon className="tw-h-4 tw-ml-[1px] -tw-mr-[0.5px]" strokeWidth="2" />
              <div className={styles.route}>Users</div>
            </div>
          </div>
        </Tooltip>
        <div id="bottomSection" className="tw-mt-auto tw-mb-5">
          <div className={routeContainer}>
            <a className={navLink} href='mailto:nick@fabra.io?subject=Help with Fabra'>
              <QuestionCircleIcon className="tw-h-[18px] tw-mt-[1px]" strokeWidth="2" />
              <div className={styles.route}>Help</div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const OrganizationButton: React.FC = () => {
  const organization = useSelector(state => state.login.organization);
  const menuItem = 'tw-flex tw-items-center tw-px-2 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded';
  return (
    <Menu as="div" className="tw-mb-3">
      <Menu.Button className="tw-w-full tw-z-10">
        {({ open }) => (
          <div className={classNames("tw-py-4 tw-px-4 tw-flex tw-flex-row tw-h-16 tw-box-border tw-border-b tw-border-solid tw-border-gray-200 tw-cursor-pointer tw-w-full", "hover:tw-bg-gray-300", open && "tw-bg-gray-300")}>
            <div className='tw-h-6 tw-w-6 tw-justify-center tw-items-center tw-rounded tw-bg-purple-500 tw-text-white tw-flex tw-my-auto tw-select-none'>
              {organization!.name.charAt(0)}
            </div>
            <div className='tw-my-auto tw-ml-2.5 tw-text-base tw-text-ellipsis tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-bold'>
              {organization!.name}
            </div>
            <ChevronDownIcon className="tw-h-4 tw-mt-2 tw-ml-auto" />
          </div>
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
      >
        <Menu.Items className="tw-z-20 tw-origin-top-left tw-absolute tw-left-3 -tw-mt-2 tw-w-64 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
          <div className="tw-m-2 tw-divide-y">
            <div className="tw-pb-2">
              <p className="tw-px-1 tw-pt-2 tw-pb-1 tw-text-xs tw-uppercase">Workspaces</p>
              <Menu.Item>
                {({ active }) => (
                  <div className={classNames(
                    active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                    menuItem
                  )}>
                    <div className='tw-h-5 tw-w-5 tw-justify-center tw-items-center tw-rounded tw-bg-gray-500 tw-text-white tw-flex tw-my-auto tw-select-none tw-text-xs'>
                      {organization!.name.charAt(0)}
                    </div>
                    <div className='tw-my-auto tw-ml-2.5 tw-text-base tw-text-ellipsis tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium'>
                      {organization!.name}
                    </div>
                    <CheckIcon className="tw-ml-auto tw-h-4" />
                  </div>
                )}
              </Menu.Item>
            </div>
            <div className="tw-pt-2">
              <Menu.Item>
                {({ active }) => (
                  <NavLink
                    to={'/workspacesettings'}
                    className={classNames(
                      active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                      menuItem
                    )}
                  >
                    <Cog6ToothIcon className="tw-h-4 tw-mr-2" strokeWidth="2" />
                    Workspace Settings
                  </NavLink>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu >
  );
};

const NewAnalysisButton: React.FC = () => {
  const defaultConnectionID = useSelector(state => state.login.organization?.default_data_connection_id);
  const defaultEventSetID = useSelector(state => state.login.organization?.default_event_set_id);
  const createAnalysis = useCreateAnalysis();
  const navigate = useNavigate();

  const menuItem = 'tw-flex tw-items-center tw-px-3 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded tw-whitespace-nowrap';
  return (
    /* Z-index of this menu must be more than other items, but less than the Workspace Settings menu */
    <Menu as="div" className="tw-absolute tw-right-1 tw-z-10">
      <Menu.Button className="hover:tw-bg-gray-350 tw-rounded-md tw-p-1">
        <PlusIcon className='tw-h-4' strokeWidth="2" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
      >
        <Menu.Items className="tw-origin-top-left tw-absolute tw-top-8 tw-w-fit tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
          <div className="tw-m-1">
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                    menuItem
                  )}
                  onClick={async () => {
                    const analysis = await createAnalysis(AnalysisType.Funnel, defaultConnectionID, defaultEventSetID);
                    navigate("/funnel/" + analysis?.id);
                  }}
                >
                  <div className="tw-flex tw-flex-col tw-justify-center">
                    <ChartBarIcon className="tw-inline-block tw-h-4 tw-mr-2 tw-scale-x-[-1]" />
                  </div>
                  Funnel
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                    menuItem
                  )}
                  onClick={async () => {
                    const analysis = await createAnalysis(AnalysisType.Trend, defaultConnectionID, defaultEventSetID);
                    navigate("/trend/" + analysis?.id);
                  }}
                >
                  <div className="tw-flex tw-flex-col tw-justify-center">
                    <PresentationChartLineIcon className="tw-inline-block tw-h-4 tw-mr-2" />
                  </div>
                  Trend
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                    menuItem
                  )}
                >
                  <div className="tw-flex tw-flex-col tw-justify-center">
                    <svg className={classNames('tw-h-[14px] tw-mt-[1px] tw-ml-[2px] tw-mr-2', active ? 'tw-text-gray-900' : 'tw-fill-gray-700')} viewBox="0 0 4900 4900" >
                      <rect width="1000" height="1000" rx="300" />
                      <rect x="3900" width="1000" height="1000" rx="300" />
                      <rect x="2600" width="1000" height="1000" rx="300" />
                      <rect x="1300" width="1000" height="1000" rx="300" />
                      <rect y="3900" width="1000" height="1000" rx="300" />
                      <rect y="2600" width="1000" height="1000" rx="300" />
                      <rect x="1300" y="2600" width="1000" height="1000" rx="300" />
                      <rect y="1300" width="1000" height="1000" rx="300" />
                      <rect x="2600" y="1300" width="1000" height="1000" rx="300" />
                      <rect x="1300" y="1300" width="1000" height="1000" rx="300" />
                    </svg>
                  </div>
                  Retention (Coming Soon!)
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                    menuItem
                  )}
                >
                  <div className="tw-flex tw-flex-col tw-justify-center">
                    <TableCellsIcon className="tw-h-4 tw-mr-2 tw-stroke-2" />
                  </div>
                  Chart Builder (Coming Soon!)
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                    menuItem
                  )}
                  onClick={async () => {
                    const analysis = await createAnalysis(AnalysisType.CustomQuery, defaultConnectionID);
                    navigate("/customquery/" + analysis?.id);
                  }}
                >
                  <div className="tw-flex tw-flex-col tw-justify-center">
                    <CommandLineIcon className="tw-inline-block tw-h-4 tw-mr-2" />
                  </div>
                  Custom Query
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};