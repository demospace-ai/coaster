export type AppAction =
  | {
    type: 'loading';
  }
  | {
    type: 'done';
  }
  | {
    type: 'showNewQuestionModal',
    showNewQuestionModal: boolean;
  };

const INITIAL_APP_STATE: AppState = {
  loading: true,
  showNewQuestionModal: false,
};

export interface AppState {
  loading: boolean;
  showNewQuestionModal: boolean;
}

export function appReducer(state: AppState = INITIAL_APP_STATE, action: AppAction): AppState {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        loading: true,
      };
    case 'done':
      return {
        ...state,
        loading: false,
      };
    case 'showNewQuestionModal':
      return {
        ...state,
        showNewQuestionModal: action.showNewQuestionModal,
      };
    default:
      return state;
  }
}