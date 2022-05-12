import { useDispatch } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { Login, ValidationCode } from 'src/rpc/api';

export type GoogleLoginResponse = {
  credential: string;
};

export type GoogleLoginHandler = (response: GoogleLoginResponse) => void;

export function useHandleGoogleResponse(): GoogleLoginHandler {
  const dispatch = useDispatch();
  return async (response: GoogleLoginResponse) => {
    const id_token = response.credential;
    const payload = { 'id_token': id_token };
    try {
      const loginResponse = await sendRequest(Login, payload);
      dispatch({
        type: 'login.authenticated',
        firstName: loginResponse.first_name,
        lastName: loginResponse.last_name,
      });
    } catch (e) {
    }
  };
}

export function useRequestValidationCode() {
  const dispatch = useDispatch();
  return async (email: string) => {
    const payload = { 'email': email };
    try {
      await sendRequest(ValidationCode, payload);
      dispatch({
        type: 'login.validateCode',
        email: email,
      });
    } catch (e) {
    }
  };
}

export function useEmailLogin() {
  const dispatch = useDispatch();
  return async (email: string, code: string) => {
    const payload = {
      'email_authentication': {
        'email': email,
        'validation_code': code,
      }
    };
    try {
      const loginResponse = await sendRequest(Login, payload);
      dispatch({
        type: 'login.authenticated',
        firstName: loginResponse.first_name,
        lastName: loginResponse.last_name,
      });
    } catch (e) {
    }
  };
}