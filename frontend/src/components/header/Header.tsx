import { Menu, Transition } from "@headlessui/react";
import { UserIcon } from "@heroicons/react/20/solid";
import { ArrowRightOnRectangleIcon, Bars3Icon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "src/components/images/logo.svg";
import { MapSearch } from "src/components/maps/MapSearch";
import { useLogout } from "src/pages/login/actions";
import { useSelector } from "src/root/model";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="tw-flex tw-box-border tw-min-h-[96px] tw-max-h-[96px] xs:tw-px-8 sm:tw-px-24 tw-py-3 tw-items-center tw-justify-between tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white">
      <LogoLink />
      <MapSearch onSubmit={(location) => navigate("/search?location=" + location)} />
      <ProfileDropdown />
    </div>
  );
};

const LogoLink: React.FC = () => {
  return (
    <NavLink className="tw-hidden sm:tw-flex tw-flex-row tw-h-fit tw-box-border tw-cursor-pointer tw-w-fit" to="/">
      <img
        src={logo}
        className="tw-h-6 tw-w-6 tw-justify-center tw-items-center tw-rounded tw-flex tw-my-auto tw-select-none"
        alt="fabra logo"
      />
      <div className="tw-my-auto tw-ml-2.5 tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-bold tw-font-[Montserrat] tw-text-2xl">
        fabra
      </div>
    </NavLink>
  );
};

const ProfileDropdown: React.FC = () => {
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  return (
    <div className="tw-hidden sm:tw-flex tw-flex-col tw-justify-center">
      {isAuthenticated ? <SignedInMenu /> : <SignedOutMenu />}
    </div>
  );
};

const SignedInMenu: React.FC = () => {
  const user = useSelector((state) => state.login.user);
  const logout = useLogout();
  const menuItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded";

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            className={classNames(
              "tw-cursor-pointer tw-select-none tw-flex tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5 hover:tw-shadow-md tw-ease-in-out tw-transition-all",
              open && "tw-shadow-md",
            )}
          >
            <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
            <div className="tw-bg-orange-400 tw-text-white tw-rounded-full tw-w-7 tw-h-7 tw-flex tw-justify-center tw-items-center">
              {user!.name.charAt(0)}
            </div>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-75"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-97"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
          >
            <Menu.Items className="tw-absolute tw-origin-top-right tw-z-10 tw-divide-y tw-right-20 tw-mt-2 tw-mr-2 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none tw-w-64">
              <div className="tw-m-2">
                <p className="tw-px-1 tw-pt-2 tw-pb-1 tw-text-xs tw-uppercase">Signed in as</p>
                <Menu.Item>
                  {({ active }) => (
                    <div className={classNames(active && "tw-bg-slate-200 tw-text-slate-900", menuItem, "tw-pl-2")}>
                      <div className="tw-bg-slate-400 tw-text-white tw-rounded-full tw-w-7 tw-h-7 tw-select-none tw-flex tw-items-center tw-justify-center tw-mr-3">
                        {user!.name.charAt(0)}
                      </div>
                      <div className="tw-flex tw-flex-col">
                        <p className="tw-truncate tw-text-sm tw-font-semibold tw-text-slate-900">{user?.name}</p>
                        <p className="tw-truncate tw-text-sm tw-text-slate-900">{user?.email}</p>
                      </div>
                    </div>
                  )}
                </Menu.Item>
              </div>
              <div className="tw-m-2 tw-pt-2">
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={classNames(active && "tw-bg-slate-200 tw-text-slate-900", menuItem)}
                      onClick={logout}
                    >
                      <ArrowRightOnRectangleIcon className="tw-h-4 tw-inline tw-mr-2 tw-stroke-2" />
                      Logout
                    </div>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

const SignedOutMenu: React.FC = () => {
  const navigate = useNavigate();
  const menuItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded";
  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            className={classNames(
              "tw-cursor-pointer tw-select-none tw-flex tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1 hover:tw-shadow-md tw-ease-in-out tw-transition-all",
              open && "tw-shadow-md",
            )}
          >
            <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
            <div className="tw-bg-gray-400 tw-text-white tw-rounded-full tw-w-7 tw-h-7 tw-flex tw-justify-center tw-items-center">
              <UserIcon className="tw-m-1" />
            </div>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-75"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-97"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
          >
            <Menu.Items className="tw-absolute tw-origin-top-right tw-z-10 tw-right-20 tw-mt-2 tw-mr-2 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none tw-w-56">
              <div className="tw-m-2">
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active && "tw-bg-slate-200 tw-text-slate-900",
                        menuItem,
                        "tw-font-semibold",
                      )}
                      onClick={() => navigate("/signup")}
                    >
                      Sign up
                    </div>
                  )}
                </Menu.Item>
              </div>
              <div className="tw-m-2">
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={classNames(active && "tw-bg-slate-200 tw-text-slate-900", menuItem)}
                      onClick={() => navigate("/login")}
                    >
                      Log in
                    </div>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};
