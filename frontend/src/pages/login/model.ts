
const INITIAL_LOGIN_STATE: LoginState = {
  authenticated: false,
  validatingCode: false,
};

export interface LoginState {
  authenticated: boolean;
  validatingCode: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type LoginAction =
  | {
    type: 'login.authenticated',
    firstName: string,
    lastName: string,
  }
  | {
    type: 'login.validateCode',
    email: string,
  }
  | {
    type: 'login.logout';
  };

export function loginReducer(state: LoginState = INITIAL_LOGIN_STATE, action: LoginAction): LoginState {
  switch (action.type) {
    case 'login.authenticated':
      return {
        ...state,
        authenticated: true,
        firstName: action.firstName,
        lastName: action.lastName,
      };
    case 'login.validateCode':
      return {
        ...state,
        validatingCode: true,
        email: action.email,
      };
    case 'login.logout':
      return {
        ...state,
        authenticated: false,
      };
    default:
      return state;
  }
}