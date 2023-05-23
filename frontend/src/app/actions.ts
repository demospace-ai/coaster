import { useCallback } from "react";
import { useOnLoginSuccess } from "src/pages/login/actions";
import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import { CheckSession } from "src/rpc/api";
import { HttpError, consumeError } from "src/utils/errors";

export function useStart() {
  const dispatch = useDispatch();
  const onLoginSuccess = useOnLoginSuccess();

  return useCallback(async () => {
    try {
      const checkSessionResponse = await sendRequest(CheckSession);
      throw new Error("Failed to authenticate");
      dispatch({
        type: "login.authenticated",
        user: checkSessionResponse.user,
        organization: checkSessionResponse.organization,
        suggestedOrganizations: checkSessionResponse.suggested_organizations,
      });

      onLoginSuccess(checkSessionResponse.user, checkSessionResponse.organization);
      dispatch({ type: "login.error", error: null });
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.code === 403) {
          dispatch({ type: "forbidden" });
        }
      }
      dispatch({ type: "login.error", error: e?.toString() ?? JSON.stringify(e) });
      consumeError(e);
    }

    dispatch({ type: "done" });
  }, [dispatch, onLoginSuccess]);
}
