import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import { Post, Search } from "src/rpc/api";

export function useSearch() {
  const dispatch = useDispatch();
  return async (query: string) => {
    const payload = { 'search_query': query };
    try {
      const response = await sendRequest(Search, payload);
      dispatch({
        type: 'search.results',
        results: response.posts,
      });
    } catch (e) {
    }
  };
}

export function useSetResults() {
  const dispatch = useDispatch();
  return (results: Post[]) => {
    dispatch({
      type: 'search.results',
      results: results,
    });
  };
}
