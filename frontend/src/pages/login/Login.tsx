import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { FormError } from "src/components/FormError";
import { GoogleIcon } from "src/components/icons/Google";
import longlogo from "src/components/images/long-logo.svg";
import mail from "src/components/images/mail.svg";
import { Input } from "src/components/input/Input";
import { useDispatch, useSelector } from "src/root/model";
import { getEndpointUrl, sendRequest } from "src/rpc/ajax";
import { CheckEmail, CreateUser, EmailLogin, OAuthRedirect } from "src/rpc/api";
import { LoginMethod, OAuthProvider } from "src/rpc/types";
import { z } from "zod";

enum LoginStep {
  Start = "start",
  EmailCreate = "email-create",
  EmailLogin = "email-login",
  GoogleLogin = "google-login",
}

export const Login: React.FC<{ create?: boolean }> = ({ create }) => {
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  const [step, setStep] = useState<LoginStep>(LoginStep.Start);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  // Use effect to navigate after render if authenticated
  useEffect(() => {
    let ignore = false;
    if (isAuthenticated && !ignore) {
      navigate("/");
    }

    return () => {
      ignore = true;
    };
  }, [navigate, isAuthenticated]);

  const reset = () => {
    setStep(LoginStep.Start);
    setEmail(undefined);
  };

  let loginContent;
  switch (step) {
    case LoginStep.Start:
      loginContent = <StartContent create={create} setStep={setStep} setEmail={setEmail} />;
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
  }

  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-bg-slate-100">
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

const StartContent: React.FC<{
  create?: boolean;
  setStep: (step: LoginStep) => void;
  setEmail: (email: string) => void;
}> = ({ create, setStep, setEmail }) => {
  const loginError = useSelector((state) => state.login.error);

  return (
    <>
      {loginError && <div className="tw-text-red-500">{loginError?.toString()}</div>}
      <div className="tw-text-center tw-text-base tw-font-medium tw-mb-2 tw-select-none">
        {create ? "Welcome to Coaster." : "Sign in to continue to Coaster."}
      </div>
      <EmailCheck setStep={setStep} setEmail={setEmail} />
      <div className='tw-flex tw-w-full tw-items-center tw-text-sm tw-mt-5 tw-justify-between before:tw-block before:tw-w-full before:tw-h-px before:tw-content-[" "] before:tw-bg-gray-300 before:tw-mr-4 before:tw-ml-px after:tw-block after:tw-w-full after:tw-h-px after:tw-content-[" "] after:tw-bg-gray-300 after:tw-ml-4 after:tw-mr-px'>
        or
      </div>
      <a
        className={classNames(
          "tw-relative tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-12 tw-bg-white tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-transition-colors tw-font-medium tw-w-full tw-text-slate-800 tw-rounded",
        )}
        href={getEndpointUrl(OAuthRedirect, { provider: OAuthProvider.Google })}
      >
        <GoogleIcon className="tw-absolute tw-left-3 tw-h-5" />
        Continue with Google
      </a>
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
    </>
  );
};

const EmailCheckSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type EmailCheckSchemaType = z.infer<typeof EmailCheckSchema>;

const EmailCheck: React.FC<{ setStep: (step: LoginStep) => void; setEmail: (email: string) => void }> = ({
  setStep,
  setEmail,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<EmailCheckSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(EmailCheckSchema),
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
      <Input autoComplete="email" className="tw-w-full tw-flex tw-mt-3" label="Email" {...register("email")} />
      <FormError message={errors.email?.message} />
      <button
        type="submit"
        className="tw-flex tw-items-center tw-justify-center tw-w-full tw-bg-[#3673aa] tw-text-white tw-font-medium tw-text-base tw-rounded-md tw-h-12 tw-mt-4"
      >
        Submit
      </button>
    </form>
  );
};

const EmailLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type EmailLoginSchemaType = z.infer<typeof EmailLoginSchema>;

const EmailLoginForm: React.FC<{ reset: () => void; email?: string }> = ({ reset, email }) => {
  const dispatch = useDispatch();
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

  // Needed to display label correctly
  const emailValue = watch("email");

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
        })}
      >
        <Input
          autoComplete="email"
          className="tw-w-full tw-flex tw-mt-3"
          label="Email"
          {...register("email")}
          value={emailValue}
        />
        <FormError message={errors.email?.message} />
        <Input
          autoComplete="password"
          type="password"
          className="tw-w-full tw-flex tw-mt-3"
          label="Password"
          {...register("password")}
        />
        <FormError message={errors.password?.message} />
        <button
          type="submit"
          className="tw-flex tw-items-center tw-justify-center tw-w-full tw-bg-[#3673aa] tw-text-white tw-font-medium tw-text-base tw-rounded-md tw-h-12 tw-mt-4"
        >
          Submit
        </button>
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

const EmailSignup: React.FC<{ reset: () => void; email?: string }> = ({ reset, email }) => {
  const dispatch = useDispatch();
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

  // Needed to display label correctly
  const emailValue = watch("email");

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
        })}
      >
        <div className="tw-flex tw-gap-2">
          <div className="tw-flex tw-flex-col">
            <Input
              autoComplete="given-name"
              className="tw-w-full tw-flex tw-mt-3"
              label="First name"
              {...register("firstName")}
            />
            <FormError className="tw-ml-1" message={errors.firstName?.message} />
          </div>
          <div className="tw-flex tw-flex-col">
            <Input
              autoComplete="family-name"
              className="tw-w-full tw-flex tw-mt-3"
              label="Last name"
              {...register("lastName")}
            />
            <FormError className="tw-ml-1" message={errors.lastName?.message} />
          </div>
        </div>
        <Input
          autoComplete="email"
          className="tw-w-full tw-flex tw-mt-3"
          label="Email"
          {...register("email")}
          value={emailValue}
        />
        <FormError className="tw-ml-1" message={errors.email?.message} />
        <Input
          autoComplete="password"
          type="password"
          className="tw-w-full tw-flex tw-mt-3"
          label="Password"
          {...register("password")}
        />
        <FormError className="tw-ml-1" message={errors.password?.message} />
        <Input
          autoComplete="password"
          type="password"
          className="tw-w-full tw-flex tw-mt-3"
          label="Confirm Password"
          {...register("confirmPassword")}
        />
        <FormError className="tw-ml-1" message={errors.confirmPassword?.message} />
        <button
          type="submit"
          className="tw-flex tw-items-center tw-justify-center tw-w-full tw-bg-[#3673aa] tw-text-white tw-font-medium tw-text-base tw-rounded-md tw-h-12 tw-mt-4"
        >
          Submit
        </button>
      </form>
      <div className="tw-mt-4 tw-text-blue-500 tw-cursor-pointer" onClick={reset}>
        More ways to sign up
      </div>
    </>
  );
};

const GoogleLogin: React.FC<{ reset: () => void; email?: string }> = ({ email, reset }) => {
  return (
    <>
      <div className="tw-text-center tw-text-base tw-mb-2 tw-select-none">You have an existing account with email:</div>
      <div className="tw-font-medium tw-text-base">{email}</div>
      <a
        className={classNames(
          "tw-relative tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-12 tw-border tw-border-slate-400 hover:tw-bg-slate-100 tw-transition-colors tw-font-medium tw-w-80 tw-text-slate-800 tw-rounded",
        )}
        href={getEndpointUrl(OAuthRedirect, { provider: OAuthProvider.Google })}
      >
        <GoogleIcon className="tw-absolute tw-left-3 tw-h-5" />
        Continue with Google
      </a>
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
              <div>Something went wrong.</div>
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
