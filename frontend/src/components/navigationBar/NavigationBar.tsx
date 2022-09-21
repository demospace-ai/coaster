import { Menu, Transition } from "@headlessui/react";
import { ChartBarIcon, ChevronDownIcon, CommandLineIcon, PlusCircleIcon, PresentationChartLineIcon } from '@heroicons/react/20/solid';
import { HomeIcon } from '@heroicons/react/24/outline';
import classNames from "classnames";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "src/root/model";
import { Organization } from "src/rpc/api";
import styles from './navigationBar.m.css';

export const NavigationBar: React.FC = () => {
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  // No navigation bar whatsoever for login page
  if (!isAuthenticated || !organization) {
    return <></>;
  };

  return (
    <>
      <div className={styles.navigationBar}>
        <OrganizationButton organization={organization} />
        <NewAnalysisButton />
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/'}>
          <HomeIcon className="tw-h-4" strokeWidth="2" />
          <div className={styles.route}>Home</div>
        </NavLink>
        <div className={styles.helpContainer}>
          <div className={styles.route} >Help</div>
        </div>
      </div>
    </>
  );
};

type OrganizationButtonProps = {
  organization: Organization;
};

const OrganizationButton: React.FC<OrganizationButtonProps> = props => {
  return (
    <Menu as="div" >
      <Menu.Button className="tw-w-full">
        {({ open }) => (
          <div className={classNames(styles.organizationContainer, "hover:tw-bg-navigation-highlight", open && "tw-bg-navigation-highlight")}>
            <div className={styles.organizationIcon}>
              {props.organization!.name.charAt(0)}
            </div>
            <div className={styles.organizationName}>
              {props.organization!.name}
            </div>
            <ChevronDownIcon className="tw-w-4 tw-pt-0" />
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
        <Menu.Items className="tw-z-10 tw-origin-top-left tw-absolute tw-left-3 tw-mt-2 tw-w-56 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
          <div className="tw-py-1">
            <Menu.Item>
              {({ active }) => (
                <NavLink
                  to={'/workspacesettings'}
                  className={classNames(
                    active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                    'tw-block tw-px-4 tw-py-2 tw-text-sm', "tw-cursor-pointer"
                  )}
                >
                  Workspace Settings
                </NavLink>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu >
  );
};

const NewAnalysisButton: React.FC = () => (
  <Menu as="div" className="tw-relative tw-z-0 tw-m-5">
    <Menu.Button className={styles.newAnalysis}>
      <PlusCircleIcon className='tw-h-5 tw-inline-block' />
      <div className="tw-inline-block tw-font-[500] tw-ml-[5px]">New Analysis</div>
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
      <Menu.Items className="tw-origin-top-left tw-absolute tw-top-10 tw-w-fit tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
        <div className="tw-py-1">
          <Menu.Item>
            {({ active }) => (
              <NavLink
                className={classNames(
                  active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                  'tw-flex tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-w-full tw-whitespace-nowrap'
                )}
                to="/funnel"
              >
                <div className="tw-flex tw-flex-col tw-justify-center">
                  <ChartBarIcon className="tw-inline-block tw-h-4 tw-mr-2 tw-scale-x-[-1]" />
                </div>
                Funnel Report
              </NavLink>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <NavLink
                className={classNames(
                  active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                  'tw-flex tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-w-full tw-whitespace-nowrap'
                )}
                to="/"
              >
                <div className="tw-flex tw-flex-col tw-justify-center">
                  <PresentationChartLineIcon className="tw-inline-block tw-h-4 tw-mr-2" />
                </div>
                Trend Report (Coming Soon!)
              </NavLink>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <NavLink
                className={classNames(
                  active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                  'tw-flex tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-w-full tw-whitespace-nowrap'
                )}
                to="/"
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
                Retention Report (Coming Soon!)
              </NavLink>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <NavLink
                className={classNames(
                  active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                  'tw-flex tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-w-full tw-whitespace-nowrap'
                )}
                to="/customquery"
              >
                <div className="tw-flex tw-flex-col tw-justify-center">
                  <CommandLineIcon className="tw-inline-block tw-h-4 tw-mr-2" />
                </div>
                Custom Query
              </NavLink>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);