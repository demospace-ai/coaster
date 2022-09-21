import { useCallback } from "react";
import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import { Analysis, Search } from "src/rpc/api";

export function useSearch() {
  const dispatch = useDispatch();
  return useCallback(async (query: string) => {
    const payload = { 'search_query': query };
    try {
      const response = await sendRequest(Search, payload);
      dispatch({
        type: 'search.results',
        results: response.analyses,
      });
    } catch (e) {
    }
  }, [dispatch]);
}

export function useSetResults() {
  const dispatch = useDispatch();
  return useCallback((results: Analysis[]) => {
    dispatch({
      type: 'search.results',
      results: results,
    });
  }, [dispatch]);
};
