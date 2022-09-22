import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { useLogout } from 'src/pages/login/actions';
import { useSelector } from 'src/root/model';
import styles from './header.m.css';

export const Header: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  let page: string;
  switch (location.pathname) {
    case '/':
      page = 'Home';
      break;
    case '/customquery':
      page = 'Custom Query';
      break;
    case '/funnel':
      page = 'Funnel Report';
      break;
    case '/insights':
      page = 'Insights';
      break;
    case '/workspacesettings':
      page = 'Workspace Settings';
      break;
    default:
      page = '';
  }

  // No header whatsoever for login and home page
  if (!isAuthenticated || !organization) {
    return <></>;
  };

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.pageTitle}>{page}</div>
        <ProfileDropdown />
      </div>
    </>
  );
};

const ProfileDropdown: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const logout = useLogout();

  return (
    <div className='tw-flex tw-flex-col tw-justify-center tw-ml-auto'>
      <Menu as="div">
        <Menu.Button className={styles.profileIcon}>
          {user!.first_name.charAt(0)}
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
          <Menu.Items className="tw-origin-top-right tw-z-10 tw-absolute tw-right-5 tw-mt-2 tw-w-40 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
            <div className="tw-py-1">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                      'tw-block tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none'
                    )}
                  >
                    My Profile
                  </div>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                      'tw-block tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none'
                    )}
                    onClick={logout}
                  >
                    Logout
                  </div>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};