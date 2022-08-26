import { Organization, Post, User } from "src/rpc/api";

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
  assignedQuestions?: Post[];
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
  }
  | {
    type: 'login.assignedQuestions',
    assignedQuestions: Post[],
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
      // simplify by just going back to initial state
      return INITIAL_LOGIN_STATE;
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
    case 'login.assignedQuestions':
      return {
        ...state,
        assignedQuestions: action.assignedQuestions,
      };
    default:
      return state;
  }
}