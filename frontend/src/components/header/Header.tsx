import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchBar } from 'src/components/searchbar/SearchBar';
import { useDispatch, useSelector } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { Logout } from 'src/rpc/api';
import styles from './header.m.css';

export const Header: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  let page: string;
  switch (location.pathname) {
    case '/':
      page = 'Inbox';
      break;
    case '/tasks':
      page = 'My Tasks';
      break;
    case '/allquestions':
      page = 'All Questions';
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
        <div className={styles.searchBarContainer}>
          <SearchBar />
        </div>
        <ProfileDropdown />
      </div>
    </>
  );
};

const ProfileDropdown: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const dispatch = useDispatch();

  const logout = async () => {
    await sendRequest(Logout);
    dispatch({
      type: 'login.logout',
    });
  };
  return (
    <Menu as="div" className="tw-relative tw-inline-block tw-text-left tw-ml-auto tw-z-10">
      <div>
        <Menu.Button className={styles.profileIcon}>
          {user!.first_name.charAt(0)}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="tw-origin-top-right tw-absolute tw-right-0 tw-mt-2 tw-w-56 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
          <div className="tw-py-1">
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                    'tw-block tw-px-4 tw-py-2 tw-text-sm', "tw-cursor-pointer"
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
                    'tw-block tw-px-4 tw-py-2 tw-text-sm', "tw-cursor-pointer"
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
  );
};