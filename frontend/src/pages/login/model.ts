import { Organization, User } from "src/rpc/api";

const INITIAL_LOGIN_STATE: LoginState = {
  authenticated: false,
  validatingCode: false,
};

export interface LoginState {
  authenticated: boolean;
  validatingCode: boolean;
  user?: User;
  organization?: Organization;
  suggestedOrganizations?: Organization[];
  email?: string;
}

export type LoginAction =
  | {
    type: 'login.authenticated',
    user: User,
    organization?: Organization,
    suggestedOrganizations?: Organization[],
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
        user: action.user,
        organization: action.organization,
        suggestedOrganizations: action.suggestedOrganizations,
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