import { Menu, Transition } from '@headlessui/react';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { useLogout } from 'src/pages/login/actions';
import { useSelector } from 'src/root/model';

export const Header: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);

  const pathTokens = location.pathname.split('/');
  let page: string;
  switch (pathTokens[1]) {
    case '':
      page = 'Home';
      break;
    case 'customquery':
      page = 'Custom Query';
      break;
    case 'funnel':
      page = `Funnel Report`;
      break;
    case 'insights':
      page = 'Insights';
      break;
    case 'workspacesettings':
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
      <div className="tw-grid tw-grid-cols-2 tw-box-border tw-min-h-[64px] tw-h-16 tw-px-8 tw-py-3 tw-items-center tw-border-b tw-border-solid tw-border-gray-200">
        <div className="tw-text-sm tw-font-semibold tw-select-none">{page}</div>
        <ProfileDropdown />
      </div>
    </>
  );
};

const ProfileDropdown: React.FC = () => {
  const user = useSelector(state => state.login.user);
  const logout = useLogout();
  const menuItem = 'tw-flex tw-items-center tw-py-2 tw-pl-3 tw-pr-5 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded';

  return (
    <div className='tw-flex tw-flex-col tw-justify-center tw-ml-auto'>
      <Menu as="div">
        <Menu.Button className="tw-bg-orange-400 tw-text-white tw-rounded-full tw-w-7 tw-h-7 tw-cursor-pointer tw-select-none">
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
          <Menu.Items className="tw-absolute tw-origin-top-right tw-z-10 tw-right-5 tw-mt-2 tw-mr-2 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none">
            <div className="tw-m-1">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? 'tw-bg-gray-200 tw-text-gray-900' : 'tw-text-gray-700',
                      menuItem
                    )}
                  >
                    <UserCircleIcon className='tw-h-4 tw-inline tw-mr-2 tw-stroke-2' />
                    My Profile
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
                    onClick={logout}
                  >
                    <ArrowRightOnRectangleIcon className='tw-h-4 tw-inline tw-mr-2 tw-stroke-2' />
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