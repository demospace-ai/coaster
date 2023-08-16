import { H } from "highlight.run";
import { useCallback } from "react";
import { rudderanalytics } from "src/app/rudder";
import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import { Logout } from "src/rpc/api";
import { User } from "src/rpc/types";
import { isProd } from "src/utils/env";

export function useOnLoginSuccess() {
  return useCallback(async (user: User) => {
    identifyUser(user);
  }, []);
}

function identifyUser(user: User) {
  if (isProd()) {
    rudderanalytics.identify(user.id.toString(), {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
    });

    H.identify(user.email, {
      id: user.id.toString(),
    });
  }
}

export function useLogout() {
  const dispatch = useDispatch();

  return useCallback(async () => {
    rudderanalytics.reset();

    await sendRequest(Logout);
    dispatch({
      type: "login.logout",
    });
  }, [dispatch]);
}
