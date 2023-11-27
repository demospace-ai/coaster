"use client";

import { PromoBanner } from "@coaster/components/header/Header";
import { ProfilePlaceholder } from "@coaster/components/profile/ProfilePicture";
import { Category } from "@coaster/types";
import { lateef, mergeClasses } from "@coaster/utils/common";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export const DynamicNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const NotificationProvider = dynamic(() =>
    import("@coaster/components/notifications/Notifications").then((mod) => mod.NotificationProvider),
  );
  return <NotificationProvider>{children}</NotificationProvider>;
};

export const DynamicHeader: React.FC = () => {
  const pathname = usePathname();
  const isHome = ["/", "/daytrips", Object.keys(Category).map((category) => `/${category}`)].includes(pathname);

  const Header = dynamic(() => import("@coaster/components/header/Header").then((mod) => mod.Header), {
    loading: () => (
      <div
        className={mergeClasses(
          "tw-sticky tw-z-10 tw-top-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-box-border tw-w-full tw-bg-transparent tw-border-b tw-border-solid tw-border-slate-200",
          isHome && "tw-bg-[#efedea] tw-border-none",
        )}
      >
        <PromoBanner />
        <div className="tw-flex tw-w-[calc(100%-40px)] tw-max-w-7xl tw-max-h-[72px] tw-min-h-[72px] sm:tw-max-h-[96px] sm:tw-min-h-[96px] tw-items-center tw-justify-between">
          <div
            className={mergeClasses(
              lateef.className,
              "tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-tracking-[-0.5px] tw-mt-[-2px] tw-font-bold tw-text-[48px]",
            )}
            translate="no"
          >
            Coaster
          </div>
          {!isHome && (
            <div className="tw-hidden sm:tw-flex tw-items-center tw-w-full tw-max-w-[400px] tw-h-9 tw-ring-1 tw-ring-slate-300 tw-rounded-[99px]">
              <MagnifyingGlassIcon className="tw-ml-4 tw-h-[18px] tw-w-[18.5px] -tw-mr-1.5 tw-stroke-gray-600" />
              <span className="tw-text-gray-700 tw-text-base tw-ml-4">Choose a category</span>
            </div>
          )}
          <div className="tw-flex tw-shrink-0 tw-justify-end">
            <div className="tw-hidden lg:tw-flex tw-items-center">
              <div className="tw-hidden xl:tw-flex tw-mr-4 tw-px-4 tw-mt-[1px] tw-font-medium">Apply as a guide</div>
              <div className="tw-flex tw-select-none tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5">
                <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
                <ProfilePlaceholder width={28} height={28} />
              </div>
            </div>
            <div className="tw-flex lg:tw-hidden tw-items-center">
              <div className="tw-font-medium">Help</div>
              <MagnifyingGlassIcon className="tw-flex tw-cursor-pointer tw-ml-3 tw-w-6 tw-text-gray-500" />
              <Bars3Icon className="tw-w-7 tw-ml-4" />
            </div>
          </div>
        </div>
      </div>
    ),
  });

  return <Header />;
};

export const DynamicLoginModal: React.FC = () => {
  const LoginModal = dynamic(() => import("@coaster/components/login/LoginModal").then((mod) => mod.LoginModal));
  return <LoginModal />;
};

export const DynamicFooter: React.FC = () => {
  const Footer = dynamic(() => import("@coaster/components/footer/Footer").then((mod) => mod.Footer));
  return <Footer />;
};
