"use client";

import React from "react";
import { LogoLink, MobileMenu, ProfileDropdown } from "../header/client";
import { NavLink } from "../link/Link";

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
