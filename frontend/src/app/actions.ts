import { useCallback } from 'react';
import { useOnLoginSuccess } from 'src/pages/login/actions';
import { useDispatch } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { CheckSession } from 'src/rpc/api';

export function useStart() {
  const dispatch = useDispatch();
  const onLoginSuccess = useOnLoginSuccess();

  return useCallback(async () => {
    try {
      const checkSessionResponse = await sendRequest(CheckSession);
      dispatch({
        type: 'login.authenticated',
        user: checkSessionResponse.user,
        organization: checkSessionResponse.organization,
        suggestedOrganizations: checkSessionResponse.suggested_organizations,
      });

      onLoginSuccess(checkSessionResponse.user, checkSessionResponse.organization);
    } catch (e) {
    }

    dispatch({ type: 'done' });
  }, [dispatch, onLoginSuccess]);
}