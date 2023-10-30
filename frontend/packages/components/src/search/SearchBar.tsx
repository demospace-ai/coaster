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
import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useRef, useState } from "react";
import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "../icons/Category";

export const SearchBar: React.FC<{ className: string }> = (props) => {
  return (
    <>
      <SearchBarModal {...props} show />
      <SearchBarDropdown {...props} show />
    </>
  );
};

export const SearchBarHeader: React.FC<{
  show?: boolean;
  className?: string;
}> = (props) => {
  return (
    <>
      <SearchBarModal {...props} header />
      <SearchBarDropdown {...props} header />
    </>
  );
};

const SearchBarModal: React.FC<{
  className?: string;
  header?: boolean;
  show?: boolean;
}> = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={mergeClasses("tw-flex sm:tw-hidden", !props.header && "tw-w-full tw-justify-center")}>
      <SearchModal open={open} close={() => setOpen(false)} />
      {props.show &&
        (props.header ? (
          <MagnifyingGlassIcon
            aria-label="Open search"
            role="button"
            className="tw-flex tw-cursor-pointer tw-ml-3 tw-w-6 tw-text-gray-500"
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
            <MagnifyingGlassIcon className="tw-ml-3 sm:tw-ml-2 tw-h-6 sm:tw-h-7 tw-stroke-gray-600" />
            <div className="tw-w-full tw-bg-transparent tw-px-2 tw-text-gray-700 tw-text-lg tw-select-none tw-cursor-pointer">
              Search trips
            </div>
            <div className="tw-hidden tw-px-5 sm:tw-flex tw-items-center tw-rounded-[99px] tw-h-full tw-bg-blue-950 tw-text-white tw-text-base tw-font-medium">
              Search
            </div>
          </div>
        ))}
    </div>
  );
};

const SearchBarDropdown: React.FC<{
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
            ? "tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[400px] tw-h-9 tw-bg-white tw-ring-1 tw-ring-slate-300 tw-rounded-[99px] tw-cursor-pointer"
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
        <div className="tw-relative" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
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

const SearchModal: React.FC<{ open: boolean; close: () => void }> = ({ open, close }) => {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog onClose={close} className="tw-relative tw-z-[100]" initialFocus={buttonRef}>
        <Transition.Child
          as={Fragment}
          enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-100"
          enterFrom="tw-opacity-0"
          enterTo="tw-opacity-100"
          leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-100"
          leaveFrom="tw-opacity-100"
          leaveTo="tw-opacity-0"
        >
          <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-30" />
        </Transition.Child>
        <div className="tw-fixed tw-inset-x-0 tw-bottom-0 tw-h-[90svh] sm:tw-h-screen">
          <Transition.Child
            as={Fragment}
            enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-ease-in sm:tw-duration-100"
            enterFrom="tw-translate-y-full sm:tw-scale-95"
            enterTo="tw-translate-y-0 sm:tw-scale-100"
            leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-ease-in sm:tw-duration-100"
            leaveFrom="tw-translate-y-0 sm:tw-scale-100"
            leaveTo="tw-translate-y-full sm:tw-scale-95"
          >
            <Dialog.Panel className="sm:tw-absolute sm:sm:tw-top-[48%] tw-w-screen sm:tw-w-[500px] sm:tw-h-[70vh] sm:tw-max-h-[700px] sm:tw-left-1/2 sm:-tw-translate-x-1/2 sm:-tw-translate-y-1/2 tw-flex tw-flex-col tw-bg-white tw-shadow-md tw-rounded-t-xl sm:tw-rounded-xl tw-h-full tw-items-center tw-justify-start tw-overflow-clip">
              <div className="tw-flex tw-w-full tw-items-center tw-justify-between tw-px-6 tw-pt-6 tw-pb-2">
                <span className="tw-text-lg tw-font-semibold">Choose an activity</span>
                <button
                  className="tw-inline tw-bg-transparent tw-border-none tw-cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    close();
                  }}
                >
                  <XMarkIcon className="tw-h-6 tw-stroke-black" />
                </button>
              </div>
              <div className="tw-flex tw-flex-col tw-w-full tw-gap-2 tw-p-6 tw-pt-0 tw-overflow-auto tw-h-full">
                <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-3 sm:tw-grid-cols-4 tw-py-5 tw-gap-5 sm:tw-gap-6">
                  {getSearchableCategories().map((category) => (
                    <Link key={category} href={`/search?categories=["${category}"]`} onClick={() => close()}>
                      <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-cursor-pointer tw-select-none tw-p-2 tw-rounded-lg">
                        {getCategoryIcon(category)}
                        <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">
                          {getCategoryForDisplay(category)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* <Disclosure>
                  {({ open }) => (
                    <div className="tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                      <Disclosure.Button className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none">
                        <span>
                          {dateRange?.from && dateRange?.to
                            ? dateRange.from.toLocaleDateString() + " - " + dateRange.to.toLocaleDateString()
                            : "Add dates"}
                        </span>
                        <ChevronUpIcon
                          className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="tw-flex tw-flex-col tw-w-full tw-items-center tw-pb-4 sm:tw-pb-0">
                        <DateRangePicker
                          mode="range"
                          disabled={{ before: new Date() }}
                          numberOfMonths={1}
                          className="tw-mt-3 sm:tw-mt-0"
                          classNames={{
                            month: "sm:tw-border-0",
                          }}
                          selected={dateRange}
                          onSelect={setDateRange}
                        />
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
                <Disclosure>
                  {({ open }) => (
                    <div className="tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                      <Disclosure.Button className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none">
                        <span>{numberOfGuests ? numberOfGuests + " travelers" : "Add travelers"}</span>
                        <ChevronUpIcon
                          className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel>
                        <div className="tw-flex tw-justify-between tw-py-5">
                          <span className="tw-text-base tw-whitespace-nowrap tw-select-none">Adults</span>
                          <div className="tw-flex tw-gap-3">
                            <button
                              onClick={() => {
                                setNumberOfGuests(Math.max(0, numberOfGuests - 1));
                              }}
                            >
                              <MinusCircleIcon
                                className={mergeClasses(
                                  "tw-w-6 tw-cursor-pointer tw-stroke-gray-500 hover:tw-stroke-black",
                                  numberOfGuests === 0 && "!tw-stroke-gray-300 tw-cursor-not-allowed",
                                )}
                              />
                            </button>
                            <span className="tw-flex tw-w-3 tw-justify-center tw-select-none">{numberOfGuests}</span>
                            <button
                              onClick={() => {
                                setNumberOfGuests(numberOfGuests + 1);
                              }}
                            >
                              <PlusCircleIcon className="tw-w-6 tw-cursor-pointer tw-stroke-gray-500 hover:tw-stroke-black" />
                            </button>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure> */}
              </div>
              {/* <div className="tw-flex tw-justify-between tw-w-full tw-border-t tw-border-solid tw-border-slate-200 tw-px-6 tw-py-4 tw-mt-auto">
                <button
                  className="tw-text-base"
                  onClick={() => {
                    setCategories([]);
                    setDateRange(undefined);
                    setNumberOfGuests(0);
                  }}
                >
                  Clear all
                </button>
                <Button
                  className="tw-h-10 tw-text-base tw-flex tw-flex-row tw-items-center tw-pr-5"
                  onClick={search}
                  ref={buttonRef}
                >
                  <MagnifyingGlassIcon className="tw-h-5 tw-mr-1.5 tw-stroke-2" />
                  Search
                </Button>
              </div> */}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
