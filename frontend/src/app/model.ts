export type AppAction =
  | {
    type: "loading";
  }
  | {
    type: "done";
  }
  | {
    type: "forbidden";
  };

const INITIAL_APP_STATE: AppState = {
  loading: true,
  forbidden: false,
};

export interface AppState {
  loading: boolean;
  forbidden: boolean;
}

export function appReducer(state: AppState = INITIAL_APP_STATE, action: AppAction): AppState {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        loading: true,
      };
    case "done":
      return {
        ...state,
        loading: false,
      };
    case "forbidden":
      return {
        ...state,
        forbidden: true,
      };
    default:
      return state;
  }
}