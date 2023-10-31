"use client";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Fragment, useRef } from "react";
import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "../icons/Category";

export const SearchModal: React.FC<{ open: boolean; close: () => void }> = ({ open, close }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <Transition
      show={open}
      as={Fragment}
      enter="tw-transform tw-transition tw-ease-in-out tw-duration-500"
      enterFrom="tw-opacity-0"
      enterTo="tw-opacity-100"
      leave="tw-transform tw-transition tw-ease-in-out tw-duration-500"
      leaveFrom="tw-opacity-100"
      leaveTo="tw-opacity-0"
    >
      <Dialog
        onClose={close}
        className="tw-fixed tw-top-0 tw-left-0 tw-h-full tw-w-full tw-z-[100] tw-bg-black tw-bg-opacity-30"
        initialFocus={buttonRef}
      >
        <div className="tw-fixed tw-inset-x-0 tw-bottom-0 tw-h-[90svh]">
          <Transition.Child
            as={Fragment}
            enter="tw-transform tw-transition tw-ease-in-out tw-duration-500"
            enterFrom="tw-translate-y-full"
            enterTo="tw-translate-y-0"
            leave="tw-transform tw-transition tw-ease-in-out tw-duration-500"
            leaveFrom="tw-translate-y-0"
            leaveTo="tw-translate-y-full"
          >
            <Dialog.Panel className="tw-flex tw-flex-col tw-bg-white tw-shadow-md tw-rounded-t-xl tw-w-screen tw-h-full tw-items-center tw-justify-start tw-overflow-clip">
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
                <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-3 tw-py-5 tw-gap-5">
                  {getSearchableCategories().map((category) => (
                    <Link key={category} href={`/search?categories=["${category}"]`} onClick={() => close()}>
                      <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-cursor-pointer tw-select-none tw-p-2 tw-rounded-lg">
                        {getCategoryIcon(category)}
                        <span className="tw-text-xs tw-font-medium tw-mt-1">{getCategoryForDisplay(category)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
