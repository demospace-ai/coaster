import { Dispatch } from "react";
import { createSelectorHook, useDispatch as useReactDispatch } from "react-redux";
import { combineReducers, createStore as createReduxStore } from "redux";
import { AppAction, appReducer, AppState } from "src/components/app/model";
import { LoginAction, loginReducer, LoginState } from "src/components/login/model";

export type RootAction = AppAction | LoginAction;

export interface RootState {
  app: AppState;
  login: LoginState;
}

export const useDispatch = () => useReactDispatch<Dispatch<RootAction>>();
export const useSelector = createSelectorHook<RootState>();

export function createStore() {
  const rootReducer = combineReducers({app: appReducer, login: loginReducer});

  return createReduxStore(rootReducer);
}