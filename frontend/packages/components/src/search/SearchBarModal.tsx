"use client";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Fragment, useRef } from "react";
import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "../icons/Category";

export const SearchModal: React.FC<{ open: boolean; close: () => void }> = ({ open, close }) => {
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
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
