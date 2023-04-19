import { H } from "highlight.run";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { rudderanalytics } from "src/app/rudder";
import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import { Logout, Organization, SetOrganization, User } from "src/rpc/api";

export interface OrganizationArgs {
  organizationName?: string;
  organizationID?: number;
}

export function useSetOrganization() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onLoginSuccess = useOnLoginSuccess();

  return useCallback(async (user: User, args: OrganizationArgs) => {
    const payload = { "organization_name": args.organizationName, "organization_id": args.organizationID };
    try {
      const response = await sendRequest(SetOrganization, payload);
      dispatch({
        type: "login.organizationSet",
        organization: response.organization,
      });

      onLoginSuccess(user, response.organization);
      navigate("/");
    } catch (e) {
      // TODO
    }
  }, [dispatch, navigate, onLoginSuccess]);
}

export function useOnLoginSuccess() {
  const navigate = useNavigate();

  return useCallback(async (user: User, organization: Organization | undefined) => {
    rudderanalytics.identify(user.id.toString(), {
      "name": `${user.name}`,
      "email": user.email
    });

    H.identify(user.email, {
      id: user.id.toString(),
    });

    // If there's no organization, go to the login page so the user can set it
    if (!organization) {
      navigate("/login");
      return;
    }
  }, [navigate]);
}

export function useLogout() {
  const dispatch = useDispatch();
  rudderanalytics.reset();

  return useCallback(async () => {
    await sendRequest(Logout);
    dispatch({
      type: "login.logout",
    });
  }, [dispatch]);
}