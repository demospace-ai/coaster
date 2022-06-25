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
  users?: User[];
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
  }
  | {
    type: 'login.organizationSet',
    organization: Organization,
  }
  | {
    type: 'login.allUsers',
    users: User[],
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
    case 'login.organizationSet':
      return {
        ...state,
        organization: action.organization,
      };
    case 'login.allUsers':
      return {
        ...state,
        users: action.users,
      };
    default:
      return state;
  }
}