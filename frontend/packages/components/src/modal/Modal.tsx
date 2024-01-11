"use client";

import { mergeClasses } from "@coaster/utils/common";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { Fragment } from "react";

interface ModalProps {
  show: boolean;
  close?: () => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  noContainer?: boolean;
  clickToClose?: boolean;
}

export const Modal: React.FC<ModalProps> = (props) => {
  return (
    <>
      <Transition
        appear
        show={props.show}
        as={Fragment}
        enter="tw-ease-in tw-duration-150"
        enterFrom="tw-opacity-0"
        enterTo="tw-opacity-100"
        leave="tw-ease-in tw-duration-200"
        leaveFrom="tw-opacity-100"
        leaveTo="tw-opacity-0"
      >
        <Dialog
          className={mergeClasses(
            "tw-fixed tw-left-0 tw-top-0 tw-z-50 tw-h-full tw-w-full tw-overscroll-contain tw-bg-black tw-bg-opacity-50 tw-backdrop-blur-sm", // z-index is tied to NotificationProvider z-index (toast should be bigger)
          )}
          onClose={() => props.close && props.close()}
        >
          <Transition.Child
            as={Fragment}
            enter="tw-ease-in tw-duration-100"
            enterFrom="tw-scale-95"
            enterTo="tw-scale-100"
            leave="tw-ease-in tw-duration-200"
            leaveFrom="tw-scale-100"
            leaveTo="tw-scale-95"
          >
            {props.noContainer ? (
              props.clickToClose ? (
                <Dialog.Panel>
                  <NoContainerModalCloseButton close={props.close} />
                  {props.children}
                </Dialog.Panel>
              ) : (
                <div>
                  <NoContainerModalCloseButton close={props.close} />
                  {props.children}
                </div>
              )
            ) : props.clickToClose ? (
              <Dialog.Panel className="tw-absolute tw-left-1/2 tw-top-[50%] tw-flex tw-max-h-[85%] -tw-translate-x-1/2 -tw-translate-y-1/2 tw-flex-col tw-rounded-lg tw-bg-white tw-shadow-md sm:tw-top-[45%]">
                <div className="tw-flex">
                  <div className="tw-m-6 tw-mb-2 tw-inline tw-select-none tw-text-xl tw-font-semibold">
                    {props.title}
                  </div>
                  <ModalCloseButton close={props.close} />
                </div>
                {props.children}
              </Dialog.Panel>
            ) : (
              <div className="tw-absolute tw-left-1/2 tw-top-[50%] tw-flex tw-max-h-[85%] -tw-translate-x-1/2 -tw-translate-y-1/2 tw-flex-col tw-rounded-lg tw-bg-white tw-shadow-md sm:tw-top-[45%]">
                <div className="tw-flex">
                  <div className="tw-m-6 tw-mb-2 tw-inline tw-select-none tw-text-xl tw-font-semibold">
                    {props.title}
                  </div>
                  <ModalCloseButton close={props.close} />
                </div>
                {props.children}
              </div>
            )}
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

const ModalCloseButton: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <button
      className="tw-m-6 tw-mb-2 tw-ml-auto tw-inline tw-cursor-pointer tw-border-none tw-bg-transparent tw-p-0"
      onClick={(e) => {
        e.preventDefault();
        close && close();
      }}
    >
      <XMarkIcon className="tw-h-5 tw-stroke-black" />
    </button>
  );
};

const NoContainerModalCloseButton: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <button
      className="tw-absolute tw-right-4 tw-top-4 tw-z-20 tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-border-none tw-bg-transparent tw-p-0 sm:tw-right-8 sm:tw-top-8"
      onClick={(e) => {
        e.preventDefault();
        close && close();
      }}
    >
      <XMarkIcon className="tw-h-10 tw-stroke-white" />
    </button>
  );
};
