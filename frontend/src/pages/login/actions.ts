import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginStep } from 'src/pages/login/Login';
import { useDispatch } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { Login, SetOrganization, ValidationCode } from 'src/rpc/api';

export type GoogleLoginResponse = {
  credential: string;
};

export type GoogleLoginHandler = (response: GoogleLoginResponse) => void;

export function useHandleGoogleResponse(): GoogleLoginHandler {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return async (response: GoogleLoginResponse) => {
    const id_token = response.credential;
    const payload = { 'id_token': id_token };
    try {
      const loginResponse = await sendRequest(Login, payload);
      dispatch({
        type: 'login.authenticated',
        user: loginResponse.user,
        organization: loginResponse.organization,
        suggestedOrganizations: loginResponse.suggested_organizations,
      });

      if (loginResponse.organization) {
        navigate("/");
      }
    } catch (e) {
    }
  };
}

export interface OrganizationArgs {
  organizationName?: string;
  organizationID?: number;
}

export function useSetOrganization() {
  return async (args: OrganizationArgs) => {
    const payload = { 'organization_name': args.organizationName, 'organization_id': args.organizationID };
    try {
      await sendRequest(SetOrganization, payload);
    } catch (e) {
    }
  };
}

export function useRequestValidationCode(setStep: React.Dispatch<React.SetStateAction<LoginStep>>) {
  return async (email: string) => {
    const payload = { 'email': email };
    try {
      await sendRequest(ValidationCode, payload);
      setStep(LoginStep.ValidateCode);
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
        user: loginResponse.user,
        organization: loginResponse.organization,
        suggestedOrganizations: loginResponse.suggested_organizations,
      });
    } catch (e) {
    }
  };
}