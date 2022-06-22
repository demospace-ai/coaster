import { useCallback } from 'react';
import { useDispatch } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { CheckSession } from 'src/rpc/api';

export function useStart() {
  const dispatch = useDispatch();
  return useCallback(async () => {
    try {
      const checkSessionResponse = await sendRequest(CheckSession);
      dispatch({
        type: 'login.authenticated',
        user: checkSessionResponse.user,
        organization: checkSessionResponse.organization,
      });
    } catch (e) {
    }

    dispatch({ type: 'done' });
  }, [dispatch]);
}