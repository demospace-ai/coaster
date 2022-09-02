import classNames from 'classnames';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormButton } from 'src/components/button/Button';
import { Loading } from 'src/components/loading/Loading';
import {
  GoogleLoginResponse, useHandleGoogleResponse, useSetOrganization
} from 'src/pages/login/actions';
import { useSelector } from 'src/root/model';
import useWindowDimensions from 'src/utils/window';
import styles from './login.m.css';

const GOOGLE_CLIENT_ID = '932264813910-egpk1omo3v2cedd89k8go851uko6djpa.apps.googleusercontent.com';

export enum LoginStep {
  Start = 1,
  ValidateCode,
  Organization,
}

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const handleGoogleResponse = useHandleGoogleResponse(setLoading);
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const organization = useSelector(state => state.login.organization);
  const navigate = useNavigate();

  // Use effect to navigate after render if authenticated
  useEffect(() => {
    if (isAuthenticated && organization) {
      navigate('/');
    }
  }, [navigate, isAuthenticated, organization]);

  if (loading) {
    return (
      <Loading />
    );
  }

  let loginContent;
  if (!isAuthenticated) {
    loginContent = <StartContent onGoogleSignIn={handleGoogleResponse} />;
  } else if (!organization) {
    loginContent = <OrganizationInput setLoading={setLoading} />;
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginPane}>
        <div className={classNames(styles.title, "tw-text-3xl", "tw-font-bold")}>fabra</div>
        <div className={styles.loginGroup}>
          {loginContent}
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
  const googleButtonWidth = width > 600 ? 350 : 300;

  return (
    <>
      <div className={styles.signInText}>Sign in to your account</div>
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
        { theme: 'filled_blue', size: 'large', text: 'continue_with', width: props.width }
      );
    };

    if (googleScriptLoaded) {
      onLoad();
    } else {
      const script = document.createElement('script');

      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = onLoad;

      document.head.appendChild(script);
      googleScriptLoaded = true;
    }
  }, [props.onGoogleSignIn, props.width]);

  return <div ref={buttonRef}></div>;
};

type OrganizationInputProps = {
  setLoading: (loading: boolean) => void;
};

const OrganizationInput: React.FC<OrganizationInputProps> = props => {
  const user = useSelector(state => state.login.user);
  const suggestedOrganizations = useSelector(state => state.login.suggestedOrganizations);
  const [organizationInput, setOrganizationInput] = useState('');
  const setOrganization = useSetOrganization();
  const [isValid, setIsValid] = useState(true);
  const [overrideCreate, setOverrideCreate] = useState(false);

  let classes = [styles.input];
  if (!isValid) {
    classes.push(styles.invalidBorder);
  }

  const validateOrganization = (): boolean => {
    const valid = organizationInput.length > 0;
    setIsValid(valid);
    return valid;
  };

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
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
      <form className={styles.marginTop} onSubmit={createNewOrganization}>
        <div className={styles.organizationMessage}>Welcome, {user!.first_name}! Let's build out your team.</div>
        <input
          type='text'
          id='organization'
          name='organization'
          autoComplete='organization'
          placeholder='Organization Name'
          className={classNames(classes)}
          onKeyDown={onKeydown}
          onFocus={() => setIsValid(true)}
          onChange={e => setOrganizationInput(e.target.value)}
          onBlur={validateOrganization}
        />
        {!isValid && <div className={styles.invalidLabel}>Please enter a valid organization name.</div>}
        <FormButton className={styles.submit}>Continue</FormButton>
      </form>
    );
  }

  return (
    <div className={styles.marginTop} >
      <div className={styles.organizationMessage}>Welcome, {user!.first_name}! Join your team.</div>
      {suggestedOrganizations.map((suggestion, index) => (
        <li key={index} className={styles.suggestion}>
          <Button className={styles.joinButton} onClick={() => joinOrganization(suggestion.id)}>Join</Button>
          <div className={styles.teamInfo}>
            <div className={styles.teamName}>{suggestion.name}</div>
            {/* TODO: add team size */}
          </div>
        </li>
      ))}
      <div className={styles.orDivider}>or</div>
      <Button className={styles.createNewButton} onClick={() => setOverrideCreate(true)} secondary={true}>Create new organization</Button>
    </div>
  );
};
