"use client";

import { LongLogo } from "@coaster/assets";
import { useUserContext } from "@coaster/rpc/client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailLoginForm, EmailSignup, GoogleLogin, LoginStep, SendResetForm, StartContent } from "./LoginSteps";

export const LoginPage: React.FC<{ create?: boolean }> = ({ create }) => {
  const { user } = useUserContext();
  const [step, setStep] = useState<LoginStep>(LoginStep.Start);
  const searchParams = useSearchParams();
  const destination = searchParams?.get("destination") ?? "";
  const emailParam = searchParams?.get("email");
  const initialEmail = emailParam ? atob(emailParam) : undefined;
  const router = useRouter();
  const [email, setEmail] = useState<string | undefined>(initialEmail);

  // Use effect to navigate after render if authenticated
  useEffect(() => {
    let ignore = false;
    if (user && !ignore) {
      router.push("/" + decodeURIComponent(destination));
    }

    return () => {
      ignore = true;
    };
  }, [router, user]);

  const reset = () => {
    setStep(LoginStep.Start);
    setEmail(initialEmail);
  };

  let loginContent;
  switch (step) {
    case LoginStep.Start:
      loginContent = <StartContent create={create} setStep={setStep} email={email} setEmail={setEmail} />;
      break;
    case LoginStep.EmailCreate:
      loginContent = <EmailSignup email={email} reset={reset} />;
      break;
    case LoginStep.EmailLogin:
      loginContent = <EmailLoginForm email={email} reset={reset} />;
      break;
    case LoginStep.GoogleLogin:
      loginContent = <GoogleLogin email={email} reset={reset} />;
      break;
    case LoginStep.SendReset:
      loginContent = <SendResetForm reset={reset} destination={destination} />;
      break;
  }

  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-w-full tw-bg-slate-100">
      <div className="tw-mt-20 sm:tw-mt-32 tw-mb-auto tw-mx-auto tw-w-[400px]">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg sm:tw-shadow-md sm:tw-bg-white tw-items-center">
          <Image src={LongLogo.src} width={200} height={32} className="tw-select-none tw-mb-4" alt="coaster logo" />
          <div className="tw-flex tw-flex-col tw-items-center tw-my-2 tw-w-full">{loginContent}</div>
        </div>
        <div className="tw-text-xs tw-text-center tw-mt-4 tw-text-slate-800 tw-select-none tw-mx-8 sm:tw-mx-0">
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
      </div>
    </div>
  );
};
