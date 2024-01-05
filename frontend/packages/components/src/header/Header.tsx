"use client";

import { useAuthContext, useLogout } from "@coaster/rpc/client";
import { User } from "@coaster/types";
import { isProd, lateef, mergeClasses } from "@coaster/utils/common";
import { autoUpdate, offset, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { ArrowRightOnRectangleIcon, Bars3Icon, QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { NavLink } from "../link/Link";
import { ProfilePicture, ProfilePlaceholder } from "../profile/ProfilePicture";
import { SearchBarHeader, SearchBarModal } from "../search/SearchBar";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <PromoBanner />
      <div
        className={mergeClasses(
          "tw-sticky tw-z-10 tw-top-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-box-border tw-w-full tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white",
          isHome && scrollPosition < 20 && "tw-border-none",
        )}
      >
        <DesktopHeader isHome={isHome} scrollPosition={scrollPosition} />
        <MobileHeader />
      </div>
    </>
  );
};

const DesktopHeader: React.FC<{ isHome: boolean; scrollPosition: number }> = ({ isHome, scrollPosition }) => {
  return (
    <div className="tw-hidden sm:tw-flex tw-w-[calc(100%-10rem)] tw-max-w-7xl tw-max-h-[96px] tw-min-h-[96px] tw-items-center tw-justify-between">
      <LogoLink />
      <SearchBarHeader show={!isHome || scrollPosition > 300} />
      <ProfileDropdown />
    </div>
  );
};

const MobileHeader: React.FC = () => {
  return (
    <div className="tw-flex sm:tw-hidden tw-w-[calc(100%-2.5rem)] tw-max-w-7xl tw-max-h-[72px] tw-min-h-[72px] tw-items-center tw-justify-between">
      <LogoLink />
      <button
        className="tw-flex tw-my-auto tw-mr-3 tw-py-2 tw-px-1 tw-rounded-lg tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        onClick={() => {
          if ((window as any).Atlas) {
            (window as any).Atlas.chat.openWindow();
          }
        }}
      >
        Help
      </button>
      <SearchBarModal header />
      <MobileMenu />
    </div>
  );
};

export const PromoBanner: React.FC = () => {
  const { openLoginModal, user } = useAuthContext();

  return (
    <>
      <div
        className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-text-base sm:tw-font-medium tw-max-h-[56px] tw-min-h-[56px] tw-w-full tw-items-center tw-justify-center tw-bg-blue-200 tw-cursor-pointer tw-select-none"
        onClick={user ? undefined : () => openLoginModal(true)}
      >
        <span className="tw-font-bold tw-mr-2">Limited Time!</span>
        Sign up to claim $100 credit to use on any trip!
      </div>
    </>
  );
};

const LogoLink: React.FC = () => {
  return (
    <div className="tw-flex tw-flex-1 tw-flex-row tw-h-fit tw-box-border">
      <Link
        className={mergeClasses(
          lateef.className,
          "tw-my-auto tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-tracking-[-0.5px] tw-mt-[-2px] tw-font-extrabold tw-text-[48px]",
        )}
        href="/"
        translate="no"
      >
        Coaster
      </Link>
    </div>
  );
};

const ProfileDropdown: React.FC<{ onHostApp?: boolean }> = ({ onHostApp }) => {
  const { user } = useAuthContext();

  return (
    <div className="tw-flex tw-flex-1 tw-justify-end">
      <div className="tw-flex">
        <button
          className="tw-flex tw-items-center tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-font-medium tw-text-sm hover:tw-bg-gray-100"
          onClick={() => {
            if ((window as any).Atlas) {
              (window as any).Atlas.chat.openWindow();
            }
          }}
        >
          <QuestionMarkCircleIcon className="tw-h-[18px] tw-w-[18px] tw-mr-1" />
          Help
        </button>
        <div className="tw-flex tw-flex-col tw-justify-center tw-shrink-0">
          {user ? <SignedInMenu user={user} onHostApp={onHostApp} /> : <SignedOutMenu />}
        </div>
      </div>
    </div>
  );
};

