"use client";

import LongLogo from "@coaster/assets/long-logo.svg";
import { useAuthContext } from "@coaster/rpc/client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailLoginForm, EmailSignup, GoogleLogin, LoginStep, SendResetForm, StartContent } from "./LoginSteps";

export const LoginPage: React.FC<{ create?: boolean }> = ({ create }) => {
  const { user } = useAuthContext();
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
      loginContent = <EmailLoginForm email={email} reset={reset} forgotPassword={() => setStep(LoginStep.SendReset)} />;
      break;
    case LoginStep.GoogleLogin:
      loginContent = <GoogleLogin email={email} reset={reset} />;
      break;
    case LoginStep.SendReset:
      loginContent = <SendResetForm initialEmail={email} reset={reset} destination={destination} />;
      break;
  }

  return (
    <div className="tw-flex tw-h-full tw-w-full tw-flex-row tw-bg-slate-100">
      <div className="tw-mx-auto tw-mb-24 tw-mt-20 tw-w-[400px] sm:tw-mb-32 sm:tw-mt-32">
        <div className="tw-flex tw-flex-col tw-items-center tw-rounded-lg tw-px-8 tw-pb-10 tw-pt-12 sm:tw-bg-white sm:tw-shadow-md">
          <Image src={LongLogo} width={200} height={32} className="tw-mb-4 tw-select-none" alt="coaster logo" />
          <div className="tw-my-2 tw-flex tw-w-full tw-flex-col tw-items-center">{loginContent}</div>
        </div>
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
      </div>
    </div>
  );
};
