"use client";

import { useOnLoginSuccess } from "@coaster/rpc/client";
import {
  CheckEmail,
  CheckSession,
  CreateUser,
  EmailLogin,
  OAuthRedirect,
  SendReset,
  getEndpointUrl,
  sendRequest,
} from "@coaster/rpc/common";
import { LoginMethod, OAuthProvider } from "@coaster/types";
import { mergeClasses } from "@coaster/utils/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../button/Button";
import { FormError } from "../error/FormError";
import { GoogleIcon } from "../icons/Google";
import { Input } from "../input/Input";
import { NavLink } from "../link/Link";
import { Loading } from "../loading/Loading";
import { LoginMessage, MessageType } from "./message";

export enum LoginStep {
  Start = "start",
  EmailCreate = "email-create",
  EmailLogin = "email-login",
  GoogleLogin = "google-login",
  SendReset = "send-reset",
}

export const StartContent: React.FC<{
  create?: boolean;
  setStep: (step: LoginStep) => void;
  email?: string;
  setEmail: (email: string) => void;
  closeModal?: () => void;
  switchModeModal?: (create: boolean) => void;
}> = ({ create, setStep, email, setEmail, closeModal, switchModeModal }) => {
  const [loginError, setLoginError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const openGooglePopup = useOpenGooglePopup(setLoading, setLoginError, closeModal);

  if (loading) {
    return (
      <div className="tw-flex tw-flex-col tw-h-32 tw-w-full tw-items-center tw-justify-center">
        Continue in new window...
        <Loading />
      </div>
    );
  }
  return (
    <>
      <div className="tw-text-center tw-text-base tw-font-medium tw-mb-2 tw-select-none">
        {create ? "Welcome to Coaster." : "Sign in to continue to Coaster."}
      </div>
      <EmailCheck email={email} setStep={setStep} setEmail={setEmail} />
      <div className='tw-flex tw-w-full tw-items-center tw-text-sm tw-mt-5 tw-justify-between before:tw-block before:tw-w-full before:tw-h-px before:tw-content-[" "] before:tw-bg-gray-300 before:tw-mr-4 before:tw-ml-px after:tw-block after:tw-w-full after:tw-h-px after:tw-content-[" "] after:tw-bg-gray-300 after:tw-ml-4 after:tw-mr-px'>
        or
      </div>
      <div
        className={mergeClasses(
          "tw-relative tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-12 tw-bg-white tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-transition-colors tw-font-medium tw-w-full tw-text-slate-800 tw-rounded",
        )}
        onClick={openGooglePopup}
      >
        <GoogleIcon className="tw-absolute tw-left-3 tw-h-5" />
        Continue with Google
      </div>
      {loginError && <div className="tw-text-red-500">{loginError}</div>}
      {switchModeModal ? (
        <SwitchModeModal create={create} switchModeModal={switchModeModal} />
      ) : (
        <SwitchModePage create={create} />
      )}
      <div className="tw-mt-3 tw-select-none">
        <span className="tw-text-blue-500 tw-cursor-pointer" onClick={() => setStep(LoginStep.SendReset)}>
          Forgot your password?
        </span>
      </div>
    </>
  );
};

const SwitchModePage: React.FC<{ create: boolean | undefined }> = ({ create }) => {
  return (
    <>
      {create ? (
        <div className="tw-mt-5 tw-select-none">
          Already have an account?{" "}
          <NavLink className="tw-text-blue-500" href="/login">
            Sign in
          </NavLink>
        </div>
      ) : (
        <div className="tw-mt-5 tw-select-none">
          Need an account?{" "}
          <NavLink className="tw-text-blue-500" href="/signup">
            Sign up
          </NavLink>
        </div>
      )}
    </>
  );
};

const SwitchModeModal: React.FC<{ create: boolean | undefined; switchModeModal: (create: boolean) => void }> = ({
  create,
  switchModeModal,
}) => {
  return (
    <>
      {create ? (
        <div className="tw-mt-5 tw-select-none">
          Already have an account?{" "}
          <span className="tw-text-blue-500 tw-cursor-pointer" onClick={() => switchModeModal(false)}>
            Sign in
          </span>
        </div>
      ) : (
        <div className="tw-mt-5 tw-select-none">
          Need an account?{" "}
          <span className="tw-text-blue-500 tw-cursor-pointer" onClick={() => switchModeModal(true)}>
            Sign up
          </span>
        </div>
      )}
    </>
  );
};

const EmailCheckSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type EmailCheckSchemaType = z.infer<typeof EmailCheckSchema>;

export const EmailCheck: React.FC<{
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
        const result = await sendRequest(CheckEmail, {
          queryParams: { email: values.email },
        });
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

export const EmailLoginForm: React.FC<{
  reset: () => void;
  forgotPassword: () => void;
  email?: string;
  closeModal?: () => void;
}> = ({ reset, forgotPassword, email, closeModal }) => {
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
      <div className="tw-mt-3 tw-select-none tw-text-blue-500 tw-cursor-pointer" onClick={forgotPassword}>
        Forgot your password?
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

export const EmailSignup: React.FC<{
  reset: () => void;
  email?: string;
  closeModal?: () => void;
}> = ({ reset, email, closeModal }) => {
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

export const GoogleLogin: React.FC<{
  reset: () => void;
  email?: string;
  closeModal?: () => void;
}> = ({ email, reset, closeModal }) => {
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const openGooglePopup = useOpenGooglePopup(setLoading, setLoginError, closeModal);

  if (loading) {
    return (
      <div className="tw-flex tw-h-32 tw-w-full tw-items-center tw-justify-center">
        Continue in new window...
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="tw-text-center tw-text-base tw-mb-2 tw-select-none">You have an existing account with email:</div>
      <div className="tw-font-medium tw-text-base">{email}</div>
      <div
        className={mergeClasses(
          "tw-relative tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-12 tw-border tw-border-slate-400 hover:tw-bg-slate-100 tw-transition-colors tw-font-medium tw-w-80 tw-text-slate-800 tw-rounded",
        )}
        onClick={openGooglePopup}
      >
        <GoogleIcon className="tw-absolute tw-left-3 tw-h-5" />
        Continue with Google
      </div>
      {loginError && <div className="tw-text-red-500">{loginError}</div>}
      <div className="tw-mt-5 tw-text-blue-500 tw-cursor-pointer" onClick={reset}>
        Use a different account
      </div>
    </>
  );
};

const SendResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type SendResetSchemaType = z.infer<typeof SendResetSchema>;

export const SendResetForm: React.FC<{
  initialEmail?: string;
  reset: () => void;
  destination: string;
}> = ({ initialEmail, reset, destination }) => {
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
    defaultValues: {
      email: initialEmail,
    },
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
            setError("email", {
              type: "server",
              message: "Are you sure you have an account with this email?",
            });
          }
          setSendingReset(false);
        })}
      >
        <div className="tw-font-bold tw-font-minion tw-text-xl tw-w-full tw-text-center tw-mb-2">Reset password</div>
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

const useOpenGooglePopup = (
  setLoading: (loading: boolean) => void,
  setLoginError: (error: string) => void,
  closeModal?: () => void,
) => {
  const onLoginSuccess = useOnLoginSuccess();
  const [receivedDone, setReceivedDone] = useState<boolean>(false);

  // Not exported because everywhere else should use getUserServer or useAuthContext
  // We do this because the redirect to the OAuth callback page cannot directly fetch the user
  // because browsers do not send cookies on redirects from foreign referrers with SameSite=Strict
  const checkForCompletion = async (loginWindow: Window | null) => {
    if (loginWindow?.closed) {
      if (receivedDone) {
        return;
      }

      try {
        const checkSessionResponse = await sendRequest(CheckSession);
        await onLoginSuccess(checkSessionResponse.user);
        closeModal && closeModal();
      } catch (e) {
        setLoginError("Login window was closed.");
        setLoading(false);
      }
    } else {
      setTimeout(() => checkForCompletion(loginWindow), 1000);
    }
  };

  return useCallback(() => {
    setLoading(true);
    const handleMessage = async (event: MessageEvent<LoginMessage>) => {
      if (event.data.type === MessageType.Done) {
        setReceivedDone(true);
        window.removeEventListener("message", handleMessage);
        try {
          const checkSessionResponse = await sendRequest(CheckSession);
          await onLoginSuccess(checkSessionResponse.user);
          closeModal && closeModal();
        } catch (e) {
          setLoginError("Failed to login with Google.");
          setLoading(false);
        }
      }
    };
    const y = window.outerHeight / 2 + window.screenY - 300;
    const x = window.outerWidth / 2 + window.screenX - 240;
    window.addEventListener("message", handleMessage);
    const loginWindow = window.open(
      getEndpointUrl(OAuthRedirect, { provider: OAuthProvider.Google, origin: window.location.origin }),
      "google-oauth",
      `height=600,width=480 top=${y} left=${x}`,
    );

    // periodically check for completion
    setTimeout(() => {
      checkForCompletion(loginWindow);
    }, 1000);
  }, [setLoading, setLoginError, closeModal]);
};
