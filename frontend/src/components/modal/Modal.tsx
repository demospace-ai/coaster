import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { createPortal } from "react-dom";

interface ModalProps {
  show: boolean;
  close?: () => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  noContainer?: boolean;
}

export const Modal: React.FC<ModalProps> = (props) => {
  return createPortal(
    <Dialog
      className={classNames(
        "tw-fixed tw-z-50 tw-overscroll-contain tw-top-0 tw-left-0 tw-h-full tw-w-full tw-backdrop-blur-sm tw-bg-black tw-bg-opacity-50", // z-index is tied to Toast z-index (toast should be bigger)
      )}
      open={props.show}
      onClose={() => props.close && props.close()}
    >
      {props.noContainer ? (
        <Dialog.Panel>
          <NoContainerModalCloseButton close={props.close} />
          {props.children}
        </Dialog.Panel>
      ) : (
        <Dialog.Panel
          className="tw-absolute tw-bg-white tw-flex tw-flex-col tw-top-[50%] sm:tw-top-[45%] tw-max-h-[85%] tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-rounded-lg tw-shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tw-flex">
            <div className="tw-inline tw-m-6 tw-mb-2 tw-select-none">{props.title}</div>
            <ModalCloseButton close={props.close} />
          </div>
          {props.children}
        </Dialog.Panel>
      )}
    </Dialog>,
    document.body,
  );
};

const ModalCloseButton: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <button
      className="tw-inline tw-m-6 tw-ml-auto tw-mb-2 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0"
      onClick={(e) => {
        e.preventDefault();
        close && close();
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z"
          fill="black"
        />
      </svg>
    </button>
  );
};

const NoContainerModalCloseButton: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <button
      className="tw-flex tw-absolute tw-z-20 tw-top-4 sm:tw-top-8 tw-right-4 sm:tw-right-8 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0 tw-justify-center tw-items-center"
      onClick={(e) => {
        e.preventDefault();
        close && close();
      }}
    >
      <XMarkIcon className="tw-h-10 tw-stroke-white" />
    </button>
  );
};
