import { Dispatch } from "react";
import { createSelectorHook, useDispatch as useReactDispatch } from "react-redux";
import { combineReducers, createStore as createReduxStore } from "redux";
import { AppAction, appReducer, AppState } from "src/components/app/model";
import { LoginAction, loginReducer, LoginState } from "src/components/login/model";
import { SearchAction, searchReducer, SearchState } from "src/components/search/model";

export type RootAction = AppAction | LoginAction | SearchAction;

export interface RootState {
  app: AppState;
  login: LoginState;
  search: SearchState;
}

export const useDispatch = () => useReactDispatch<Dispatch<RootAction>>();
export const useSelector = createSelectorHook<RootState>();

export function createStore() {
  const rootReducer = combineReducers({app: appReducer, login: loginReducer, search: searchReducer});

  return createReduxStore(rootReducer);
}