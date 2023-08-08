import classNames from "classnames";
import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GithubIcon } from "src/components/icons/Github";
import { GoogleIcon } from "src/components/icons/Google";
import longlogo from "src/components/images/long-logo.svg";
import mail from "src/components/images/mail.svg";
import { useSelector } from "src/root/model";
import { getEndpointUrl } from "src/rpc/ajax";
import { OAuthRedirect } from "src/rpc/api";
import { OAuthProvider } from "src/rpc/types";

export const Login: React.FC<{ create?: boolean }> = ({ create }) => {
  const isAuthenticated = useSelector((state) => state.login.authenticated);
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

  let loginContent;
  if (!isAuthenticated) {
    loginContent = <StartContent create={create} />;
  }

  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-bg-slate-100">
      <div className="tw-mt-32 tw-mb-auto tw-mx-auto tw-w-[400px]">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg tw-shadow-md tw-bg-white tw-items-center">
          <img src={longlogo} className="tw-h-8 tw-select-none tw-mb-4" alt="fabra logo" />
          <div className="tw-flex tw-flex-col tw-items-center tw-my-2">{loginContent}</div>
        </div>
        <div className="tw-text-xs tw-text-center tw-mt-4 tw-text-slate-800 tw-select-none">
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

const StartContent: React.FC<{ create?: boolean }> = ({ create }) => {
  const loginError = useSelector((state) => state.login.error);
  return (
    <>
      {loginError && <div className="tw-text-red-500">{loginError?.toString()}</div>}
      <div className="tw-text-center tw-text-base tw-font-medium tw-mb-2 tw-select-none">
        {create ? "Welcome to Coaster." : "Sign in to continue to Coaster."}
      </div>
      <a
        className={classNames(
          "tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-10 tw-bg-slate-100 tw-border tw-border-slate-300 hover:tw-bg-slate-200 tw-transition-colors tw-font-medium tw-w-80 tw-text-slate-800 tw-rounded",
        )}
        href={getEndpointUrl(OAuthRedirect, { provider: OAuthProvider.Google })}
      >
        <GoogleIcon className="tw-mr-1.5 tw-h-[18px]" />
        Continue with Google
      </a>
      <a
        className={classNames(
          "tw-flex tw-items-center tw-select-none tw-cursor-pointer tw-justify-center tw-mt-4 tw-h-10 tw-bg-black hover:tw-bg-[#333333] tw-transition-colors tw-font-medium tw-w-80 tw-text-white tw-rounded",
        )}
        href={getEndpointUrl(OAuthRedirect, { provider: OAuthProvider.Github })}
      >
        <GithubIcon className="tw-mr-2" />
        Continue with Github
      </a>
      {create ? (
        <div className="tw-mt-5  tw-select-none">
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

export const Unauthorized: React.FC = () => {
  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-bg-slate-100">
      <div className="tw-mt-56 tw-mb-auto tw-mx-auto tw-w-[400px] tw-select-none">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg tw-shadow-md tw-bg-white tw-items-center">
          <img src={longlogo} className="tw-h-8 tw-mb-4" alt="fabra logo" />
          <div className="tw-text-center tw-my-2">
            <div className="tw-flex tw-flex-col tw-justify-center">
              <div>You must use a business account to access Fabra.</div>
              <div className="tw-mt-4">
                <NavLink className="tw-text-blue-500" to="/signup">
                  Try again
                </NavLink>{" "}
                with a different account or{" "}
                <a className="tw-text-blue-500" href="mailto:founders@trycoaster.com">
                  contact us
                </a>{" "}
                to get an account provisioned!
              </div>
              <img src={mail} alt="mail" className="tw-h-36 tw-mt-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
