import classNames from 'classnames';
import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormButton } from 'src/components/button/Button';
import { Loading } from 'src/components/loading/Loading';
import {
  GoogleLoginResponse, useEmailLogin, useHandleGoogleResponse, useRequestValidationCode, useSetOrganization
} from 'src/pages/login/actions';
import { useSelector } from 'src/root/model';
import useWindowDimensions from 'src/utils/window';
import isEmail from 'validator/lib/isEmail';
import styles from './login.m.css';

const GOOGLE_CLIENT_ID = '932264813910-egpk1omo3v2cedd89k8go851uko6djpa.apps.googleusercontent.com';
const CODE_LENGTH = 6;

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

  useEffect(() => {
    if (isAuthenticated && organization) {
      navigate('/');
    }
  }, [isAuthenticated, organization, navigate]);

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

const useScript = (url: string, onload: () => void) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    script.onload = onload;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [url, onload]);
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
      {/* <div className={styles.marginTop}>
      or
    </div>
    <EmailLogin setLoading={setLoading} setStep={setStep} /> */}
    </>
  );
};

type GoogleLoginProps = {
  onGoogleSignIn: (_: GoogleLoginResponse) => void,
  width: number,
};

const GoogleLogin: React.FC<GoogleLoginProps> = props => {
  const googleSignInButton = React.createRef<HTMLDivElement>();

  useScript('https://accounts.google.com/gsi/client', () => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: props.onGoogleSignIn,
    });
    window.google.accounts.id.renderButton(
      googleSignInButton.current!,
      { theme: 'filled_blue', size: 'large', text: 'continue_with', width: props.width }
    );
  });

  return <div ref={googleSignInButton}></div>;
};

interface EmailLoginProps {
  setLoading: (loading: boolean) => void;
  setStep: React.Dispatch<React.SetStateAction<LoginStep>>;
}

const EmailLogin: React.FC<EmailLoginProps> = props => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const requestValidationCode = useRequestValidationCode(props.setStep);

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  };

  const validateEmail = (): boolean => {
    const valid = isEmail(email);
    setIsValid(valid);
    return valid;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    props.setLoading(true);
    if (!validateEmail()) {
      return;
    }

    await requestValidationCode(email);
    props.setLoading(false);
  };

  let classes = [styles.input];
  if (!isValid) {
    classes.push(styles.invalidBorder);
  }

  return (
    <form className={styles.marginTop} onSubmit={onSubmit}>
      <input
        type='text'
        id='email'
        name='email'
        autoComplete='email'
        placeholder='Email'
        className={classNames(classes)}
        onKeyDown={onKeydown}
        onChange={e => setEmail(e.target.value)}
        onBlur={validateEmail}
      />
      {!isValid && <div className={styles.invalidLabel}>Please enter a valid email.</div>}
      <FormButton className={styles.submit} value='Continue' />
    </form>
  );
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

    await setOrganization({ organizationName: organizationInput });
    props.setLoading(false);
  };

  const joinOrganization = async (organizationID: number) => {
    props.setLoading(true);
    // TODO how to specify positional arg with name
    await setOrganization({ organizationID: organizationID });
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
          onChange={e => setOrganizationInput(e.target.value)}
          onBlur={validateOrganization}
        />
        {!isValid && <div className={styles.invalidLabel}>Please enter a valid organization name.</div>}
        <FormButton className={styles.submit} value='Continue' />
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

const ValidationCodeInput: React.FC = () => {
  const email = useSelector(state => state.login.email);
  const [code, setCode] = useState('');
  const [isValid, setIsValid] = useState(true);
  const emailLogin = useEmailLogin();

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  };

  const validateCode = (): boolean => {
    const valid = code.length === CODE_LENGTH;
    setIsValid(valid);
    return valid;
  };

  const updateCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, '');
    setCode(cleaned);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateCode()) {
      return;
    }

    if (!email) {
      console.log('Something went wrong.');
      return;
    }

    emailLogin(email, code);
  };

  let classes = [styles.input];
  if (!isValid) {
    classes.push(styles.invalidBorder);
  }

  return (
    <form className={styles.extraMarginTop} onSubmit={onSubmit}>
      <input
        type='text'
        id='code'
        name='code'
        autoComplete='one-time-code'
        placeholder='Code'
        className={classNames(classes)}
        onKeyDown={onKeydown}
        onChange={updateCode}
        onBlur={validateCode}
        value={code}
      />
      {!isValid && <div className={styles.invalidLabel}>Invalid code.</div>}
      <FormButton className={styles.submit} value='Continue' />
    </form>
  );
};