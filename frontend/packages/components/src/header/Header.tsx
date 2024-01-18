"use client";

import { mergeClasses } from "@coaster/utils/common";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LogoLink, MobileMenu, ProfileDropdown } from "../header/client";
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
    <div
      className={mergeClasses(
        "tw-sticky tw-z-10 tw-top-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-box-border tw-w-full tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white",
        isHome && scrollPosition < 20 && "tw-border-none",
      )}
    >
      <DesktopHeader isHome={isHome} scrollPosition={scrollPosition} />
      <MobileHeader />
    </div>
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
