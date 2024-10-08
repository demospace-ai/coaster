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
          "tw-fixed tw-z-50 tw-overscroll-contain tw-top-0 tw-left-0 tw-h-full tw-w-full tw-backdrop-blur-sm tw-bg-black tw-bg-opacity-50", // z-index is tied to NotificationProvider z-index (toast should be bigger)
        )}
        onClose={() => closeLoginModal()}
      >
        <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center">
          <button
            className="tw-flex tw-absolute tw-z-20 tw-top-4 sm:tw-top-8 tw-right-4 sm:tw-right-8 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0 tw-justify-center tw-items-center"
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
            <Dialog.Panel className="tw-flex tw-flex-col tw-h-full sm:tw-h-auto tw-max-w-[400px] tw-pt-28 sm:tw-pt-12 tw-pb-10 tw-px-8 sm:tw-rounded-lg sm:tw-shadow-md tw-bg-white tw-items-center sm:-tw-mt-20">
              <Image width={200} height={32} src={LongLogo} className="tw-select-none tw-mb-4" alt="coaster logo" />
              <div className="tw-flex tw-flex-col tw-items-center tw-my-2 tw-w-full">{loginContent}</div>
              <div className="tw-text-xs tw-text-center tw-mt-4 tw-text-slate-800 tw-select-none tw-mx-8 sm:tw-mx-0">
                By continuing you agree to Coaster&apos;s{" "}
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
