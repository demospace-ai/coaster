"use client";

import { useLogout, useUserContext } from "@coaster/rpc/client";
import { useDispatch } from "@coaster/state";
import { isProd, lateef, mergeClasses } from "@coaster/utils/common";
import { autoUpdate, offset, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from "../link/Link";
import { Loading } from "../loading/Loading";
import { ProfilePicture } from "../profile/ProfilePicture";
import { SearchBarHeader } from "../search/SearchBar";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={mergeClasses(
        "tw-sticky tw-z-10 tw-top-0 tw-flex tw-box-border tw-max-h-[72px] tw-min-h-[72px] sm:tw-max-h-[96px] sm:tw-min-h-[96px] tw-w-full tw-px-4 sm:tw-px-20 tw-py-3 tw-items-center tw-justify-center tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white",
        isHome && "tw-bg-[#efedea] tw-border-[#d3d1ce]",
        isHome && scrollPosition < 20 && "tw-border-none",
      )}
    >
      <div className="tw-flex tw-w-full tw-max-w-[1280px] tw-items-center tw-justify-between">
        <LogoLink />
        <SearchBarHeader show={!isHome || scrollPosition > 300} /> {/** Pass "show" here so modal is always rendered */}
        <ProfileDropdown />
      </div>
    </div>
  );
};

const LogoLink: React.FC = () => {
  return (
    <div className="tw-flex tw-flex-1 tw-flex-row tw-h-fit tw-box-border tw-w-fit">
      <Link
        className={mergeClasses(
          lateef.className,
          "tw-my-auto tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-tracking-[-0.5px] tw-mt-[-2px] tw-font-extrabold tw-text-[48px]",
        )}
        href="/"
      >
        Coaster
      </Link>
    </div>
  );
};

const ProfileDropdown: React.FC<{ onHostApp?: boolean }> = ({ onHostApp }) => {
  const { user } = useUserContext();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="tw-flex tw-shrink-0 tw-justify-end">
      <div className="tw-hidden lg:tw-flex">
        {!onHostApp && (
          <SwitchToHostingLink
            className={mergeClasses(
              "tw-hidden xl:tw-flex tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm",
              isHome ? "hover:tw-bg-[#dfdfdc]" : "hover:tw-bg-gray-100",
            )}
          />
        )}
        <div className="tw-flex tw-flex-col tw-justify-center">
          {user ? <SignedInMenu onHostApp={onHostApp} /> : <SignedOutMenu />}
        </div>
      </div>
      {/* TODO: make this open an actual menu on mobile */}
      <MobileMenu onHostApp={onHostApp} />
    </div>
  );
};

const SignedInMenu: React.FC<{ onHostApp?: boolean }> = ({ onHostApp }) => {
  const { user } = useUserContext();
  const logout = useLogout();
  const menuItem =
    "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded hover:tw-bg-slate-200 ";
  const navItem =
    "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded hover:tw-bg-slate-200 tw-w-full";

  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    middleware: [offset(4)],
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context, {
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  if (!user) {
    // Should never happen
    return <Loading />;
  }

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            ref={refs.setReference}
            {...getReferenceProps()}
            className={mergeClasses(
              "tw-cursor-pointer tw-select-none tw-flex tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5 hover:tw-shadow-md tw-ease-in-out tw-transition-all",
              open && "tw-shadow-md",
            )}
          >
            <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
            <ProfilePicture url={user.profile_picture_url} name={user.first_name} className="tw-w-7 tw-h-7" />
          </Menu.Button>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <Transition
              as={Fragment}
              enter="tw-transition tw-ease-out tw-duration-100"
              enterFrom="tw-transform tw-opacity-0 tw-scale-95"
              enterTo="tw-transform tw-opacity-100 tw-scale-100"
              leave="tw-transition tw-ease-in tw-duration-75"
              leaveFrom="tw-transform tw-opacity-100 tw-scale-97"
              leaveTo="tw-transform tw-opacity-0 tw-scale-95"
            >
              <Menu.Items
                static
                className="tw-z-10 tw-divide-y tw-mt-2 tw-mr-2 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none tw-w-64"
              >
                <div className="tw-m-2">
                  <p className="tw-px-1 tw-pt-2 tw-pb-1 tw-text-xs tw-uppercase">Signed in as</p>
                  <Menu.Item>
                    <Link className={menuItem} href="/profile">
                      <ProfilePicture
                        url={user.profile_picture_url}
                        name={user.first_name}
                        className="tw-w-7 tw-h-7 tw-mr-3"
                      />
                      <div className="tw-flex tw-flex-col">
                        <p className="tw-truncate tw-text-sm tw-font-semibold tw-text-slate-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="tw-truncate tw-text-sm tw-text-slate-900">{user?.email}</p>
                      </div>
                    </Link>
                  </Menu.Item>
                </div>
                <div className="tw-flex tw-flex-col tw-m-2 tw-pt-2">
                  <Menu.Item>
                    <Link className={navItem} href="/profile">
                      View profile
                    </Link>
                  </Menu.Item>
                </div>
                <div className="tw-flex tw-flex-col tw-m-2 tw-pt-2">
                  <Menu.Item>
                    <Link className={navItem} href="/invite">
                      Invite friends
                    </Link>
                  </Menu.Item>
                </div>
                {!onHostApp && (
                  <div className="tw-flex xl:tw-hidden tw-m-2 tw-pt-2">
                    <Menu.Item>
                      <SwitchToHostingLink className={navItem} />
                    </Menu.Item>
                  </div>
                )}
                <div className="tw-flex tw-flex-col tw-m-2 tw-py-2">
                  <Menu.Item>
                    <div className={navItem} onClick={logout}>
                      <ArrowRightOnRectangleIcon className="tw-h-4 tw-inline tw-mr-2 tw-stroke-2" />
                      Logout
                    </div>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </div>
        </>
      )}
    </Menu>
  );
};

