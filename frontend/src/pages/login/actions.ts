import React, { useCallback } from 'react';
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

  return useCallback(async (response: GoogleLoginResponse) => {
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

      // If there's no organization, stay on the login page so the user can set it
      if (loginResponse.organization) {
        navigate("/");
      }
    } catch (e) {
    }
  }, [dispatch, navigate]);
}

export interface OrganizationArgs {
  organizationName?: string;
  organizationID?: number;
}

export function useSetOrganization() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return async (args: OrganizationArgs) => {
    const payload = { 'organization_name': args.organizationName, 'organization_id': args.organizationID };
    try {
      const response = await sendRequest(SetOrganization, payload);
      dispatch({
        type: 'login.organizationSet',
        organization: response.organization,
      });

      navigate("/");
    } catch (e) {
    }
  };
}

export function useRequestValidationCode(setStep: React.Dispatch<React.SetStateAction<LoginStep>>) {
  return useCallback(async (email: string) => {
    const payload = { 'email': email };
    try {
      await sendRequest(ValidationCode, payload);
      setStep(LoginStep.ValidateCode);
    } catch (e) {
    }
  }, [setStep]);
}

export function useEmailLogin() {
  const dispatch = useDispatch();
  return useCallback(async (email: string, code: string) => {
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
  }, [dispatch]);
}