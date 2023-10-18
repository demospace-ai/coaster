import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import React, { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useCheckSession } from "src/app/actions";
import { FormError } from "src/components/FormError";
import { Button } from "src/components/button/Button";
import { GoogleIcon } from "src/components/icons/Google";
import longlogo from "src/components/images/long-logo.svg";
import mail from "src/components/images/mail.svg";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { useOnLoginSuccess } from "src/pages/login/actions";
import { LoginMessage, MessageType } from "src/pages/login/message";
import { useDispatch, useSelector } from "src/root/model";
import { getEndpointUrl, sendRequest } from "src/rpc/ajax";
import { CheckEmail, CreateUser, EmailLogin, OAuthRedirect, SendReset } from "src/rpc/api";
import { LoginMethod, OAuthProvider } from "src/rpc/types";
import { z } from "zod";

enum LoginStep {
  Start = "start",
  EmailCreate = "email-create",
  EmailLogin = "email-login",
  GoogleLogin = "google-login",
  SendReset = "send-reset",
}

export const Login: React.FC<{ create?: boolean }> = ({ create }) => {
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  const [step, setStep] = useState<LoginStep>(LoginStep.Start);
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("destination") ?? "";
  const emailParam = searchParams.get("email");
  const initialEmail = emailParam ? decodeURIComponent(emailParam) : undefined;
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | undefined>(initialEmail);

  // Use effect to navigate after render if authenticated
  useEffect(() => {
    let ignore = false;
    if (isAuthenticated && !ignore) {
      navigate("/" + decodeURIComponent(destination));
    }

    return () => {
      ignore = true;
    };
  }, [navigate, isAuthenticated]);

  const reset = () => {
    setStep(LoginStep.Start);
    setEmail(initialEmail);
  };

  let loginContent;
  switch (step) {
    case LoginStep.Start:
      loginContent = (
        <StartContent create={create} setStep={setStep} email={email} setEmail={setEmail} destination={destination} />
      );
      break;
    case LoginStep.EmailCreate:
      loginContent = <EmailSignup email={email} reset={reset} />;
      break;
    case LoginStep.EmailLogin:
      loginContent = <EmailLoginForm email={email} reset={reset} />;
      break;
    case LoginStep.GoogleLogin:
      loginContent = <GoogleLogin email={email} reset={reset} destination={destination} />;
      break;
    case LoginStep.SendReset:
      loginContent = <SendResetForm reset={reset} destination={destination} />;
      break;
  }

  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-w-full tw-bg-slate-100">
      <div className="tw-mt-20 sm:tw-mt-32 tw-mb-auto tw-mx-auto tw-w-[400px]">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg sm:tw-shadow-md sm:tw-bg-white tw-items-center">
          <img src={longlogo} className="tw-h-8 tw-select-none tw-mb-4" alt="coaster logo" />
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

export const LoginModal: React.FC<{ create?: boolean }> = ({ create }) => {
  const modalOpen = useSelector((state) => state.login.modalOpen);
  const dispatch = useDispatch();
  const closeModal = () => dispatch({ type: "login.close" });
  const [step, setStep] = useState<LoginStep>(LoginStep.Start);
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("destination") ?? "";
  const emailParam = searchParams.get("email");
  const initialEmail = emailParam ? decodeURIComponent(emailParam) : undefined;
  const [email, setEmail] = useState<string | undefined>(initialEmail);

  const reset = () => {
    setStep(LoginStep.Start);
    setEmail(initialEmail);
  };

  let loginContent;
  switch (step) {
    case LoginStep.Start:
      loginContent = (
        <StartContent
          create={create}
          setStep={setStep}
          email={email}
          setEmail={setEmail}
          destination={destination}
          closeModal={closeModal}
        />
      );
      break;
    case LoginStep.EmailCreate:
      loginContent = <EmailSignup email={email} reset={reset} closeModal={closeModal} />;
      break;
    case LoginStep.EmailLogin:
      loginContent = <EmailLoginForm email={email} reset={reset} closeModal={closeModal} />;
      break;
    case LoginStep.GoogleLogin:
      loginContent = <GoogleLogin email={email} reset={reset} destination={destination} closeModal={closeModal} />;
      break;
    case LoginStep.SendReset:
      loginContent = <SendResetForm reset={reset} destination={destination} />;
      break;
  }

  return createPortal(
    <Transition
      appear
      show={modalOpen}
      as={Fragment}
      enter="tw-ease-in tw-duration-150"
      enterFrom="tw-opacity-0"
      enterTo="tw-opacity-100"
      leave="tw-ease-in tw-duration-200"
      leaveFrom="tw-opacity-100"
      leaveTo="tw-opacity-0"
    >
      <Dialog
        className={classNames(
          "tw-fixed tw-z-50 tw-overscroll-contain tw-top-0 tw-left-0 tw-h-full tw-w-full tw-backdrop-blur-sm tw-bg-black tw-bg-opacity-50", // z-index is tied to Toast z-index (toast should be bigger)
        )}
        onClose={() => closeModal()}
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
          <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center">
            <button
              className="tw-flex tw-absolute tw-z-20 tw-top-4 sm:tw-top-8 tw-right-4 sm:tw-right-8 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0 tw-justify-center tw-items-center"
              onClick={(e) => {
                e.preventDefault();
                closeModal();
              }}
            >
              <XMarkIcon className="tw-h-6 tw-stroke-black" />
            </button>
            <Dialog.Panel className="tw-flex tw-flex-col tw-h-full sm:tw-h-auto tw-max-w-[400px] tw-pt-20 sm:tw-pt-12 tw-pb-10 tw-px-8 sm:tw-rounded-lg sm:tw-shadow-md tw-bg-white tw-items-center sm:-tw-mt-20">
              <img src={longlogo} className="tw-h-8 tw-select-none tw-mb-4" alt="coaster logo" />
              <div className="tw-flex tw-flex-col tw-items-center tw-my-2 tw-w-full">{loginContent}</div>
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
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>,
    document.body,
  );
};

const StartContent: React.FC<{
  create?: boolean;
  setStep: (step: LoginStep) => void;
  email?: string;
  setEmail: (email: string) => void;
  destination: string;
  closeModal?: () => void;
}> = ({ create, setStep, email, setEmail, destination, closeModal }) => {
  const loginError = useSelector((state) => state.login.error);
  const checkSession = useCheckSession();
  const [loading, setLoading] = useState<boolean>(false);
  const openGooglePopup = () => {
    const handleMessage = async (event: MessageEvent<LoginMessage>) => {
      switch (event.data.type) {
        case MessageType.Done:
          window.removeEventListener("message", handleMessage);
          setLoading(true);
          await checkSession();
          closeModal && closeModal();
          break;
      }
    };
    window.addEventListener("message", handleMessage, false);
    window.open(
      getEndpointUrl(OAuthRedirect, { provider: OAuthProvider.Google, destination }),
      "google-oauth",
      "height=600,width=480",
    );
  };

  if (loading) {
    return (
      <div className="tw-flex tw-h-32 tw-w-full tw-items-center tw-justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <>
      {loginError && <div className="tw-text-red-500">{loginError?.toString()}</div>}
      <div className="tw-text-center tw-text-base tw-font-medium tw-mb-2 tw-select-none">
        {create ? "Welcome to Coaster." : "Sign in to continue to Coaster."}
      </div>
      <EmailCheck email={email} setStep={setStep} setEmail={setEmail} />
      <div className='tw-flex tw-w-full tw-items-center tw-text-sm tw-mt-5 tw-justify-between before:tw-block before:tw-w-full before:tw-h-px before:tw-content-[" "] before:tw-bg-gray-300 before:tw-mr-4 before:tw-ml-px after:tw-block after:tw-w-full after:tw-h-px after:tw-content-[" "] after:tw-bg-gray-300 after:tw-ml-4 after:tw-mr-px'>
        or
      </div>
      <div
        className={classNames(
          "tw-relative tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-12 tw-bg-white tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-transition-colors tw-font-medium tw-w-full tw-text-slate-800 tw-rounded",
        )}
        onClick={openGooglePopup}
      >
        <GoogleIcon className="tw-absolute tw-left-3 tw-h-5" />
        Continue with Google
      </div>
      {create ? (
        <div className="tw-mt-5 tw-select-none">
          Already have an account?{" "}
          <NavLink className="tw-text-blue-500" to="/login">
            Sign in
          </NavLink>
        </div>
      ) : (
        <div className="tw-mt-5 tw-select-none">
          Need an account?{" "}
          <NavLink className="tw-text-blue-500" to="/signup">
            Sign up
          </NavLink>
        </div>
      )}
      <div className="tw-mt-3 tw-select-none">
        <span className="tw-text-blue-500 tw-cursor-pointer" onClick={() => setStep(LoginStep.SendReset)}>
          Forgot your password?
        </span>
      </div>
    </>
  );
};

const EmailCheckSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type EmailCheckSchemaType = z.infer<typeof EmailCheckSchema>;

const EmailCheck: React.FC<{
  setStep: (step: LoginStep) => void;
  email?: string;
  setEmail: (email: string) => void;
}> = ({ setStep, email, setEmail }) => {
  const {
    watch,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<EmailCheckSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(EmailCheckSchema),
    defaultValues: {
      email,
    },
  });

  return (
    <form
      className="tw-w-full"
      onSubmit={handleSubmit(async (values) => {
        // TODO: handle error
        const result = await sendRequest(CheckEmail, { queryParams: { email: values.email } });
        setEmail(values.email);
        switch (result.login_method) {
          case LoginMethod.Email:
            setStep(LoginStep.EmailLogin);
            break;
          case LoginMethod.Google:
            setStep(LoginStep.GoogleLogin);
            break;
          case LoginMethod.Undefined:
            setStep(LoginStep.EmailCreate);
            break;
        }
      })}
    >
      <Input
        autoComplete="email"
        className="tw-w-full tw-flex tw-mt-3"
        label="Email"
        {...register("email")}
        value={watch("email")}
      />
      <FormError message={errors.email?.message} />
      <Button type="submit" className="tw-w-full tw-bg-[#3673aa] hover:tw-bg-[#396082] tw-h-12 tw-mt-4">
        Continue
      </Button>
    </form>
  );
};

const EmailLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type EmailLoginSchemaType = z.infer<typeof EmailLoginSchema>;

const EmailLoginForm: React.FC<{ reset: () => void; email?: string; closeModal?: () => void }> = ({
  reset,
  email,
  closeModal,
}) => {
  const dispatch = useDispatch();
  const onLoginSuccess = useOnLoginSuccess();

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<EmailLoginSchemaType>({
    mode: "onBlur",
    defaultValues: {
      email,
    },
    resolver: zodResolver(EmailLoginSchema),
  });

  return (
    <>
      <form
        className="tw-w-full"
        onSubmit={handleSubmit(async (values) => {
          // TODO: handle error
          const result = await sendRequest(EmailLogin, {
            payload: {
              email: values.email,
              password: values.password,
            },
          });
          dispatch({
            type: "login.authenticated",
            user: result.user,
          });
          onLoginSuccess(result.user);
          closeModal && closeModal();
        })}
      >
        <Input
          autoComplete="email"
          className="tw-w-full tw-flex tw-mt-3"
          label="Email"
          {...register("email")}
          value={watch("email")}
        />
        <FormError message={errors.email?.message} />
        <Input
          autoComplete="password"
          type="password"
          className="tw-w-full tw-flex tw-mt-3"
          label="Password"
          {...register("password")}
          value={watch("password")}
        />
        <FormError message={errors.password?.message} />
        <Button type="submit" className="tw-w-full tw-bg-[#3673aa] hover:tw-bg-[#396082] tw-h-12 tw-mt-4">
          Login
        </Button>
      </form>
      <div className="tw-mt-4 tw-text-blue-500 tw-cursor-pointer" onClick={reset}>
        More ways to sign in
      </div>
    </>
  );
};

const EmailSignupSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "The passwords did not match.",
      });
    }
  });

