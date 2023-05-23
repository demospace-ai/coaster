import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

type NotificationProps = {
  show: boolean;
  setShow: (show: boolean) => void;
};

export const Notification: React.FC<NotificationProps> = ({ show, setShow }) => {
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="tw-pointer-events-none tw-fixed tw-inset-0 tw-flex tw-items-end tw-px-4 tw-py-6 sm:tw-items-start sm:tw-p-6"
      >
        <div className="tw-flex tw-w-full tw-flex-col tw-items-center tw-space-y-4 sm:tw-items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="tw-transform tw-ease-out tw-duration-300 tw-transition"
            enterFrom="tw-translate-y-2 tw-opacity-0 sm:tw-translate-y-0 sm:tw-translate-x-2"
            enterTo="tw-translate-y-0 tw-opacity-100 sm:tw-translate-x-0"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-opacity-100"
            leaveTo="tw-opacity-0"
          >
            <div className="tw-pointer-events-auto tw-w-full tw-max-w-sm tw-overflow-hidden tw-rounded-lg tw-bg-white tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5">
              <div className="tw-p-4">
                <div className="tw-flex tw-items-center">
                  <div className="tw-flex tw-w-0 tw-flex-1 tw-justify-between">
                    <p className="tw-w-0 tw-flex-1 tw-text-sm tw-font-medium tw-text-slate-900">Discussion archived</p>
                    <button
                      type="button"
                      className="tw-ml-3 tw-flex-shrink-0 tw-rounded-md tw-bg-white tw-text-sm tw-font-medium tw-text-indigo-600 hover:tw-text-indigo-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                    >
                      Undo
                    </button>
                  </div>
                  <div className="tw-ml-4 tw-flex tw-flex-shrink-0">
                    <button
                      type="button"
                      className="tw-inline-flex tw-rounded-md tw-bg-white tw-text-slate-400 hover:tw-text-slate-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                      onClick={() => {
                        setShow(false);
                      }}
                    >
                      <span className="tw-sr-only">Close</span>
                      <XMarkIcon className="tw-h-5 tw-w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};
