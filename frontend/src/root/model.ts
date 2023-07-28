import { configureStore } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import { createSelectorHook, useDispatch as useReactDispatch } from "react-redux";
import { combineReducers } from "redux";
import { AppAction, AppState, appReducer } from "src/app/model";
import { LoginAction, LoginState, loginReducer } from "src/pages/login/model";

export type RootAction = AppAction | LoginAction;

export interface RootState {
  app: AppState;
  login: LoginState;
}

export const useDispatch = () => useReactDispatch<Dispatch<RootAction>>();
export const useSelector = createSelectorHook<RootState>();

export function createStore() {
  const rootReducer = combineReducers({ app: appReducer, login: loginReducer });

  return configureStore({ reducer: rootReducer });
}
