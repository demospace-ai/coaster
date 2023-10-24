const INITIAL_LOGIN_STATE: LoginState = {
  modalOpen: false,
  create: false,
};

export interface LoginState {
  modalOpen: boolean;
  create: boolean;
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
