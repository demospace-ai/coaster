export type AppAction =
  | {
      type: "loading";
    }
  | {
      type: "done";
    }
  | {
      type: "forbidden";
    }
  | {
      type: "toast";
      toast?: ToastDetails;
    };

const INITIAL_APP_STATE: AppState = {
  loading: true,
  forbidden: false,
  toast: undefined,
};

export interface ToastDetails {
  type: "error" | "success" | "info";
  duration?: number;
  content: React.ReactNode;
}

export interface AppState {
  loading: boolean;
  forbidden: boolean;
  toast?: ToastDetails;
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
    case "toast":
      return {
        ...state,
        toast: action.toast,
      };
    default:
      return state;
  }
}
