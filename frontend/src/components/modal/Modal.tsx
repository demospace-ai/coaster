import classNames from "classnames";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  show: boolean;
  close?: () => void;
  children?: React.ReactNode;
  title?: string;
  titleStyle?: string;
  clickToEscape?: boolean;
  noContainer?: boolean;
  lightBackground?: boolean;
  fff?: string;
}

export const Modal: React.FC<ModalProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    const escFunction = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (props.close) {
          props.close();
        }
        document.removeEventListener("keydown", escFunction);
      }
    };

    document.addEventListener("keydown", escFunction);
  });

  const showHideClassName = props.show ? "tw-block" : "tw-hidden";

  // Prevent scrolling of body when modal is open
  useEffect(() => {
    setIsOpen(props.show);
    props.show && document.body.style.setProperty("overflow", "hidden");
    if (isOpen) {
      // Don't update the CSS if the modal was never open because another modal is controlling this
      !props.show && document.body.style.setProperty("overflow", "unset");
    }
  }, [props.show]);

  return (
    <>
      {createPortal(
        <div
          className={classNames(
            "tw-fixed tw-overscroll-contain tw-top-0 tw-left-0 tw-h-full tw-w-full tw-z-50 tw-backdrop-blur-sm", // z-index is tied to Toast z-index (toast should be bigger)
            showHideClassName,
            props.lightBackground ? "tw-bg-white tw-bg-opacity-50" : "tw-bg-black tw-bg-opacity-50",
          )}
          onClick={props.clickToEscape ? props.close : undefined}
        >
          {props.noContainer ? (
            <section>
              <NoContainerModalCloseButton close={props.close} />
              {props.children}
            </section>
          ) : (
            <section
              className="tw-absolute tw-bg-white tw-flex tw-flex-col tw-top-[50%] sm:tw-top-[45%] tw-max-h-[85%] tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-rounded-lg tw-shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex" }}>
                <div className={classNames("tw-inline tw-m-6 tw-mb-2 tw-select-none", props.titleStyle)}>
                  {props.title}
                </div>
                <ModalCloseButton close={props.close} />
              </div>
              {props.children}
            </section>
          )}
        </div>,
        document.body,
      )}
    </>
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
      className="tw-absolute tw-z-20 tw-top-4 sm:tw-top-8 tw-right-0 sm:tw-right-8 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0"
      onClick={(e) => {
        e.preventDefault();
        close && close();
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none">
        <path
          d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z"
          fill="white"
        />
      </svg>
    </button>
  );
};
