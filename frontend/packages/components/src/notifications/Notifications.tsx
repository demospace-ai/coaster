"use client";

import { NotificationContext } from "@coaster/rpc/client";
import { Portal, Transition } from "@headlessui/react";
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, ReactNode, useState } from "react";

type NotificationProps = {
  content: React.ReactNode;
  show: boolean;
  close: () => void;
  duration?: number;
};

export interface NotificationOptions {
  type: "error" | "success" | "info";
  duration?: number;
  content: React.ReactNode;
}

export type ShowNotificationFunction = (type: "success" | "error" | "info", content: string, duration?: number) => void;

export const getNotificationContentFromDetails = (notification?: NotificationOptions) => {
  var notificationContent: ReactNode | undefined = undefined;
  if (notification) {
    switch (notification.type) {
      case "error":
        notificationContent = (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
            <XCircleIcon className="tw-shrink-0 tw-w-5 tw-h-5 tw-text-red-500 tw-stroke-2" />
            <p className="tw-ml-4 tw-text-sm tw-text-gray-900">{notification.content}</p>
          </div>
        );
        break;
      case "success":
        notificationContent = (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
            <CheckCircleIcon className="tw-shrink-0 tw-w-5 tw-h-5 tw-text-green-500 tw-stroke-2" />
            <p className="tw-ml-4 tw-text-base tw-text-gray-900">{notification.content}</p>
          </div>
        );
        break;
      case "info":
        notificationContent = (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
            <InformationCircleIcon className="tw-shrink-0 tw-w-5 tw-h-5 tw-text-yellow-500 tw-stroke-2" />
            <p className="tw-ml-4 tw-text-base tw-text-gray-900">{notification.content}</p>
          </div>
        );
        break;
    }
  }

  return notificationContent;
};

const Notification: React.FC<NotificationProps> = ({ content, show, duration, close }) => {
  if (duration && duration > 0) {
    setTimeout(() => {
      close();
    }, duration);
  }

  return (
    <>
      <div
        aria-live="assertive"
        className="tw-z-[60] tw-pointer-events-none tw-fixed tw-inset-0 tw-flex tw-p-6 tw-items-start" // z-index is tied to Modal z-index (Notification should be bigger)
      >
        <div className="tw-flex tw-w-full tw-flex-col tw-space-y-4 tw-items-end">
          <Transition
            show={show}
            as={Fragment}
            enter="tw-transform tw-ease-out tw-duration-300 tw-transition"
            enterFrom="tw-translate-y-2 tw-opacity-0 sm:tw-translate-y-0 sm:tw-translate-x-2"
            enterTo="tw-translate-y-0 tw-opacity-100 sm:tw-translate-x-0"
            leave="tw-transition tw-ease-in tw-duration-300"
            leaveFrom="tw-opacity-100"
            leaveTo="tw-opacity-0"
          >
            <div className="tw-pointer-events-auto tw-w-full tw-max-w-sm tw-overflow-hidden tw-rounded-lg tw-bg-white tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5">
              <div className="tw-p-4">
                <div className="tw-flex tw-items-center">
                  <div className="tw-ml-3 tw-w-0 tw-flex-1 tw-pt-0.5">{content}</div>
                  <div className="tw-ml-4 tw-flex tw-flex-shrink-0">
                    <button
                      type="button"
                      className="tw-inline-flex tw-rounded-md tw-bg-white tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none"
                      onClick={() => {
                        close();
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

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationOptions | undefined>(undefined);
  const notificationContent = getNotificationContentFromDetails(notification);

  return (
    <>
      <Portal>
        <Notification
          content={notificationContent}
          show={!!notification}
          close={() => setNotification(undefined)}
          duration={notification?.duration}
        />
      </Portal>
      <NotificationContext.Provider
        value={{
          showNotification: (type: "error" | "success" | "info", content: React.ReactNode, duration?: number) =>
            setNotification({ type, content, duration }),
        }}
      >
        {children}
      </NotificationContext.Provider>
    </>
  );
};
