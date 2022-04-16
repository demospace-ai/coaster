import { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import { useDispatch } from "src/root/model";
import { sendRequest } from 'src/rpc/ajax';
import { Login, ValidationCode } from "src/rpc/api";

function isGoogleLoginResponse(response: GoogleLoginResponse | GoogleLoginResponseOffline): response is GoogleLoginResponse {
  return (response as GoogleLoginResponse).googleId !== undefined;
}

export type GoogleLoginHandler = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void;

export function useHandleGoogleResponse(): GoogleLoginHandler {
  const dispatch = useDispatch();
  return async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    if (!isGoogleLoginResponse(response)) {
      return;
    }

    const id_token = response.getAuthResponse().id_token;
    const payload = {"id_token": id_token};
    try {
      const loginResponse = await sendRequest(Login, payload);
      dispatch({
        type: "login.authenticated",
        feedbackKey: loginResponse.feedback_key,
      });
    } catch (e) {
    }
  };
}

export function useRequestValidationCode() {
  const dispatch = useDispatch();
  return async (email: string) => {
    const payload = {"email": email};
    try {
      await sendRequest(ValidationCode, payload);
      dispatch({
        type: "login.validateCode",
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
      "email_authentication": {
        "email": email,
        "validation_code": code,
      }
    };
    try {
      const loginResponse = await sendRequest(Login, payload);
      dispatch({
        type: "login.authenticated",
        feedbackKey: loginResponse.feedback_key,
      });
    } catch (e) {
    }
  };
}