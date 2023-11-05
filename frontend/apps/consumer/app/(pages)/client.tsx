"use client";
import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "@coaster/components/icons/Category";
import { ProfilePlaceholder } from "@coaster/components/profile/ProfilePicture";
import { SearchResult } from "@coaster/components/search/SearchResult";
import { useFeatured } from "@coaster/rpc/client";
import { CategoryType, Listing } from "@coaster/types";
import { useIsMobile } from "@coaster/utils/client";
import { lateef, mergeClasses } from "@coaster/utils/common";
import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Dispatch, ReactNode, SetStateAction, useRef, useState } from "react";

export const Featured: React.FC<{ initialData: Listing[] }> = ({ initialData }) => {
  const [category, setCategory] = useState<CategoryType | undefined>(undefined);
  const { listings } = useFeatured(category ? `["${category}"]` : undefined, initialData);

  return (
    <div className="tw-min-h-screen tw-w-full">
      <CategorySelector selected={category} setSelected={setCategory} />
      <div className="tw-w-full">
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-mt-1 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-5 sm:tw-gap-10 tw-w-full">
          {listings ? (
            <>{listings?.map((listing: Listing) => <SearchResult key={listing.id} listing={listing} />)}</>
          ) : (
            <>
              {[1, 2, 3, 4].map((idx) => (
                <LoadingListing key={idx} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingListing: React.FC = () => {
  return (
    <div
      className="tw-flex tw-w-full tw-h-full tw-aspect-square tw-rounded-xl"
      style={{
        backgroundImage:
          "url(data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4=)",
      }}
    />
  );
};

const CategorySelector: React.FC<{
  selected: CategoryType | undefined;
  setSelected: Dispatch<SetStateAction<CategoryType | undefined>>;
}> = ({ selected, setSelected }) => {
  const isMobile = useIsMobile();
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

  const scrollIntoView = () => {
    const headerOffset = isMobile ? 125 : 160;
    const elementPosition = categorySelectorRef.current?.getBoundingClientRect().top || 0;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
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
          <div
            className={mergeClasses(
              categoryIcon,
              selected === undefined && "tw-border-slate-900 hover:tw-border-slate-900",
            )}
            key="featured"
            aria-label="Featured"
            onClick={() => {
              setSelected(undefined);
              scrollIntoView();
            }}
          >
            <StarIcon className="tw-w-10 tw-h-10 tw-stroke-1" />
            <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Featured</span>
          </div>
          {getSearchableCategories().map((category) => (
            <div
              className={mergeClasses(
                categoryIcon,
                category === selected && "tw-border-slate-900 hover:tw-border-slate-900",
              )}
              key={category}
              aria-label={getCategoryForDisplay(category)}
              onClick={() => {
                setSelected(category);
                scrollIntoView();
              }}
            >
              {getCategoryIcon(category)}
              <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2 tw-px-0.5">
                {getCategoryForDisplay(category)}
              </span>
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
          "tw-sticky tw-z-10 tw-top-0 tw-flex tw-box-border tw-max-h-[72px] tw-min-h-[72px] sm:tw-max-h-[96px] sm:tw-min-h-[96px] tw-w-full tw-px-4 sm:tw-px-20 tw-py-3 tw-items-center tw-justify-center tw-bg-transparent tw-border-b tw-border-solid tw-border-slate-200",
          isHome && "tw-bg-[#efedea] tw-border-none",
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
