import { Analysis } from "src/rpc/api";

const INITIAL_SEARCH_STATE: SearchState = {
  query: '',
  results: [],
};

export interface SearchState {
  query: string,
  results: Analysis[],
}

export type SearchAction =
  | {
    type: 'search.results',
    results: Analysis[],
  }
  | {
    type: 'search.query',
    query: string,
  };

export function searchReducer(state: SearchState = INITIAL_SEARCH_STATE, action: SearchAction): SearchState {
  switch (action.type) {
    case 'search.results':
      return {
        ...state,
        results: action.results,
      };
    case 'search.query':
      return {
        ...state,
        query: action.query,
      };
    default:
      return state;
  }
}