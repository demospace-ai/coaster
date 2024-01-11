"use client";

import LongLogo from "@coaster/assets/long-logo.svg";
import { useAuthContext } from "@coaster/rpc/client";
import { mergeClasses } from "@coaster/utils/common";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import { EmailLoginForm, EmailSignup, GoogleLogin, LoginStep, SendResetForm, StartContent } from "./LoginSteps";

export const LoginModal: React.FC = () => {
  const { loginOpen, create, openLoginModal, closeLoginModal } = useAuthContext();
  const [step, setStep] = useState<LoginStep>(LoginStep.Start);
  const searchParams = useSearchParams();
  const destination = searchParams?.get("destination") ?? "";
  const emailParam = searchParams?.get("email");
  const initialEmail = emailParam ? decodeURIComponent(emailParam) : undefined;
  const [email, setEmail] = useState<string | undefined>(initialEmail);

  const reset = () => {
    setStep(LoginStep.Start);
  };
  const forgotPassword = () => setStep(LoginStep.SendReset);

  let loginContent;
  switch (step) {
    case LoginStep.Start:
      loginContent = (
        <StartContent
          create={create}
          setStep={setStep}
          email={email}
          setEmail={setEmail}
          closeModal={closeLoginModal}
          switchModeModal={openLoginModal}
        />
      );
      break;
    case LoginStep.EmailCreate:
      loginContent = <EmailSignup email={email} reset={reset} closeModal={closeLoginModal} />;
      break;
    case LoginStep.EmailLogin:
      loginContent = (
        <EmailLoginForm email={email} reset={reset} forgotPassword={forgotPassword} closeModal={closeLoginModal} />
      );
      break;
    case LoginStep.GoogleLogin:
      loginContent = <GoogleLogin email={email} reset={reset} closeModal={closeLoginModal} />;
      break;
    case LoginStep.SendReset:
      loginContent = <SendResetForm initialEmail={email} reset={reset} destination={destination} />;
      break;
  }

  return (
    <Transition
      appear
      show={loginOpen}
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
        onClose={() => closeLoginModal()}
      >
        <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center">
          <button
            className="tw-absolute tw-right-4 tw-top-4 tw-z-20 tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-border-none tw-bg-transparent tw-p-0 sm:tw-right-8 sm:tw-top-8"
            onClick={(e) => {
              e.preventDefault();
              closeLoginModal();
            }}
          >
            <XMarkIcon className="tw-h-6 tw-stroke-black" />
          </button>
          <Transition.Child
            as={Fragment}
            enter="tw-ease-in tw-duration-100"
            enterFrom="tw-scale-95"
            enterTo="tw-scale-100"
            leave="tw-ease-in tw-duration-200"
            leaveFrom="tw-scale-100"
            leaveTo="tw-scale-95"
          >
            <Dialog.Panel className="tw-flex tw-h-full tw-max-w-[400px] tw-flex-col tw-items-center tw-bg-white tw-px-8 tw-pb-10 tw-pt-28 sm:-tw-mt-20 sm:tw-h-auto sm:tw-rounded-lg sm:tw-pt-12 sm:tw-shadow-md">
              <Image width={200} height={32} src={LongLogo} className="tw-mb-4 tw-select-none" alt="coaster logo" />
              <div className="tw-my-2 tw-flex tw-w-full tw-flex-col tw-items-center">{loginContent}</div>
              <div className="tw-mx-8 tw-mt-4 tw-select-none tw-text-center tw-text-xs tw-text-slate-800 sm:tw-mx-0">
                By continuing you agree to Coaster's{" "}
                <a className="tw-text-blue-500" href="https://trycoaster.com/terms" target="_blank" rel="noreferrer">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a className="tw-text-blue-500" href="https://trycoaster.com/privacy" target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>
                .
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
