import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, PlusCircleIcon } from '@heroicons/react/20/solid';
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
        <NavLink className={styles.newQuestion} to={'/newquery'}>
          <PlusCircleIcon className='tw-h-5' />
          <div className={styles.newQuestionText}>New</div>
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? styles.activeRouteContainer : styles.routeContainer} to={'/'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginTop: '1px' }}>
            <path d="M1.20765 13C0.887978 13 0.606785 12.8786 0.364071 12.6359C0.121357 12.3932 0 12.112 0 11.7924V1.20765C0 0.876139 0.121357 0.591985 0.364071 0.355191C0.606785 0.118397 0.887978 0 1.20765 0H11.7924C12.1239 0 12.408 0.118397 12.6448 0.355191C12.8816 0.591985 13 0.876139 13 1.20765V11.7924C13 12.112 12.8816 12.3932 12.6448 12.6359C12.408 12.8786 12.1239 13 11.7924 13H1.20765ZM1.20765 11.7924H11.7924V9.39481H9.23497C8.92714 9.8684 8.52755 10.2325 8.0362 10.487C7.54485 10.7416 7.03279 10.8689 6.5 10.8689C5.96721 10.8689 5.45515 10.7416 4.9638 10.487C4.47245 10.2325 4.07286 9.8684 3.76503 9.39481H1.20765V11.7924ZM6.5 9.80328C6.87887 9.80328 7.21334 9.7204 7.50342 9.55464C7.79349 9.38889 8.1102 9.08698 8.45355 8.64891C8.54827 8.54235 8.65483 8.46243 8.77322 8.40915C8.89162 8.35587 9.04554 8.32924 9.23497 8.32924H11.7924V1.20765H1.20765V8.32924H3.76503C3.95446 8.32924 4.11134 8.35292 4.23566 8.40027C4.35997 8.44763 4.46357 8.53051 4.54645 8.64891C4.8306 9.07514 5.13251 9.37409 5.45219 9.54577C5.77186 9.71744 6.12113 9.80328 6.5 9.80328Z" fill="#323232" />
          </svg>
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
        <Menu.Items className="tw-origin-top-left tw-absolute tw-left-3 tw-mt-2 tw-w-56 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
          <div className="tw-py-1">
            <Menu.Item>
              {({ active }) => (
                <NavLink
                  to={'/settings'}
                  className={classNames(
                    active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                    'tw-block tw-px-4 tw-py-2 tw-text-sm', "tw-cursor-pointer"
                  )}
                >
                  Settings
                </NavLink>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu >
  );
};