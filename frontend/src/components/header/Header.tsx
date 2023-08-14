import { Dialog, Menu, Transition } from "@headlessui/react";
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { Fragment, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MapSearch } from "src/components/maps/Maps";
import { useLogout } from "src/pages/login/actions";
import { useSelector } from "src/root/model";
import { useHostedListings } from "src/rpc/data";
import { mergeClasses } from "src/utils/twmerge";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="tw-sticky tw-z-10 tw-top-0 tw-flex tw-box-border tw-max-h-[72px] tw-min-h-[72px] sm:tw-max-h-[96px] sm:tw-min-h-[96px] tw-w-full tw-px-5 xs:tw-px-8 sm:tw-px-20 tw-py-3 tw-items-center tw-justify-between tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white">
      <LogoLink />
      <MapSearch onSubmit={(location) => navigate("/search?location=" + location)} />
      <ProfileDropdown />
    </div>
  );
};

const LogoLink: React.FC = () => {
  return (
    <div className="tw-flex tw-flex-1 tw-flex-row tw-h-fit tw-box-border tw-w-fit">
      <NavLink
        className="tw-my-auto tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-tracking-[-0.5px] tw-mt-[-2px] tw-font-extrabold tw-font-[Lateef] tw-text-[48px]"
        to="/"
      >
        Coaster
      </NavLink>
    </div>
  );
};

const ProfileDropdown: React.FC = () => {
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  const { hosted } = useHostedListings();
  return (
    <div className="tw-flex sm:tw-flex-[0.5_0.5_0%] lg:tw-flex-1 tw-justify-end">
      <div className="tw-hidden lg:tw-flex">
        {hosted && hosted.length > 0 ? (
          <NavLink
            className="tw-hidden xl:tw-flex tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
            to="/hosting"
          >
            Switch to hosting
          </NavLink>
        ) : (
          <NavLink
            className="tw-hidden xl:tw-flex tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
            to="/listings/new"
          >
            List your experience
          </NavLink>
        )}
        <div className="tw-flex tw-flex-col tw-justify-center">
          {isAuthenticated ? <SignedInMenu /> : <SignedOutMenu />}
        </div>
      </div>
      {/* TODO: make this open an actual menu on mobile */}
      <MobileMenu />
    </div>
  );
};

const SignedInMenu: React.FC = () => {
  const user = useSelector((state) => state.login.user);
  const { hosted } = useHostedListings();
  const logout = useLogout();
  const menuItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded";
  const navItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded";

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
                  {hosted && hosted.length > 0 ? (
                    <NavLink className={navItem} to="/hosting">
                      Switch to hosting
                    </NavLink>
                  ) : (
                    <NavLink className={navItem} to="/listings/new">
                      List your experience
                    </NavLink>
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
  const buttonStyle =
    "tw-flex tw-justify-center tw-py-2 tw-w-28 tw-cursor-pointer tw-select-none tw-whitespace-nowrap tw-rounded-3xl sm:tw-font-semibold tw-text-base tw-bg-gray-100 hover:tw-bg-gray-200";
  return (
    <div className="tw-flex tw-gap-3">
      <div
        className={mergeClasses(buttonStyle, "tw-text-white tw-bg-gray-900 hover:tw-bg-gray-800")}
        onClick={() => navigate("/signup")}
      >
        Sign up
      </div>
      <div className={buttonStyle} onClick={() => navigate("/login")}>
        Log in
      </div>
    </div>
  );
};

const MobileMenu: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  const { hosted } = useHostedListings();
  const user = useSelector((state) => state.login.user);
  const logout = useLogout();
  const menuItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-select-none tw-rounded";
  const navItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-select-none";
  const [open, setOpen] = useState(false);
  const buttonStyle =
    "tw-flex tw-justify-center tw-py-2 tw-w-full tw-cursor-pointer tw-select-none tw-whitespace-nowrap tw-rounded-3xl sm:tw-font-semibold tw-text-base tw-bg-gray-100 hover:tw-bg-gray-200";

  return (
    <>
      <Bars3Icon className="tw-flex lg:tw-hidden tw-w-7 tw-ml-4" onClick={() => setOpen(true)} />
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="tw-relative tw-z-10" onClose={setOpen}>
          <div className="tw-fixed tw-inset-0 tw-overflow-hidden">
            <div className="tw-absolute tw-inset-0 tw-overflow-hidden">
              <div className="tw-pointer-events-none tw-fixed tw-inset-y-0 tw-right-0 tw-flex tw-max-w-full tw-pl-10 sm:tw-pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
                  enterFrom="tw-translate-x-full"
                  enterTo="tw-translate-x-0"
                  leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
                  leaveFrom="tw-translate-x-0"
                  leaveTo="tw-translate-x-full"
                >
                  <Dialog.Panel className="tw-pointer-events-auto tw-w-screen tw-max-w-2xl">
                    <div className="tw-flex tw-h-full tw-flex-col tw-overflow-y-scroll tw-bg-white tw-py-6 tw-shadow-xl">
                      <div className="tw-px-4 sm:tw-px-6">
                        <div className="tw-flex tw-items-start tw-justify-between">
                          <div className="tw-ml-1 tw-flex tw-h-7 tw-items-center">
                            <button
                              type="button"
                              className="tw-relative tw-text-gray-400 tw-outline-none"
                              onClick={() => setOpen(false)}
                            >
                              <span className="tw-sr-only">Close panel</span>
                              <XMarkIcon className="tw-h-6 tw-w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="tw-relative tw-mt-6 tw-h-full tw-px-4 sm:tw-px-6">
                        {isAuthenticated ? (
                          <div className="tw-h-full">
                            <div className={menuItem}>
                              <p className="tw-truncate tw-text-lg tw-font-semibold tw-text-slate-900">
                                Welcome, {user?.name}
                              </p>
                            </div>
                            {hosted && hosted.length > 0 ? (
                              <NavLink className={navItem} to="/hosting">
                                Switch to hosting
                              </NavLink>
                            ) : (
                              <NavLink className={navItem} to="/listings/new">
                                List your experience
                              </NavLink>
                            )}
                            <div
                              className={mergeClasses(buttonStyle, "tw-mt-10")}
                              onClick={() => {
                                logout();
                                setOpen(false);
                              }}
                            >
                              Logout
                            </div>
                          </div>
                        ) : (
                          <div className="tw-flex tw-flex-col tw-gap-4">
                            <div
                              className={mergeClasses(buttonStyle, "tw-text-white tw-bg-gray-900 hover:tw-bg-gray-800")}
                              onClick={() => {
                                navigate("/signup");
                                setOpen(false);
                              }}
                            >
                              Sign up
                            </div>
                            <div
                              className={buttonStyle}
                              onClick={() => {
                                navigate("/login");
                                setOpen(false);
                              }}
                            >
                              Log in
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
