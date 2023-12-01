"use client";

import { CategoryType } from "@coaster/types";
import { mergeClasses } from "@coaster/utils/common";
import {
  autoUpdate,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useRef, useState } from "react";
import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "../icons/Category";
import { SearchModal } from "./SearchBarModal";

export const SearchBar: React.FC<{ className: string }> = (props) => {
  return (
    <>
      <SearchBarModal {...props} />
      <SearchBarDropdown {...props} show />
    </>
  );
};

export const SearchBarModal: React.FC<{
  className?: string;
  header?: boolean;
}> = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={mergeClasses("tw-flex sm:tw-hidden", !props.header && "tw-w-full tw-justify-center")}>
      <SearchModal open={open} close={() => setOpen(false)} />
      {props.header ? (
        <MagnifyingGlassIcon
          aria-label="Open search"
          role="button"
          className="tw-flex tw-cursor-pointer tw-mr-4 tw-w-6 tw-h-6"
          onClick={() => {
            setOpen(true);
          }}
        />
      ) : (
        <div
          role="search"
          className={mergeClasses(
            "tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[640px] tw-h-14 tw-bg-white tw-shadow-dark-sm tw-p-1.5 tw-rounded-[99px] tw-cursor-pointer",
            props.className,
          )}
          onClick={() => setOpen(true)}
        >
          <MagnifyingGlassIcon className="tw-ml-3 sm:tw-ml-2 tw-w-6 tw-h-6 sm:tw-w-7 sm:tw-h-7 tw-stroke-gray-600" />
          <div className="tw-w-full tw-bg-transparent tw-px-2 tw-text-gray-700 tw-text-lg tw-select-none tw-cursor-pointer">
            Search trips
          </div>
          <div className="tw-hidden tw-px-5 sm:tw-flex tw-items-center tw-rounded-[99px] tw-h-full tw-bg-blue-950 tw-text-white tw-text-base tw-font-medium">
            Search
          </div>
        </div>
      )}
    </div>
  );
};

export const SearchBarDropdown: React.FC<{
  className?: string;
  header?: boolean;
  show?: boolean;
}> = (props) => {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const search = (category: CategoryType) => {
    router.push(`/search?categories=["${category}"]`);
  };
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(10),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
        padding: 10,
      }),
    ],
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role, listNav]);

  const filteredCategories = getSearchableCategories().filter((category) => {
    if (query.length <= 0) {
      return true;
    } else {
      return category.toLowerCase().includes(query.toLowerCase());
    }
  });

  return props.show ? (
    <div className="tw-hidden sm:tw-flex tw-w-full tw-justify-center">
      <div
        role="search"
        className={mergeClasses(
          props.header
            ? "tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[400px] tw-h-9 tw-bg-white tw-ring-1 tw-ring-slate-300 tw-rounded-[99px] tw-cursor-pointer tw-mx-10"
            : "tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[400px] tw-h-14 tw-bg-white tw-shadow-dark-sm tw-p-1.5 tw-rounded-[99px] tw-cursor-pointer",
          props.className,
        )}
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: () => {
            inputRef.current?.focus();
          },
        })}
      >
        {props.header && <MagnifyingGlassIcon className="tw-ml-4 tw-h-5 -tw-mr-1.5 tw-stroke-gray-600" />}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="tw-w-full tw-bg-transparent tw-pl-4 tw-placeholder-gray-700 tw-text-base tw-select-none tw-cursor-text tw-outline-none"
          placeholder="Choose a category"
        />
        {/** Floating element must be div for aria attributes to be correct */}
        <div
          aria-label="Search options"
          className="tw-relative"
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          <form
            onSubmit={() => {
              if (activeIndex) {
                search(filteredCategories[activeIndex]);
              }
            }}
          >
            <Transition
              as={Fragment}
              show={open}
              enter="tw-transition tw-ease-out tw-duration-100 tw-origin-top"
              enterFrom="tw-transform tw-opacity-0 tw-scale-y-80"
              enterTo="tw-transform tw-opacity-100 tw-scale-y-100"
              leave="tw-transition tw-ease-in tw-duration-100 tw-origin-top"
              leaveFrom="tw-transform tw-opacity-100 tw-scale-y-100"
              leaveTo="tw-transform tw-opacity-0 tw-scale-y-0"
            >
              <div className="tw-flex tw-flex-col tw-w-full tw-max-h-96 tw-rounded-2xl tw-overflow-hidden tw-bg-white tw-text-black tw-shadow-lg">
                <div
                  className="tw-pl-4 tw-pt-4 tw-pb-2 tw-font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  Choose your adventure
                </div>
                <div
                  role="listbox"
                  className="tw-flex tw-flex-col tw-gap-2 tw-overflow-auto tw-overscroll-contain tw-p-2 tw-text-sm"
                >
                  {filteredCategories.map((category, idx) => (
                    <Link
                      key={category}
                      ref={(node) => (listRef.current[idx] = node)}
                      className={mergeClasses(
                        "tw-flex tw-flex-row tw-items-center tw-gap-3 tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 hover:tw-bg-slate-50 tw-rounded-lg",
                        idx === activeIndex && "tw-bg-slate-100",
                      )}
                      href={`/search?categories=["${category}"]`}
                    >
                      {getCategoryIcon(category, "tw-h-14 tw-w-14 tw-p-3 tw-bg-gray-100 tw-rounded-lg")}
                      <span className="tw-font-medium">{getCategoryForDisplay(category)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </Transition>
          </form>
        </div>
        {!props.header && (
          <div className="tw-hidden tw-px-5 sm:tw-flex tw-items-center tw-rounded-[99px] tw-h-full tw-bg-blue-950 tw-text-white tw-text-base tw-font-medium">
            Search
          </div>
        )}
      </div>
    </div>
  ) : (
    <></>
  );
};
