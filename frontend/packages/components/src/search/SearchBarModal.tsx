"use client";

import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Fragment, useRef, useState } from "react";
import { Button } from "../button/Button";
import { trackEvent } from "../rudderstack/events";

export const SearchModal: React.FC<{ open: boolean; close: () => void }> = ({ open, close }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const search = () => {
    if (query.length > 0) {
      trackEvent("Search", { query });
      router.push(`/search?query=${query}`);
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
        className="tw-fixed tw-top-0 tw-left-0 tw-h-full tw-w-full tw-z-[100] tw-bg-black tw-bg-opacity-30"
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
            <Dialog.Panel className="tw-flex tw-flex-col tw-bg-white tw-shadow-md tw-rounded-t-xl tw-w-screen tw-h-full tw-items-center tw-justify-start tw-overflow-clip tw-px-6 ">
              <div className="tw-flex tw-w-full tw-items-center tw-justify-between tw-pt-6 tw-pb-4">
                <span className="tw-text-lg tw-font-semibold">Find an adventure</span>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  search();
                }}
                className="tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[400px] tw-h-14 tw-bg-white tw-border tw-border-slate-200 tw-border-solid tw-p-1.5 tw-rounded-md tw-cursor-pointer"
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="tw-w-full tw-bg-transparent tw-pl-4 tw-placeholder-gray-700 tw-text-base tw-select-none tw-cursor-text tw-outline-none"
                  placeholder="Ex. Surfing in Morocco"
                />
                <MagnifyingGlassIcon
                  className="tw-flex sm:tw-hidden tw-w-6 tw-h-6 tw-mr-4 tw-stroke-gray-600"
                  onClick={search}
                />
              </form>
              <Button className="tw-w-full tw-py-3 tw-mt-4" onClick={search}>
                Search
              </Button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
