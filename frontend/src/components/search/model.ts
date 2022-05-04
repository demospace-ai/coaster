import { Post } from "src/rpc/api";

const INITIAL_SEARCH_STATE: SearchState = {
  searching: false,
};

export interface SearchState {
  searching: boolean,
  results?: Post[],
}

export type SearchAction = 
| {
  type: "search.searching",
}
| {
  type: "search.results",
  results: Post[],
};

export function searchReducer(state: SearchState = INITIAL_SEARCH_STATE, action: SearchAction): SearchState {
  switch (action.type) {
    case "search.searching":
    return {
      ...state,
      searching: true,
    }
    case "search.results":
    return {
      ...state,
      searching: false,
      results: action.results,
    }
    default:
    return state;
  }
}