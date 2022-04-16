export type AppAction = 
| {
  type: "loading"
}
| {
  type: "done"
};

const INITIAL_APP_STATE: AppState = {
  loading: true,
}

export interface AppState {
  loading: boolean;
}

export function appReducer(state: AppState = INITIAL_APP_STATE, action: AppAction): AppState {
  switch (action.type) {
    case "loading":
    return {
      ...state,
      loading: true,
    }
    case "done":
    return {
      ...state,
      loading: false,
    }
    default:
    return state;
  }
}