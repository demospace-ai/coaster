"use client";

import { mergeClasses } from "@coaster/utils/common";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { Fragment } from "react";
import { Portal } from "../portal/Portal";

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
    <Portal>
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
            "tw-fixed tw-z-50 tw-overscroll-contain tw-top-0 tw-left-0 tw-h-full tw-w-full tw-backdrop-blur-sm tw-bg-black tw-bg-opacity-50", // z-index is tied to Toast z-index (toast should be bigger)
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
              <Dialog.Panel className="tw-absolute tw-bg-white tw-flex tw-flex-col tw-top-[50%] sm:tw-top-[45%] tw-max-h-[85%] tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-rounded-lg tw-shadow-md">
                <div className="tw-flex">
                  <div className="tw-inline tw-m-6 tw-mb-2 tw-select-none">{props.title}</div>
                  <ModalCloseButton close={props.close} />
                </div>
                {props.children}
              </Dialog.Panel>
            ) : (
              <div className="tw-absolute tw-bg-white tw-flex tw-flex-col tw-top-[50%] sm:tw-top-[45%] tw-max-h-[85%] tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-rounded-lg tw-shadow-md">
                <div className="tw-flex">
                  <div className="tw-inline tw-m-6 tw-mb-2 tw-select-none">{props.title}</div>
                  <ModalCloseButton close={props.close} />
                </div>
                {props.children}
              </div>
            )}
          </Transition.Child>
        </Dialog>
      </Transition>
    </Portal>
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
      <XMarkIcon className="tw-h-5 tw-stroke-black" />
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