type EmailSignupSchemaType = z.infer<typeof EmailSignupSchema>;

const EmailSignup: React.FC<{ reset: () => void; email?: string; closeModal?: () => void }> = ({
  reset,
  email,
  closeModal,
}) => {
  const dispatch = useDispatch();
  const onLoginSuccess = useOnLoginSuccess();
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<EmailSignupSchemaType>({
    mode: "onBlur",
    defaultValues: {
      email,
    },
    resolver: zodResolver(EmailSignupSchema),
  });

  return (
    <>
      <form
        className="tw-w-full"
        onSubmit={handleSubmit(async (values) => {
          // TODO: handle error
          const result = await sendRequest(CreateUser, {
            payload: {
              email: values.email,
              first_name: values.firstName,
              last_name: values.lastName,
              password: values.password,
              confirm_password: values.confirmPassword,
            },
          });
          dispatch({
            type: "login.authenticated",
            user: result.user,
          });
          onLoginSuccess(result.user);
          closeModal && closeModal();
        })}
      >
        <div className="tw-flex tw-gap-2">
          <div className="tw-flex tw-flex-col">
            <Input
              autoComplete="given-name"
              className="tw-w-full tw-flex tw-mt-3"
              label="First name"
              {...register("firstName")}
              value={watch("firstName")}
            />
            <FormError className="tw-ml-1" message={errors.firstName?.message} />
          </div>
          <div className="tw-flex tw-flex-col">
            <Input
              autoComplete="family-name"
              className="tw-w-full tw-flex tw-mt-3"
              label="Last name"
              {...register("lastName")}
              value={watch("lastName")}
            />
            <FormError className="tw-ml-1" message={errors.lastName?.message} />
          </div>
        </div>
        <Input
          autoComplete="email"
          className="tw-w-full tw-flex tw-mt-3"
          label="Email"
          {...register("email")}
          value={watch("email")}
        />
        <FormError className="tw-ml-1" message={errors.email?.message} />
        <Input
          autoComplete="password"
          type="password"
          className="tw-w-full tw-flex tw-mt-3"
          label="Password"
          {...register("password")}
          value={watch("password")}
        />
        <FormError className="tw-ml-1" message={errors.password?.message} />
        <Input
          autoComplete="password"
          type="password"
          className="tw-w-full tw-flex tw-mt-3"
          label="Confirm Password"
          {...register("confirmPassword")}
          value={watch("confirmPassword")}
        />
        <FormError className="tw-ml-1" message={errors.confirmPassword?.message} />
        <Button type="submit" className="tw-w-full tw-bg-[#3673aa] hover:tw-bg-[#396082] tw-h-12 tw-mt-4">
          Create Account
        </Button>
      </form>
      <div className="tw-mt-4 tw-text-blue-500 tw-cursor-pointer" onClick={reset}>
        More ways to sign up
      </div>
    </>
  );
};

