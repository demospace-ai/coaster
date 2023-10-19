import { User } from "src/rpc/types";

const INITIAL_LOGIN_STATE: LoginState = {
  authenticated: false,
  error: null,
  modalOpen: false,
  create: false,
};

export interface LoginState {
  authenticated: boolean;
  modalOpen: boolean;
  create: boolean;
  user?: User;
  email?: string;
  error: string | null;
}

export type LoginAction =
  | {
      type: "login.authenticated";
      user: User;
    }
  | {
      type: "login.validateCode";
      email: string;
    }
  | {
      type: "login.update";
      user: User;
    }
  | {
      type: "login.logout";
    }
  | {
      type: "login.error";
      error: string | null;
    }
  | {
      type: "login.openLogin";
    }
  | {
      type: "login.openSignup";
    }
  | {
      type: "login.close";
    };

export function loginReducer(state: LoginState = INITIAL_LOGIN_STATE, action: LoginAction): LoginState {
  switch (action.type) {
    case "login.authenticated":
      return {
        ...state,
        authenticated: true,
        user: action.user,
      };
    case "login.logout":
      // simplify by just going back to initial state
      return INITIAL_LOGIN_STATE;
    case "login.update":
      return {
        ...state,
        user: action.user,
      };
    case "login.error":
      return {
        ...state,
        error: action.error,
      };
    case "login.openLogin":
      return {
        ...state,
        modalOpen: true,
        create: false,
      };
    case "login.openSignup":
      return {
        ...state,
        modalOpen: true,
        create: true,
      };
    case "login.close":
      return {
        ...state,
        modalOpen: false,
      };
    default:
      return state;
  }
}
