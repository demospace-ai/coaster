import classNames from 'classnames';
import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormButton } from 'src/components/button/Button';
import { Loading } from 'src/components/loading/Loading';
import {
  GoogleLoginResponse, useEmailLogin, useHandleGoogleResponse, useRequestValidationCode
} from 'src/pages/login/actions';
import loginImage from 'src/pages/login/login.png';
import { useSelector } from 'src/root/model';
import useWindowDimensions from 'src/utils/window';
import isEmail from 'validator/lib/isEmail';
import styles from './login.m.css';

const GOOGLE_CLIENT_ID = '932264813910-egpk1omo3v2cedd89k8go851uko6djpa.apps.googleusercontent.com';
const CODE_LENGTH = 6;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const validatingCode = useSelector(state => state.login.validatingCode);
  const isAuthenticated = useSelector(state => state.login.authenticated);
  const handleGoogleResponse = useHandleGoogleResponse();
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
  // Hack to adjust Google login button width for mobile since CSS is not supported
  const googleButtonWidth = width > 600 ? 400 : 300;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <Loading />
    );
  }

  const loginOptions = (
    <>
      <GoogleLogin onGoogleSignIn={handleGoogleResponse} width={googleButtonWidth} />
      <div className={styles.marginTop}>
        or
      </div>
      <EmailLogin setLoading={setLoading} />
    </>
  );

  return (
    <div className={styles.loginPage}>
      <div className={styles.infoPane}>
        <h1 className={styles.imageTitle}>Find the answer to every question</h1>
        <img className={styles.loginImage} src={loginImage} alt='A rocket ship' />
      </div>
      <div className={styles.loginPane}>

        <h1 className={styles.center}>Welcome to Fabra!</h1>
        <div className={classNames(styles.center, styles.loginGroup)}>
          {validatingCode ? (<ValidationCodeInput />) : loginOptions}
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