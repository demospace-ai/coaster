import classNames from 'classnames';
import React, { FormEvent, useEffect, useState } from 'react';
import {
  GoogleLoginResponse, useEmailLogin, useHandleGoogleResponse, useRequestValidationCode
} from 'src/components/login/actions';
import { useSelector } from 'src/root/model';
import isEmail from 'validator/lib/isEmail';
import styles from './login.m.css';

const GOOGLE_CLIENT_ID = '932264813910-egpk1omo3v2cedd89k8go851uko6djpa.apps.googleusercontent.com';
const CODE_LENGTH = 6;

interface LoginProps {
  closeModal: () => void;
}

export const Login: React.FC<LoginProps> = props => {
  const [loading, setLoading] = useState(false);
  const validatingCode = useSelector(state => state.login.validatingCode);
  const authenticated = useSelector(state => state.login.authenticated);
  const handleGoogleResponse = useHandleGoogleResponse();

  if (authenticated) {
    props.closeModal();
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    )
  }

  const loginOptions = (
    <>
      <GoogleLogin onGoogleSignIn={handleGoogleResponse} />
      <div className={styles.marginTop}>
        or
      </div>
      <EmailLogin setLoading={setLoading} />
    </>
  );

  return (
    <div className={styles.loginContainer}>
      <h2 className={classNames(styles.center, styles.header)}>Fabra</h2>
      <div className={classNames(styles.center, styles.loginGroup)}>
        {validatingCode ? (<ValidationCodeInput />) : loginOptions}
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

function GoogleLogin({
  onGoogleSignIn = (response: GoogleLoginResponse) => { },
  text = 'continue_with',
}) {
  const googleSignInButton = React.createRef<HTMLDivElement>();

  useScript('https://accounts.google.com/gsi/client', () => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onGoogleSignIn,
    });
    window.google.accounts.id.renderButton(
      googleSignInButton.current!,
      { theme: 'filled_blue', size: 'large', text, width: '320', } // customization attributes
    );
  });

  return <div className='google-login' ref={googleSignInButton}></div>;
}

interface EmailLoginProps {
  setLoading: (loading: boolean) => void;
}

const EmailLogin: React.FC<EmailLoginProps> = props => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const requestValidationCode = useRequestValidationCode();

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  }

  const validateEmail = (): boolean => {
    const valid = isEmail(email);
    setIsValid(valid);
    return valid;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    props.setLoading(true);
    if (!validateEmail()) {
      return;
    }

    await requestValidationCode(email);
    props.setLoading(false);
  }

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
      <input type='submit' value='Continue' className={styles.submit} />
    </form>
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
  }

  const validateCode = (): boolean => {
    const valid = code.length === CODE_LENGTH;
    setIsValid(valid);
    return valid;
  }

  const updateCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, '');
    setCode(cleaned);
  }

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
  }

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
      <input type='submit' value='Continue' className={styles.submit} />
    </form>
  );
};