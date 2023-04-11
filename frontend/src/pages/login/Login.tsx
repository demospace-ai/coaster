import classNames from "classnames";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormButton } from "src/components/button/Button";
import longlogo from "src/components/images/long-logo.svg";
import mail from "src/components/images/mail.svg";
import { LogoLoading } from "src/components/loading/LogoLoading";
import {
  GoogleLoginResponse, useHandleGoogleResponse, useSetOrganization
} from "src/pages/login/actions";
import { useSelector } from "src/root/model";
import useWindowDimensions from "src/utils/window";

const GOOGLE_CLIENT_ID = "932264813910-egpk1omo3v2cedd89k8go851uko6djpa.apps.googleusercontent.com";

export enum LoginStep {
  Start = 1,
  ValidateCode,
  Organization,
}

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const handleGoogleResponse = useHandleGoogleResponse();
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);
  const unauthorized = useSelector(state => state.login.unauthorized);
  const navigate = useNavigate();

  // Use effect to navigate after render if authenticated
  useEffect(() => {
    let ignore = false;
    if (isAuthenticated && organization && !ignore) {
      navigate("/");
    }

    return () => {
      ignore = true;
    };
  }, [navigate, isAuthenticated, organization]);

  if (loading) {
    return (
      <LogoLoading />
    );
  }

  const onGoogleSignIn = async (response: GoogleLoginResponse) => {
    setLoading(true);
    await handleGoogleResponse(response);
    setLoading(false);
  };

  let loginContent;
  if (!isAuthenticated) {
    loginContent = <StartContent onGoogleSignIn={onGoogleSignIn} />;
  } else if (!organization) {
    loginContent = <OrganizationInput setLoading={setLoading} />;
  }

  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-bg-slate-100">
      <div className="tw-mt-56 tw-mb-auto tw-mx-auto tw-w-[400px]">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg tw-shadow-md tw-bg-white tw-items-center">
          <img src={longlogo} className="tw-h-8 tw-select-none tw-mb-4" alt="fabra logo" />
          <div className="tw-text-center tw-my-2">
            {unauthorized ?
              <div className="tw-flex tw-flex-col tw-justify-center">
                <div>
                  You don't have access to Fabra yet. Contact us at <a className="tw-text-blue-500" href="mailto:founders@fabra.io">founders@fabra.io</a> to get an account provisioned!
                </div>
                <img src={mail} alt="mail" className="tw-h-36 tw-mt-5" />
              </div>
              :
              <>{loginContent}</>}
          </div>
        </div>
        <div className="tw-text-xs tw-text-center tw-mt-4 tw-text-slate-800">
          By continuing you agree to Fabra's <a className="tw-text-blue-500" href="https://fabra.io/terms" target="_blank" rel="noreferrer">Terms of Service</a> and <a className="tw-text-blue-500" href="https://fabra.io/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

type StartContentProps = {
  onGoogleSignIn: (_: GoogleLoginResponse) => void,
};

const StartContent: React.FC<StartContentProps> = props => {
  // Hack to adjust Google login button width for mobile since CSS is not supported
  const { width } = useWindowDimensions();
  const googleButtonWidth = width > 600 ? 320 : 300;

  return (
    <>
      <div className="tw-text-center tw-mb-10">Sign in to continue to Fabra.</div>
      <GoogleLogin onGoogleSignIn={props.onGoogleSignIn} width={googleButtonWidth} />
    </>
  );
};

type GoogleLoginProps = {
  onGoogleSignIn: (_: GoogleLoginResponse) => void,
  width: number,
};

let googleScriptLoaded = false;

const GoogleLogin: React.FC<GoogleLoginProps> = props => {
  const buttonRef = useRef<HTMLDivElement>(null);

  // Use effect to wait until after the component is rendered
  useEffect(() => {
    const onLoad = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: props.onGoogleSignIn,
      });
      window.google.accounts.id.renderButton(
        buttonRef.current!,
        { theme: "filled_blue", size: "large", text: "continue_with", width: props.width }
      );
    };

    if (googleScriptLoaded) {
      onLoad();
    } else {
      const script = document.createElement("script");

      script.src = "https://accounts.google.com/gsi/client";
      script.onload = onLoad;

      document.head.appendChild(script);
      googleScriptLoaded = true;
    }
  }, [props.onGoogleSignIn, props.width]);

  return <div className="tw-flex tw-justify-center" ref={buttonRef}></div>;
};

type OrganizationInputProps = {
  setLoading: (loading: boolean) => void;
};

const OrganizationInput: React.FC<OrganizationInputProps> = props => {
  const user = useSelector(state => state.login.user);
  const suggestedOrganizations = useSelector(state => state.login.suggestedOrganizations);
  const [organizationInput, setOrganizationInput] = useState("");
  const setOrganization = useSetOrganization();
  const [isValid, setIsValid] = useState(true);
  const [overrideCreate, setOverrideCreate] = useState(false);

  const classes = ["tw-border tw-border-slate-400 tw-rounded-md tw-px-3 tw-py-2 tw-w-full tw-box-border"];
  if (!isValid) {
    classes.push("tw-border-red-500 tw-outline-none");
  }

  const validateOrganization = (): boolean => {
    const valid = organizationInput.length > 0;
    setIsValid(valid);
    return valid;
  };

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  };

  const createNewOrganization = async (e: FormEvent) => {
    e.preventDefault();
    props.setLoading(true);
    if (!validateOrganization()) {
      return;
    }

    await setOrganization(user!, { organizationName: organizationInput });
    props.setLoading(false);
  };

  const joinOrganization = async (organizationID: number) => {
    props.setLoading(true);
    // TODO how to specify positional arg with name
    await setOrganization(user!, { organizationID: organizationID });
  };

  if (!suggestedOrganizations || suggestedOrganizations.length === 0 || overrideCreate) {
    return (
      <form className="tw-mt-5" onSubmit={createNewOrganization}>
        <div className="tw-mb-5">Welcome, {user!.first_name}! Let's build out your team.</div>
        <input
          type="text"
          id="organization"
          name="organization"
          autoComplete="organization"
          placeholder="Organization Name"
          className={classNames(classes)}
          onKeyDown={onKeydown}
          onFocus={() => setIsValid(true)}
          onChange={e => setOrganizationInput(e.target.value)}
          onBlur={validateOrganization}
        />
        {!isValid && <div className="tw-text-red-500 tw-mt-1 -tw-mb-1 tw-text-[15px] tw-text-left">Please enter a valid organization name.</div>}
        <FormButton className="tw-mt-5 tw-h-10 tw-w-full">Continue</FormButton>
      </form>
    );
  }

  return (
    <div className="tw-mt-5" >
      <div className="tw-mb-5">Welcome, {user!.first_name}! Join your team.</div>
      {suggestedOrganizations.map((suggestion, index) => (
        <li key={index} className="tw-border tw-border-black tw-rounded-md tw-list-none tw-p-8 tw-text-left tw-flex tw-flex-row">
          <Button className="tw-inline-block tw-mr-8 tw-h-10 tw-w-1/2" onClick={() => joinOrganization(suggestion.id)}>Join</Button>
          <div className="tw-flex tw-flex-col tw-h-10 tw-w-1/2 tw-text-center tw-justify-center">
            <div className="tw-overflow-hidden tw-text-ellipsis tw-font-bold tw-text-lg">{suggestion.name}</div>
            {/* TODO: add team size */}
          </div>
        </li>
      ))}
      <div className="tw-my-5 tw-mx-0">or</div>
      <Button className="tw-w-full tw-h-10" onClick={() => setOverrideCreate(true)} >Create new organization</Button>
    </div>
  );
};
