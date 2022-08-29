import React, { Dispatch, useCallback } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { rudderanalytics } from 'src/app/rudder';
import { LoginStep } from 'src/pages/login/Login';
import { RootAction, useDispatch, useSelector } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { GetAllUsers, GetAssignedQuestions, Login, Logout, Organization, SetOrganization, User, ValidationCode } from 'src/rpc/api';

export type GoogleLoginResponse = {
  credential: string;
};

export type GoogleLoginHandler = (response: GoogleLoginResponse) => void;

export function useHandleGoogleResponse(setLoading: (loading: boolean) => void): GoogleLoginHandler {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(async (response: GoogleLoginResponse) => {
    setLoading(true);
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

      onLoginSuccess(loginResponse.user, loginResponse.organization, dispatch, navigate);
      setLoading(false);
    } catch (e) {
    }
  }, []);
}

export interface OrganizationArgs {
  organizationName?: string;
  organizationID?: number;
}

export function useSetOrganization() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.login.user);

  return useCallback(async (args: OrganizationArgs) => {
    const payload = { 'organization_name': args.organizationName, 'organization_id': args.organizationID };
    try {
      const response = await sendRequest(SetOrganization, payload);
      dispatch({
        type: 'login.organizationSet',
        organization: response.organization,
      });

      onLoginSuccess(user!, response.organization, dispatch, navigate);
      navigate("/");
    } catch (e) {
    }
  }, []);
}

export function useRequestValidationCode(setStep: React.Dispatch<React.SetStateAction<LoginStep>>) {
  return useCallback(async (email: string) => {
    const payload = { 'email': email };
    try {
      await sendRequest(ValidationCode, payload);
      setStep(LoginStep.ValidateCode);
    } catch (e) {
    }
  }, []);
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
  }, []);
}

export async function onLoginSuccess(user: User, organization: Organization | undefined, dispatch: Dispatch<RootAction>, navigate: NavigateFunction) {
  rudderanalytics.identify(user.id.toString());
  // If there's no organization, go to the login page so the user can set it
  if (!organization) {
    navigate("/login");
  }

  try {
    const allUsers = await sendRequest(GetAllUsers);
    dispatch({
      type: 'login.allUsers',
      users: allUsers.users,
    });

    const assignedQuestions = await sendRequest(GetAssignedQuestions);
    dispatch({
      type: 'login.assignedQuestions',
      assignedQuestions: assignedQuestions.questions,
    });
  } catch (e) {
  }
}

export function useLogout() {
  const dispatch = useDispatch();
  rudderanalytics.reset();

  return useCallback(async () => {
    await sendRequest(Logout);
    dispatch({
      type: 'login.logout',
    });
  }, []);
}