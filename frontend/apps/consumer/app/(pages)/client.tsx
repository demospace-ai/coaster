"use client";

import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "@coaster/components/icons/Category";
import { Loading } from "@coaster/components/loading/Loading";
import { ProfilePlaceholder } from "@coaster/components/profile/ProfilePicture";
import { SearchResult } from "@coaster/components/search/SearchResult";
import { useFeatured } from "@coaster/rpc/client";
import { CategoryType, Listing } from "@coaster/types";
import { lateef, mergeClasses } from "@coaster/utils/common";
import { Bars3Icon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Dispatch, ReactNode, SetStateAction, useRef, useState } from "react";

export const Featured: React.FC<{ initialData: Listing[] }> = ({ initialData }) => {
  const [category, setCategory] = useState<CategoryType | undefined>(undefined);
  const { featured } = useFeatured(category ? `["${category}"]` : undefined, initialData);
  if (!featured) {
    return (
      <div className="tw-h-[400px] tw-pt-32">
        {/** Needed so scrollbar always remains visible */}
        <Loading />
      </div>
    );
  }

  return (
    <>
      <CategorySelector selected={category} setSelected={setCategory} />
      <div className="tw-w-full">
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-mt-1 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-5 sm:tw-gap-10 tw-w-full">
          {featured?.map((listing: Listing) => <SearchResult key={listing.id} listing={listing} />)}
        </div>
      </div>
    </>
  );
};

const CategorySelector: React.FC<{
  selected: CategoryType | undefined;
  setSelected: Dispatch<SetStateAction<CategoryType | undefined>>;
}> = ({ selected, setSelected }) => {
  const [showBack, setShowBack] = useState(false);
  const [showForward, setShowForward] = useState(true);
  const categorySelectorRef = useRef<HTMLDivElement>(null);
  const categoryIcon =
    "tw-flex tw-flex-col tw-justify-center tw-items-center tw-cursor-pointer tw-select-none tw-box-border tw-pb-2 tw-border-b-2 tw-border-solid tw-border-transparent hover:tw-border-slate-400";

  const setScroll = () => {
    if (categorySelectorRef.current) {
      setShowBack(categorySelectorRef.current.scrollLeft >= 20);
      setShowForward(
        categorySelectorRef.current.scrollWidth - categorySelectorRef.current.scrollLeft - 20 >=
          categorySelectorRef.current.clientWidth,
      );
    }
  };

  const scrollForward = () => {
    if (categorySelectorRef.current) {
      categorySelectorRef.current.scrollBy({
        left: 200,
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollBack = () => {
    if (categorySelectorRef.current) {
      categorySelectorRef.current.scrollBy({
        left: -200,
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="tw-relative tw-flex tw-w-full">
      <div className="tw-absolute tw-top-1/2 -tw-translate-y-1/2 tw-w-full tw-h-full tw-flex tw-items-center tw-pointer-events-none">
        <div
          className="tw-fixed tw-left-0 tw-pr-10 tw-flex tw-items-center tw-overflow-hidden tw-transition-opacity tw-pointer-events-auto"
          style={{
            opacity: showBack ? "100" : "0",
            height: showBack ? "100%" : "0",
            backgroundImage: "linear-gradient(to left, rgb(255 255 255/0), #efedea 40px)",
          }}
        >
          <button
            className="tw-p-1 tw-rounded-full tw-bg-white tw-border tw-border-solid tw-border-slate-300"
            aria-label="Scroll category back"
            onClick={(e) => {
              e.stopPropagation();
              scrollBack();
            }}
          >
            <ChevronLeftIcon className="tw-h-5 tw-cursor-pointer tw-stroke-slate-500" />
          </button>
        </div>
        <div
          className="tw-fixed tw-right-0 tw-pl-10 tw-flex tw-items-center tw-overflow-hidden tw-transition-opacity tw-duration-100 tw-pointer-events-auto"
          style={{
            opacity: showForward ? "100" : "0",
            height: showForward ? "100%" : "0",
            backgroundImage: "linear-gradient(to right, rgb(255 255 255/0), #efedea 40px)",
          }}
        >
          <button
            className="tw-p-1 tw-rounded-full tw-bg-white tw-border tw-border-solid tw-border-slate-300"
            aria-label="Scroll category forward"
            onClick={(e) => {
              e.stopPropagation();
              scrollForward();
            }}
          >
            <ChevronRightIcon className="tw-h-5 tw-cursor-pointer tw-stroke-slate-500" />
          </button>
        </div>
      </div>
      <div
        ref={categorySelectorRef}
        className="tw-flex tw-w-full tw-overflow-auto tw-mt-2 tw-hide-scrollbar tw-mb-2 sm:tw-mb-0"
        onScroll={setScroll}
      >
        <div className="tw-flex tw-h-full tw-flex-1 tw-gap-12 tw-px-2 tw-justify-between tw-pr-10">
          {getSearchableCategories().map((category) => (
            <div
              className={mergeClasses(
                categoryIcon,
                category == selected && "tw-border-slate-900 hover:tw-border-slate-900",
              )}
              key={category}
              aria-label={getCategoryForDisplay(category)}
              onClick={() => setSelected(category)}
            >
              {getCategoryIcon(category)}
              <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">{getCategoryForDisplay(category)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DynamicNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const NotificationProvider = dynamic(() =>
    import("@coaster/components/notifications/Notifications").then((mod) => mod.NotificationProvider),
  );
  return <NotificationProvider>{children}</NotificationProvider>;
};

export const DynamicHeader: React.FC = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const Header = dynamic(() => import("@coaster/components/header/Header").then((mod) => mod.Header), {
    loading: () => (
      <div
        className={mergeClasses(
          "tw-sticky tw-z-10 tw-top-0 tw-flex tw-box-border tw-max-h-[72px] tw-min-h-[72px] sm:tw-max-h-[96px] sm:tw-min-h-[96px] tw-w-full tw-px-4 sm:tw-px-20 tw-py-3 tw-items-center tw-justify-center tw-bg-transparent",
          isHome && "tw-bg-[#efedea] tw-border-[#d3d1ce]",
        )}
      >
        <div className="tw-flex tw-w-full tw-max-w-[1280px] tw-items-center tw-justify-between">
          <div
            className={mergeClasses(
              lateef.className,
              "tw-max-w-[150px] tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-tracking-[-0.5px] tw-mt-[-2px] tw-font-bold tw-text-[48px]",
            )}
          >
            Coaster
          </div>
          <div className="tw-flex tw-shrink-0 tw-justify-end">
            <div className="tw-hidden lg:tw-flex">
              <div className="tw-hidden xl:tw-flex tw-my-auto tw-mr-4 tw-px-4 tw-font-medium ">
                List your experience
              </div>
              <div className="tw-flex tw-select-none tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5">
                <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
                <ProfilePlaceholder width={28} height={28} />
              </div>
            </div>
            <div className="tw-flex lg:tw-hidden tw-items-center">
              <div className="tw-font-medium">Help</div>
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
