import { useDispatch } from 'src/root/model';
import { sendRequest } from 'src/rpc/ajax';
import { CheckSession } from 'src/rpc/api';

export function useStart() {
  const dispatch = useDispatch();
  return async () => {
    try {
      const checkSessionResponse = await sendRequest(CheckSession);
      dispatch({
        type: "login.authenticated",
      });
    } catch (e) {
    }

    dispatch({type: "done"});
  };
}