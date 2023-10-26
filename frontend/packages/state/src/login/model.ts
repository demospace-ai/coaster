import { User } from "@coaster/types";

const INITIAL_LOGIN_STATE: LoginState = {
  modalOpen: false,
  create: false,
  user: undefined,
};

export interface LoginState {
  modalOpen: boolean;
  create: boolean;
  user: User | undefined;
}

export type LoginAction =
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