const GoogleLogin: React.FC<{ reset: () => void; email?: string; destination: string; closeModal?: () => void }> = ({
  email,
  reset,
  destination,
  closeModal,
}) => {
  const checkSession = useCheckSession();
  const [loading, setLoading] = useState<boolean>(false);
  const openGooglePopup = () => {
    const handleMessage = async (event: MessageEvent<LoginMessage>) => {
      switch (event.data.type) {
        case MessageType.Done:
          window.removeEventListener("message", handleMessage);
          setLoading(true);
          await checkSession();
          closeModal && closeModal();
          break;
      }
    };
    window.addEventListener("message", handleMessage, false);
    window.open(
      getEndpointUrl(OAuthRedirect, { provider: OAuthProvider.Google, destination }),
      "google-oauth",
      "height=600,width=480",
    );
  };

  if (loading) {
    return (
      <div className="tw-flex tw-h-32 tw-w-full tw-items-center tw-justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="tw-text-center tw-text-base tw-mb-2 tw-select-none">You have an existing account with email:</div>
      <div className="tw-font-medium tw-text-base">{email}</div>
      <div
        className={classNames(
          "tw-relative tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-12 tw-border tw-border-slate-400 hover:tw-bg-slate-100 tw-transition-colors tw-font-medium tw-w-80 tw-text-slate-800 tw-rounded",
        )}
        onClick={openGooglePopup}
      >
        <GoogleIcon className="tw-absolute tw-left-3 tw-h-5" />
        Continue with Google
      </div>
      <div className="tw-mt-5 tw-text-blue-500 tw-cursor-pointer" onClick={reset}>
        Use a different account
      </div>
    </>
  );
};

export const Unauthorized: React.FC = () => {
  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-bg-slate-100">
      <div className="tw-mt-56 tw-mb-auto tw-mx-auto tw-w-[400px] tw-select-none">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg tw-shadow-md tw-bg-white tw-items-center">
          <img src={longlogo} className="tw-h-8 tw-mb-4" alt="coaster logo" />
          <div className="tw-text-center tw-my-2">
            <div className="tw-flex tw-flex-col tw-justify-center">
              <div className="tw-mt-4">
                <NavLink className="tw-text-blue-500" to="/signup">
                  Try again
                </NavLink>{" "}
                with a different account or{" "}
                <a className="tw-text-blue-500" href="mailto:founders@trycoaster.com">
                  contact us
                </a>{" "}
                to resolve your issue!
              </div>
              <img src={mail} alt="mail" className="tw-h-36 tw-mt-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SendResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type SendResetSchemaType = z.infer<typeof SendResetSchema>;

const SendResetForm: React.FC<{ reset: () => void; destination: string }> = ({ reset, destination }) => {
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [sendingReset, setSendingReset] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    watch,
    setError,
    formState: { errors },
  } = useForm<SendResetSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(SendResetSchema),
  });

  if (resetSent) {
    return <div className="tw-text-center">Check your email and follow the instructions there to continue.</div>;
  }

  return (
    <>
      <form
        className="tw-w-full"
        onSubmit={handleSubmit(async (values) => {
          try {
            setSendingReset(true);
            await sendRequest(SendReset, {
              payload: {
                email: values.email,
                destination,
              },
            });

            setResetSent(true);
          } catch (e) {
            // TODO: use error from server once we return a better response
            setError("email", { type: "server", message: "Are you sure you have an account with this email?" });
          }
          setSendingReset(false);
        })}
      >
        <div className="tw-font-bold tw-text-xl tw-w-full tw-text-center tw-mb-2">Reset password</div>
        <div className="tw-w-full tw-text-center tw-mb-2">
          Enter your email to receive a link to reset your password.
        </div>
        <Input
          autoComplete="email"
          className="tw-w-full tw-flex tw-mt-3"
          label="Email"
          {...register("email")}
          value={watch("email")}
        />
        <FormError message={errors.email?.message} />
        <Button type="submit" className="tw-w-full tw-bg-[#3673aa] hover:tw-bg-[#396082] tw-h-12 tw-mt-4">
          {sendingReset ? <Loading /> : "Send Reset"}
        </Button>
      </form>
      <div className="tw-mt-4 tw-text-blue-500 tw-cursor-pointer" onClick={reset}>
        Go back
      </div>
    </>
  );
};