const SignedInMenu: React.FC<{ user: User; onHostApp?: boolean }> = ({ user, onHostApp }) => {
  const logout = useLogout(onHostApp);
  const menuItem =
    "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded hover:tw-bg-slate-100";
  const navItem =
    "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-my-1 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded hover:tw-bg-slate-100 tw-w-full";

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

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            aria-label="Profile button"
            ref={refs.setReference}
            {...getReferenceProps()}
            className={mergeClasses(
              "tw-cursor-pointer tw-select-none tw-flex tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5 hover:tw-shadow-md tw-ease-in-out tw-transition-all",
              open && "tw-shadow-md",
            )}
          >
            <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
            <ProfilePicture url={user.profile_picture_url} name={user.first_name} width={28} height={28} />
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
                className="tw-z-10 tw-divide-y tw-mt-2 tw-mr-2 tw-rounded-md tw-shadow-lg tw-bg-white focus:tw-outline-none tw-w-64"
              >
                <div className="tw-m-2">
                  <p className="tw-px-1 tw-pt-2 tw-pb-1 tw-text-xs tw-uppercase">Signed in as</p>
                  <Menu.Item>
                    <Link className={menuItem} href="/profile">
                      <ProfilePicture
                        url={user.profile_picture_url}
                        name={user.first_name}
                        className="tw-mr-3"
                        width={28}
                        height={28}
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
                  {!onHostApp && (
                    <Menu.Item>
                      <Link className={navItem} href="/reservations">
                        Your reservations
                      </Link>
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    <Link className={navItem} href="/profile">
                      View profile
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link className={navItem} href="/invite">
                      Invite friends
                    </Link>
                  </Menu.Item>
                </div>
                <div className="tw-flex tw-m-2 tw-pt-2">
                  <Menu.Item>
                    {onHostApp ? (
                      <SwitchToCustomerSiteLink className={navItem} />
                    ) : (
                      <SwitchToHostingLink className={navItem} />
                    )}
                  </Menu.Item>
                </div>
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
  const { openLoginModal } = useAuthContext();
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

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            aria-label="Profile button"
            ref={refs.setReference}
            {...getReferenceProps()}
            className={mergeClasses(
              "tw-cursor-pointer tw-select-none tw-flex tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5 hover:tw-shadow-md tw-ease-in-out tw-transition-all",
              open && "tw-shadow-md",
            )}
          >
            <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
            <ProfilePlaceholder width={28} height={28} />
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
                <div className="tw-flex tw-flex-col tw-m-2 tw-pt-2 tw-font-semibold">
                  <Menu.Item>
                    <div className={navItem} onClick={() => openLoginModal()}>
                      Sign up
                    </div>
                  </Menu.Item>
                </div>
                <div className="tw-flex tw-flex-col tw-m-2 tw-py-2">
                  <Menu.Item>
                    <div className={navItem} onClick={() => openLoginModal(true)}>
                      Log in
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

const MobileMenu: React.FC<{ onHostApp?: boolean }> = ({ onHostApp }) => {
  const { user, openLoginModal } = useAuthContext();
  const logout = useLogout(onHostApp);
  const navItem = "tw-flex tw-items-center tw-py-2 tw-pl-2 tw-text-base tw-select-none";
  const [open, setOpen] = useState(false);
  const buttonStyle =
    "tw-flex tw-justify-center tw-py-2 tw-w-full tw-cursor-pointer tw-select-none tw-whitespace-nowrap tw-rounded-3xl sm:tw-font-semibold tw-text-base tw-bg-gray-100 hover:tw-bg-gray-200";

  return (
    <div className="tw-flex tw-items-center">
      <Bars3Icon className="tw-w-7" onClick={() => setOpen(true)} />
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="tw-relative tw-z-30" onClose={setOpen}>
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
                          <div className="tw-flex tw-flex-col tw-h-full">
                            <div className="tw-flex tw-items-center tw-py-2 tw-pl-2">
                              <p className="tw-truncate tw-text-xl tw-font-semibold tw-text-slate-900 tw-select-none">
                                Welcome, {user?.first_name}
                              </p>
                            </div>
                            {!onHostApp && (
                              <Link className={navItem} href="/reservations" onClick={() => setOpen(false)}>
                                Your Reservations
                              </Link>
                            )}
                            <Link className={navItem} href="/profile" onClick={() => setOpen(false)}>
                              View profile
                            </Link>
                            <Link className={navItem} href="/invite" onClick={() => setOpen(false)}>
                              Invite friends
                            </Link>
                            {onHostApp ? (
                              <Link className={navItem} href="/listings" onClick={() => setOpen(false)}>
                                Your listings
                              </Link>
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
                            {onHostApp && (
                              <SwitchToCustomerSiteLink
                                className={mergeClasses(navItem, "tw-mt-auto")}
                                onClick={() => setOpen(false)}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="tw-flex tw-flex-col tw-gap-4">
                            <div
                              className={mergeClasses(buttonStyle, "tw-text-white tw-bg-gray-900 hover:tw-bg-gray-800")}
                              onClick={() => {
                                openLoginModal();
                                setOpen(false);
                              }}
                            >
                              Sign up
                            </div>
                            <div
                              className={buttonStyle}
                              onClick={() => {
                                openLoginModal(true);
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
    </div>
  );
};

export const SupplierHeader: React.FC = () => {
  return (
    <div className="tw-sticky tw-z-10 tw-top-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-box-border tw-w-full tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white">
      <SupplierDesktopHeader />
      <SupplierMobileHeader />
    </div>
  );
};

const SupplierDesktopHeader: React.FC = () => {
  return (
    <div className="tw-hidden sm:tw-flex tw-w-[calc(100%-10rem)] tw-max-w-7xl tw-max-h-[96px] tw-min-h-[96px] tw-items-center tw-justify-between">
      <LogoLink />
      <SupplierLinks />
      <ProfileDropdown onHostApp />
    </div>
  );
};

const SupplierMobileHeader: React.FC = () => {
  return (
    <div className="tw-flex sm:tw-hidden tw-w-[calc(100%-2.5rem)] tw-max-w-7xl tw-max-h-[72px] tw-min-h-[72px] tw-items-center tw-justify-between">
      <LogoLink />
      <button
        className="tw-flex tw-my-auto tw-py-2 tw-px-4 tw-rounded-lg tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        onClick={() => {
          if ((window as any).Atlas) {
            (window as any).Atlas.chat.openWindow();
          }
        }}
      >
        Help
      </button>
      <SupplierLinks />
      <MobileMenu onHostApp />
    </div>
  );
};

const SupplierLinks: React.FC = () => {
  return (
    <div className="tw-hidden sm:tw-flex tw-w-full tw-justify-center">
      <NavLink
        className="tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        activeClassName="tw-bg-gray-100"
        href="/"
      >
        Home
      </NavLink>
      <NavLink
        className="tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        activeClassName="tw-bg-gray-100"
        href="/listings"
        fullMatch={false}
      >
        Listings
      </NavLink>
      <NavLink
        className="tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-rounded-lg tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-font-medium tw-text-sm hover:tw-bg-gray-100"
        activeClassName="tw-bg-gray-100"
        href="/finance"
        fullMatch={false}
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
  const { user } = useAuthContext();

  const baseLink = isProd() ? "https://supplier.trycoaster.com" : "http://localhost:3030";
  const link = user?.is_host ? baseLink : baseLink + "/listings/new";
  const text = user?.is_host ? "Switch to hosting" : "Apply as a guide";
  return (
    <Link className={props.className} onClick={props.onClick} href={link}>
      {text}
    </Link>
  );
};

const SwitchToCustomerSiteLink: React.FC<{
  onClick?: () => void;
  className?: string;
}> = (props) => {
  const link = isProd() ? "https://trycoaster.com" : "http://localhost:3000";
  return (
    <Link className={props.className} onClick={props.onClick} href={link}>
      Switch to customer site
    </Link>
  );
};
