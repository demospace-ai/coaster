"use client";

import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { Fragment, useRef, useState } from "react";
import { Button } from "../button/Button";
import { trackEvent } from "../rudderstack/client";

export const SearchModal: React.FC<{ open: boolean; close: () => void }> = ({ open, close }) => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get("query") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const search = () => {
    if (query.length > 0) {
      trackEvent("search", { query });
      window.location.href = `/search?query=${query}`;
      close();
    }
  };

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
        className="tw-fixed tw-left-0 tw-top-0 tw-z-[100] tw-h-full tw-w-full tw-bg-black tw-bg-opacity-30"
        initialFocus={inputRef}
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
            <Dialog.Panel className="tw-flex tw-h-full tw-w-screen tw-flex-col tw-items-center tw-justify-start tw-overflow-clip tw-rounded-t-xl tw-bg-white tw-px-6 tw-shadow-md ">
              <div className="tw-flex tw-w-full tw-items-center tw-justify-between tw-pb-4 tw-pt-6">
                <span className="tw-text-lg tw-font-semibold">Find an adventure</span>
                <button
                  className="tw-inline tw-cursor-pointer tw-border-none tw-bg-transparent"
                  onClick={(e) => {
                    e.preventDefault();
                    close();
                  }}
                >
                  <XMarkIcon className="tw-h-6 tw-stroke-black" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  search();
                }}
                className="tw-flex tw-h-14 tw-w-full tw-max-w-[400px] tw-cursor-pointer tw-flex-row tw-items-center tw-rounded-md tw-border tw-border-solid tw-border-slate-200 tw-bg-white tw-p-1.5"
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="tw-w-full tw-cursor-text tw-select-none tw-bg-transparent tw-pl-4 tw-text-base tw-placeholder-gray-700 tw-outline-none"
                  placeholder="Ex. Surfing in Morocco"
                />
                <MagnifyingGlassIcon
                  className="tw-mr-4 tw-flex tw-h-6 tw-w-6 tw-stroke-gray-600 sm:tw-hidden"
                  onClick={search}
                />
              </form>
              <Button className="tw-mt-4 tw-w-full tw-py-3" onClick={search}>
                Search
              </Button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