const SignedOutMenu: React.FC = () => {
  const dispatch = useDispatch();
  const buttonStyle =
    "tw-flex tw-justify-center tw-py-2 tw-w-28 tw-cursor-pointer tw-select-none tw-whitespace-nowrap tw-rounded-3xl sm:tw-font-semibold tw-text-base tw-bg-gray-100 hover:tw-bg-gray-200";
  return (
    <div className="tw-flex tw-gap-3">
      <div
        className={mergeClasses(buttonStyle, "tw-text-white tw-bg-gray-900 hover:tw-bg-gray-800")}
        onClick={() => dispatch({ type: "login.openSignup" })}
      >
        Sign up
      </div>
      <div className={buttonStyle} onClick={() => dispatch({ type: "login.openLogin" })}>
        Log in
      </div>
    </div>
  );
};

const MobileMenu: React.FC<{ onHostApp?: boolean }> = ({ onHostApp }) => {
  const dispatch = useDispatch();
  const { user } = useUserContext();
  const logout = useLogout();
  const navItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-base tw-select-none";
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
                    <div className="tw-flex tw-h-full tw-flex-col tw-overflow-y-auto tw-bg-white tw-py-6 tw-shadow-xl">
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
                        {user ? (
                          <div className="tw-h-full">
                            <div className="tw-flex tw-items-center tw-py-2 tw-pl-2">
                              <p className="tw-truncate tw-text-xl tw-font-semibold tw-text-slate-900 tw-select-none">
                                Welcome, {user?.first_name}
                              </p>
                            </div>
                            <Link className={navItem} href="/profile" onClick={() => setOpen(false)}>
                              View profile
                            </Link>
                            <Link className={navItem} href="/invite" onClick={() => setOpen(false)}>
                              Invite friends
                            </Link>
                            {onHostApp ? (
                              <>
                                <Link className={navItem} href="/listings" onClick={() => setOpen(false)}>
                                  Your listings
                                </Link>
                              </>
                            ) : (
                              <SwitchToHostingLink className={navItem} onClick={() => setOpen(false)} />
                            )}
                            <div
                              className={navItem}
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
                                dispatch({ type: "login.openSignup" });
                                setOpen(false);
                              }}
                            >
                              Sign up
                            </div>
                            <div
                              className={buttonStyle}
                              onClick={() => {
                                dispatch({ type: "login.openLogin" });
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

export const SupplierHeader: React.FC = () => {
  return (
    <div className="tw-sticky tw-z-10 tw-top-0 tw-flex tw-box-border tw-max-h-[72px] tw-min-h-[72px] sm:tw-max-h-[96px] sm:tw-min-h-[96px] tw-w-full tw-px-4 sm:tw-px-20 tw-py-3 tw-items-center tw-justify-center tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white">
      <LogoLink />
      <SupplierLinks></SupplierLinks>
      <ProfileDropdown onHostApp={true} />
    </div>
  );
};

const SupplierLinks: React.FC = () => {
  return (
    <div className="tw-flex tw-w-full tw-justify-center">
      <NavLink
        className="tw-hidden lg:tw-flex tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        activeClassName="tw-bg-gray-100"
        href="/"
      >
        Home
      </NavLink>
      <NavLink
        className="tw-hidden lg:tw-flex tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        activeClassName="tw-bg-gray-100"
        href="/listings"
      >
        Listings
      </NavLink>
      <NavLink
        className="tw-hidden lg:tw-flex tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        activeClassName="tw-bg-gray-100"
        href="/finance"
      >
        Finance
      </NavLink>
    </div>
  );
};

const SwitchToHostingLink: React.FC<{
  onClick?: () => void;
  className?: string;
}> = (props) => {
  const { user } = useUserContext();

  const baseLink = isProd() ? "https://supplier.trycoaster.com" : "http://localhost:3030";
  const link = user?.is_host ? baseLink : baseLink + "/listings/new";
  const text = user?.is_host ? "Switch to hosting" : "List your experience";
  return (
    <div className={props.className} onClick={props.onClick}>
      <a href={link}>{text}</a>
    </div>
  );
};
