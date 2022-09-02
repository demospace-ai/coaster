import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { rudderanalytics } from 'src/app/rudder';
import { useDispatch } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { GetAllUsers, GetAssignedQuestions, Login, Logout, Organization, SetOrganization, User } from 'src/rpc/api';

export type GoogleLoginResponse = {
  credential: string;
};

export type GoogleLoginHandler = (response: GoogleLoginResponse) => Promise<void>;

export function useHandleGoogleResponse(): GoogleLoginHandler {
  const dispatch = useDispatch();
  const onLoginSuccess = useOnLoginSuccess();

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

      onLoginSuccess(loginResponse.user, loginResponse.organization);
    } catch (e) {
    }
  }, [dispatch, onLoginSuccess]);
}

export interface OrganizationArgs {
  organizationName?: string;
  organizationID?: number;
}

export function useSetOrganization() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onLoginSuccess = useOnLoginSuccess();

  return useCallback(async (user: User, args: OrganizationArgs) => {
    const payload = { 'organization_name': args.organizationName, 'organization_id': args.organizationID };
    try {
      const response = await sendRequest(SetOrganization, payload);
      dispatch({
        type: 'login.organizationSet',
        organization: response.organization,
      });

      onLoginSuccess(user, response.organization);
      navigate("/");
    } catch (e) {
    }
  }, [dispatch, navigate, onLoginSuccess]);
}

export function useOnLoginSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(async (user: User, organization: Organization | undefined) => {
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
  }, [dispatch, navigate]);
}

export function useLogout() {
  const dispatch = useDispatch();
  rudderanalytics.reset();

  return useCallback(async () => {
    await sendRequest(Logout);
    dispatch({
      type: 'login.logout',
    });
  }, [dispatch]);
}